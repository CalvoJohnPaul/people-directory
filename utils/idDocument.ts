/** biome-ignore-all lint/suspicious/noExplicitAny: "" */

import {loadOpenCV, type OpenCV} from '@opencvjs/web';

type QuadPoints = [OpenCV.Point, OpenCV.Point, OpenCV.Point, OpenCV.Point];

export interface IdDocumentCropPoints {
  topLeft: OpenCV.Point;
  topRight: OpenCV.Point;
  bottomRight: OpenCV.Point;
  bottomLeft: OpenCV.Point;
}

export interface IdDocumentDetectionResult {
  detected: boolean;
  blurry: boolean;
  tooDark: boolean;
  tooBright: boolean;
  tooFar: boolean;
  tooClose: boolean;
  glare: boolean;
  cropPoints: IdDocumentCropPoints | null;
  tilted: boolean;
  file: File;
}

/* Higher means stricter blur validation (more images flagged as blurry). */
const BLUR_THRESHOLD = 120;
/* Higher means less strict glare validation (allow more glare before failing). */
const GLARE_THRESHOLD = 22;
/* Higher means less strict glare pixel detection (only very bright pixels count as glare). */
const GLARE_VALUE_THRESHOLD = 253;
/* Lower means stricter low-light validation (more images flagged as too dark). */
const BRIGHTNESS_MIN = 40;
/* Lower means stricter bright-light validation (more images flagged as too bright). */
const BRIGHTNESS_MAX = 230;
/* Expected width/height ratio of the ID card. */
const CARD_ASPECT_RATIO = 1.586;
/* Higher means less strict aspect ratio matching for card candidates. */
const CARD_ASPECT_TOLERANCE = 0.32;
/* Higher means stricter final card confidence requirement. */
const CONFIDENCE_THRESHOLD = 0.48;
/* Higher means stricter distance check for being too far. */
const TOO_FAR_AREA_RATIO = 0.25;
/* Lower means stricter distance check for being too close. */
const TOO_CLOSE_AREA_RATIO = 0.85;
/* Lower means stricter tilt validation (more images flagged as tilted). */
const MAX_SKEW_ANGLE = 5;
/* JPEG quality for generated output files (0-1). */
const OUTPUT_IMAGE_QUALITY = 0.92;
/* Processing downscale factor for detection speed and stability. */
const PROCESS_SCALE = 0.6;

const $cv: typeof OpenCV | null = null;

async function $getCv(): Promise<typeof OpenCV> {
  if (!$cv) return await loadOpenCV();
  return $cv;
}

function $createPoint(x: number, y: number): OpenCV.Point {
  return {x, y} as OpenCV.Point;
}

function $sortPoints(points: Array<{x: number; y: number}>): QuadPoints {
  const sum = points.map((p) => p.x + p.y);
  const diff = points.map((p) => p.y - p.x);

  return [
    $createPoint(points[sum.indexOf(Math.min(...sum))].x, points[sum.indexOf(Math.min(...sum))].y),
    $createPoint(
      points[diff.indexOf(Math.min(...diff))].x,
      points[diff.indexOf(Math.min(...diff))].y,
    ),
    $createPoint(points[sum.indexOf(Math.max(...sum))].x, points[sum.indexOf(Math.max(...sum))].y),
    $createPoint(
      points[diff.indexOf(Math.max(...diff))].x,
      points[diff.indexOf(Math.max(...diff))].y,
    ),
  ];
}

function $pointsFromQuadMat(quad: OpenCV.Mat): QuadPoints {
  const pts = quad.data32S as Int32Array;
  return [
    $createPoint(pts[0], pts[1]),
    $createPoint(pts[2], pts[3]),
    $createPoint(pts[4], pts[5]),
    $createPoint(pts[6], pts[7]),
  ];
}

function $pointsFromRotatedRect(rect: {
  center: {x: number; y: number};
  size: {width: number; height: number};
  angle: number;
}): QuadPoints {
  const theta = (rect.angle * Math.PI) / 180;
  const a = Math.sin(theta) * 0.5;
  const b = Math.cos(theta) * 0.5;
  const cx = rect.center.x;
  const cy = rect.center.y;
  const w = rect.size.width;
  const h = rect.size.height;

  const p0 = {x: cx - a * h - b * w, y: cy + b * h - a * w};
  const p1 = {x: cx + a * h - b * w, y: cy - b * h - a * w};
  const p2 = {x: 2 * cx - p0.x, y: 2 * cy - p0.y};
  const p3 = {x: 2 * cx - p1.x, y: 2 * cy - p1.y};

  return [
    $createPoint(p0.x, p0.y),
    $createPoint(p1.x, p1.y),
    $createPoint(p2.x, p2.y),
    $createPoint(p3.x, p3.y),
  ];
}

function $normalizeCardAngle(angle: number, width: number, height: number): number {
  let normalized = angle;

  if (width < height) {
    normalized += 90;
  }

  if (normalized > 45) normalized -= 90;
  if (normalized < -45) normalized += 90;

  return normalized;
}

function $toCropPoints(corners: QuadPoints): IdDocumentCropPoints {
  return {
    topLeft: corners[0],
    topRight: corners[1],
    bottomRight: corners[2],
    bottomLeft: corners[3],
  };
}

async function $detectCard(gray: OpenCV.Mat, sourceWidth: number, sourceHeight: number) {
  const cv = await $getCv();
  const blurred = new cv.Mat();
  const edges = new cv.Mat();
  const binary = new cv.Mat();
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
  const contoursEdges = new cv.MatVector();
  const hierarchyEdges = new cv.Mat();
  const contoursBinary = new cv.MatVector();
  const hierarchyBinary = new cv.Mat();

  try {
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    cv.Canny(blurred, edges, 50, 150);
    cv.morphologyEx(edges, edges, cv.MORPH_CLOSE, kernel);
    cv.dilate(edges, edges, kernel);

    cv.threshold(blurred, binary, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
    cv.morphologyEx(binary, binary, cv.MORPH_CLOSE, kernel);

    cv.findContours(edges, contoursEdges, hierarchyEdges, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    cv.findContours(binary, contoursBinary, hierarchyBinary, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    let bestPoints: QuadPoints | null = null;
    let bestRect: {x: number; y: number; width: number; height: number} | null = null;
    let bestAngle = 0;
    let bestConfidence = 0;

    const imageArea = sourceWidth * sourceHeight;
    const minArea = imageArea * 0.03;
    const borderMargin = Math.max(6, Math.round(Math.min(sourceWidth, sourceHeight) * 0.02));

    function consumeContours(container: OpenCV.MatVector) {
      for (let i = 0; i < container.size(); i++) {
        const cnt = container.get(i);
        const area = cv.contourArea(cnt);

        if (area < minArea) {
          cnt.delete();
          continue;
        }

        const bounds = cv.boundingRect(cnt);
        const touchesBorder =
          bounds.x <= borderMargin ||
          bounds.y <= borderMargin ||
          bounds.x + bounds.width >= sourceWidth - borderMargin ||
          bounds.y + bounds.height >= sourceHeight - borderMargin;

        const peri = cv.arcLength(cnt, true);
        const approx = new cv.Mat();
        cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
        const isValidQuad = approx.rows === 4 && cv.isContourConvex(approx);

        const rect = cv.minAreaRect(cnt);
        const rw = Math.max(rect.size.width, rect.size.height);
        const rh = Math.min(rect.size.width, rect.size.height);
        const rectArea = rw * rh;
        const aspect = rh > 0 ? rw / rh : 0;
        const fill = rectArea > 0 ? area / rectArea : 0;

        const aspectScore = Math.max(0, 1 - Math.abs(aspect - CARD_ASPECT_RATIO) / 0.65);
        const areaScore = Math.min(1, rectArea / (imageArea * 0.65));
        const fillScore = Math.max(0, Math.min(1, (fill - 0.3) / 0.7));
        const borderScore = touchesBorder ? 0.8 : 1;
        const confidence =
          (aspectScore * 0.45 + areaScore * 0.3 + fillScore * 0.25) * borderScore +
          (isValidQuad ? 0.05 : 0);

        const looksLikeCard =
          aspect >= CARD_ASPECT_RATIO - CARD_ASPECT_TOLERANCE &&
          aspect <= CARD_ASPECT_RATIO + CARD_ASPECT_TOLERANCE &&
          fill >= 0.4 &&
          !touchesBorder;

        if (looksLikeCard && confidence > bestConfidence) {
          const points = isValidQuad
            ? $sortPoints($pointsFromQuadMat(approx))
            : $sortPoints($pointsFromRotatedRect(rect));

          const xs = points.map((point) => point.x);
          const ys = points.map((point) => point.y);

          bestPoints = points;
          bestRect = {
            x: Math.min(...xs),
            y: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys),
          };
          bestAngle = $normalizeCardAngle(rect.angle, rect.size.width, rect.size.height);
          bestConfidence = confidence;
        }

        approx.delete();
        cnt.delete();
      }
    }

    consumeContours(contoursEdges);
    consumeContours(contoursBinary);

    if (!bestPoints || !bestRect || bestConfidence < CONFIDENCE_THRESHOLD) {
      return {
        detected: false,
        corners: null,
        bounds: null,
        angle: 0,
      };
    }

    return {
      detected: true,
      corners: bestPoints,
      bounds: bestRect,
      angle: bestAngle,
    };
  } finally {
    blurred.delete();
    edges.delete();
    binary.delete();
    kernel.delete();
    contoursEdges.delete();
    hierarchyEdges.delete();
    contoursBinary.delete();
    hierarchyBinary.delete();
  }
}

async function $detectBlur(gray: OpenCV.Mat, corners: QuadPoints) {
  const cv = await $getCv();
  const cardWidth = 320;
  const cardHeight = Math.round(cardWidth / CARD_ASPECT_RATIO);

  const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
    corners[0].x,
    corners[0].y,
    corners[1].x,
    corners[1].y,
    corners[2].x,
    corners[2].y,
    corners[3].x,
    corners[3].y,
  ]);

  const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0,
    0,
    cardWidth,
    0,
    cardWidth,
    cardHeight,
    0,
    cardHeight,
  ]);

  const transform = cv.getPerspectiveTransform(srcPts, dstPts);
  const warped = new cv.Mat();

  const marginX = Math.round(cardWidth * 0.2);
  const marginY = Math.round(cardHeight * 0.2);

  const laplacian = new cv.Mat();
  const mean = new cv.Mat();
  const stddev = new cv.Mat();

  try {
    cv.warpPerspective(
      gray,
      warped,
      transform,
      new cv.Size(cardWidth, cardHeight),
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      new cv.Scalar(),
    );

    const textRegion = warped.roi(
      new cv.Rect(marginX, marginY, cardWidth - 2 * marginX, cardHeight - 2 * marginY),
    );

    cv.Laplacian(textRegion, laplacian, cv.CV_64F);
    cv.meanStdDev(laplacian, mean, stddev);

    const score = stddev.doubleAt(0, 0) ** 2;
    textRegion.delete();
    return score;
  } finally {
    srcPts.delete();
    dstPts.delete();
    transform.delete();
    warped.delete();
    laplacian.delete();
    mean.delete();
    stddev.delete();
  }
}

async function $detectGlare(hsv: OpenCV.Mat) {
  const cv = await $getCv();
  const channels = new cv.MatVector();
  const thresholded = new cv.Mat();

  try {
    cv.split(hsv, channels);
    const valueChannel = channels.get(2);
    cv.threshold(valueChannel, thresholded, GLARE_VALUE_THRESHOLD, 255, cv.THRESH_BINARY);
    const overexposed = cv.countNonZero(thresholded);
    const totalPixels = valueChannel.rows * valueChannel.cols;
    const glareRatio = totalPixels > 0 ? (overexposed / totalPixels) * 100 : 0;

    return {
      glare: glareRatio > GLARE_THRESHOLD,
    };
  } finally {
    for (let i = 0; i < channels.size(); i++) {
      channels.get(i).delete();
    }

    channels.delete();
    thresholded.delete();
  }
}

async function $analyzeBrightness(hsv: OpenCV.Mat) {
  const cv = await $getCv();
  const channels = new cv.MatVector();
  const mean = new cv.Mat();
  const stddev = new cv.Mat();

  try {
    cv.split(hsv, channels);
    const valueChannel = channels.get(2);
    cv.meanStdDev(valueChannel, mean, stddev);
    const brightnessMean = mean.doubleAt(0, 0);

    let brightnessStatus: 'DARK' | 'BRIGHT' | null = null;

    if (brightnessMean < BRIGHTNESS_MIN) {
      brightnessStatus = 'DARK';
    } else if (brightnessMean > BRIGHTNESS_MAX) {
      brightnessStatus = 'BRIGHT';
    }

    return {
      brightnessStatus,
    };
  } finally {
    for (let i = 0; i < channels.size(); i++) {
      channels.get(i).delete();
    }

    channels.delete();
    mean.delete();
    stddev.delete();
  }
}

function $isTilted(angle: number): boolean {
  return Math.abs(angle) > MAX_SKEW_ANGLE;
}

function $getBoundsArea(
  bounds: {x: number; y: number; width: number; height: number} | null,
): number {
  if (!bounds) return 0;
  return bounds.width * bounds.height;
}

function $pointDistance(a: OpenCV.Point, b: OpenCV.Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

async function $fileToImageData(file: File): Promise<ImageData> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file for cropping.'));
    };

    img.src = objectUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to create canvas context for cropping.');
  }

  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

async function $canvasToFile(canvas: HTMLCanvasElement, filename: string): Promise<File> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', OUTPUT_IMAGE_QUALITY);
  });

  if (blob) {
    return new File([blob], filename, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  }

  const dataUrl = canvas.toDataURL('image/jpeg', OUTPUT_IMAGE_QUALITY);
  const response = await fetch(dataUrl);
  const fallbackBlob = await response.blob();

  return new File([fallbackBlob], filename, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

function $toLandscapeCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  if (canvas.width >= canvas.height) {
    return canvas;
  }

  const rotated = document.createElement('canvas');
  rotated.width = canvas.height;
  rotated.height = canvas.width;

  const context = rotated.getContext('2d');
  if (!context) {
    return canvas;
  }

  context.translate(rotated.width, 0);
  context.rotate(Math.PI / 2);
  context.drawImage(canvas, 0, 0);

  return rotated;
}

export async function detectIdDocument(imageData: ImageData): Promise<IdDocumentDetectionResult> {
  const cv = await $getCv();
  const src = cv.matFromImageData(imageData);
  const scaled = new cv.Mat();
  const scaledWidth = Math.max(1, Math.round(src.cols * PROCESS_SCALE));
  const scaledHeight = Math.max(1, Math.round(src.rows * PROCESS_SCALE));

  const gray = new cv.Mat();
  const rgb = new cv.Mat();
  const hsv = new cv.Mat();

  try {
    cv.resize(src, scaled, new cv.Size(scaledWidth, scaledHeight));

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = scaledWidth;
    outputCanvas.height = scaledHeight;
    cv.imshow(outputCanvas, scaled);
    const filePromise = $canvasToFile(outputCanvas, `id-document-${Date.now()}.jpg`);

    cv.cvtColor(scaled, gray, cv.COLOR_RGBA2GRAY);
    cv.cvtColor(scaled, rgb, cv.COLOR_RGBA2RGB);
    cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);

    const card = await $detectCard(gray, scaledWidth, scaledHeight);
    const cropPoints = card.detected && card.corners ? $toCropPoints(card.corners) : null;

    let blurry = true;

    if (card.detected && card.corners) {
      const blurScore = await $detectBlur(gray, card.corners);
      blurry = blurScore < BLUR_THRESHOLD;
    }

    const [glare, brightness] = await Promise.all([$detectGlare(hsv), $analyzeBrightness(hsv)]);

    const cardArea = $getBoundsArea(card.bounds);
    const frameArea = Math.max(1, scaledWidth * scaledHeight);
    const areaRatio = card.detected ? cardArea / frameArea : 0;

    const tilted = card.detected && $isTilted(card.angle);
    const tooDark = brightness.brightnessStatus === 'DARK';
    const tooBright = brightness.brightnessStatus === 'BRIGHT';
    const tooFar = card.detected && areaRatio < TOO_FAR_AREA_RATIO;
    const tooClose = card.detected && areaRatio > TOO_CLOSE_AREA_RATIO;
    const file = await filePromise;

    return {
      detected: card.detected,
      blurry,
      tooDark,
      tooBright,
      tooFar,
      tooClose,
      glare: glare.glare,
      cropPoints,
      tilted,
      file,
    };
  } finally {
    src.delete();
    scaled.delete();
    gray.delete();
    rgb.delete();
    hsv.delete();
  }
}

export async function cropIdDocument(file: File, cropPoints: IdDocumentCropPoints): Promise<File> {
  try {
    const cv = await $getCv();
    const imageData = await $fileToImageData(file);
    const src = cv.matFromImageData(imageData);

    const topWidth = $pointDistance(cropPoints.topLeft, cropPoints.topRight);
    const bottomWidth = $pointDistance(cropPoints.bottomLeft, cropPoints.bottomRight);
    const leftHeight = $pointDistance(cropPoints.topLeft, cropPoints.bottomLeft);
    const rightHeight = $pointDistance(cropPoints.topRight, cropPoints.bottomRight);

    const targetWidth = Math.max(1, Math.round(Math.max(topWidth, bottomWidth)));
    const targetHeight = Math.max(1, Math.round(Math.max(leftHeight, rightHeight)));

    const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
      cropPoints.topLeft.x,
      cropPoints.topLeft.y,
      cropPoints.topRight.x,
      cropPoints.topRight.y,
      cropPoints.bottomRight.x,
      cropPoints.bottomRight.y,
      cropPoints.bottomLeft.x,
      cropPoints.bottomLeft.y,
    ]);

    const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0,
      0,
      targetWidth - 1,
      0,
      targetWidth - 1,
      targetHeight - 1,
      0,
      targetHeight - 1,
    ]);

    const transform = cv.getPerspectiveTransform(srcPoints, dstPoints);
    const warped = new cv.Mat();

    try {
      cv.warpPerspective(
        src,
        warped,
        transform,
        new cv.Size(targetWidth, targetHeight),
        cv.INTER_LINEAR,
        cv.BORDER_REPLICATE,
        new cv.Scalar(),
      );

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = targetWidth;
      outputCanvas.height = targetHeight;
      cv.imshow(outputCanvas, warped);

      const normalizedCanvas = $toLandscapeCanvas(outputCanvas);
      return await $canvasToFile(normalizedCanvas, 'id-document-cropped.jpg');
    } finally {
      srcPoints.delete();
      dstPoints.delete();
      transform.delete();
      warped.delete();
      src.delete();
    }
  } catch {
    return file;
  }
}
