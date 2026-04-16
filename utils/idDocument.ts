import {loadOpenCV, type OpenCV} from '@opencvjs/web';

const BLUR_THRESHOLD = 110;
const GLARE_THRESHOLD = 1.6;
const GLARE_VALUE_THRESHOLD = 245;
const GLARE_EXTREME_VALUE_THRESHOLD = 252;
const GLARE_SATURATION_THRESHOLD = 85;
const GLARE_STD_MULTIPLIER = 1.35;
const BRIGHTNESS_MIN = 40;
const BRIGHTNESS_MAX = 230;
const CARD_ASPECT_RATIO = 1.586;
const CARD_ASPECT_TOLERANCE = 0.32;
const CONFIDENCE_THRESHOLD = 0.48;
const TOO_FAR_AREA_RATIO = 0.25;
const TOO_CLOSE_AREA_RATIO = 0.85;
const MAX_SKEW_ANGLE = 5;
const OUTPUT_IMAGE_QUALITY = 0.92;
const PROCESS_SCALE = 0.5;

let $cv__promise: Promise<typeof OpenCV> | null = null;

async function $getCv(): Promise<typeof OpenCV> {
  if ($cv__promise) return await $cv__promise;
  $cv__promise = loadOpenCV();
  return await $cv__promise;
}

function $logPerformance(label: string, startedAt: number): void {
  const elapsed = performance.now() - startedAt;
  console.log(`[ID Document] ${label} took ${elapsed.toFixed(2)}ms`);
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

type QuadPoints = [OpenCV.Point, OpenCV.Point, OpenCV.Point, OpenCV.Point];

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

async function $detectGlareAndBrightness(
  hsv: OpenCV.Mat,
  corners: QuadPoints | null,
): Promise<{glare: boolean; brightnessStatus: 'DARK' | 'BRIGHT' | null}> {
  const cv = await $getCv();
  const region = new cv.Mat();
  const channels = new cv.MatVector();
  const brightMask = new cv.Mat();
  const lowSatMask = new cv.Mat();
  const specularMask = new cv.Mat();
  const extremeMask = new cv.Mat();
  const meanV = new cv.Mat();
  const stddevV = new cv.Mat();
  const meanS = new cv.Mat();
  const stddevS = new cv.Mat();

  let srcPts: OpenCV.Mat | null = null;
  let dstPts: OpenCV.Mat | null = null;
  let transform: OpenCV.Mat | null = null;
  let kernel: OpenCV.Mat | null = null;

  try {
    if (corners) {
      const cardWidth = 320;
      const cardHeight = Math.round(cardWidth / CARD_ASPECT_RATIO);

      srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
        corners[0].x,
        corners[0].y,
        corners[1].x,
        corners[1].y,
        corners[2].x,
        corners[2].y,
        corners[3].x,
        corners[3].y,
      ]);

      dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0,
        0,
        cardWidth,
        0,
        cardWidth,
        cardHeight,
        0,
        cardHeight,
      ]);

      transform = cv.getPerspectiveTransform(srcPts, dstPts);
      cv.warpPerspective(
        hsv,
        region,
        transform,
        new cv.Size(cardWidth, cardHeight),
        cv.INTER_LINEAR,
        cv.BORDER_REPLICATE,
        new cv.Scalar(),
      );
    } else {
      hsv.copyTo(region);
    }

    cv.split(region, channels);
    const saturationChannel = channels.get(1);
    const valueChannel = channels.get(2);

    cv.meanStdDev(valueChannel, meanV, stddevV);
    cv.meanStdDev(saturationChannel, meanS, stddevS);

    const valueMean = meanV.doubleAt(0, 0);
    const valueStd = stddevV.doubleAt(0, 0);
    const adaptiveValueThreshold = Math.min(
      255,
      Math.max(GLARE_VALUE_THRESHOLD, valueMean + valueStd * GLARE_STD_MULTIPLIER),
    );

    const saturationMean = meanS.doubleAt(0, 0);
    const adaptiveSaturationThreshold = Math.max(
      20,
      Math.min(GLARE_SATURATION_THRESHOLD, saturationMean * 0.9),
    );

    cv.threshold(valueChannel, brightMask, adaptiveValueThreshold, 255, cv.THRESH_BINARY);
    cv.threshold(valueChannel, extremeMask, GLARE_EXTREME_VALUE_THRESHOLD, 255, cv.THRESH_BINARY);
    cv.threshold(
      saturationChannel,
      lowSatMask,
      adaptiveSaturationThreshold,
      255,
      cv.THRESH_BINARY_INV,
    );
    cv.bitwise_and(brightMask, lowSatMask, specularMask);

    kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));
    cv.morphologyEx(specularMask, specularMask, cv.MORPH_OPEN, kernel);
    cv.morphologyEx(specularMask, specularMask, cv.MORPH_CLOSE, kernel);

    const totalPixels = Math.max(1, valueChannel.rows * valueChannel.cols);
    const specularRatio = (cv.countNonZero(specularMask) / totalPixels) * 100;
    const extremeRatio = (cv.countNonZero(extremeMask) / totalPixels) * 100;
    const glareScore = specularRatio * 0.8 + extremeRatio * 0.2;

    let brightnessStatus: 'DARK' | 'BRIGHT' | null = null;
    if (valueMean < BRIGHTNESS_MIN) {
      brightnessStatus = 'DARK';
    } else if (valueMean > BRIGHTNESS_MAX) {
      brightnessStatus = 'BRIGHT';
    }

    return {
      glare: glareScore > GLARE_THRESHOLD,
      brightnessStatus,
    };
  } finally {
    for (let i = 0; i < channels.size(); i++) {
      channels.get(i).delete();
    }

    if (srcPts) srcPts.delete();
    if (dstPts) dstPts.delete();
    if (transform) transform.delete();
    if (kernel) kernel.delete();

    region.delete();
    channels.delete();
    brightMask.delete();
    lowSatMask.delete();
    specularMask.delete();
    extremeMask.delete();
    meanV.delete();
    stddevV.delete();
    meanS.delete();
    stddevS.delete();
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

async function $fileToImageData(file: File): Promise<ImageData> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load selected file.'));
    };

    img.src = objectUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to create canvas context.');
  }

  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

export interface IdDocumentCropPoints {
  topLeft: OpenCV.Point;
  topRight: OpenCV.Point;
  bottomRight: OpenCV.Point;
  bottomLeft: OpenCV.Point;
}

function $toCropPoints(corners: QuadPoints): IdDocumentCropPoints {
  return {
    topLeft: corners[0],
    topRight: corners[1],
    bottomRight: corners[2],
    bottomLeft: corners[3],
  };
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

export async function detectIdDocument(
  subject: ImageData | File,
): Promise<IdDocumentDetectionResult> {
  const startedAt = performance.now();

  try {
    const cv = await $getCv();
    const imageData = subject instanceof File ? await $fileToImageData(subject) : subject;
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

      const glareAndBrightness = await $detectGlareAndBrightness(hsv, card.corners);
      const glare = glareAndBrightness.glare;
      const tooDark = glareAndBrightness.brightnessStatus === 'DARK';
      const tooBright = glareAndBrightness.brightnessStatus === 'BRIGHT';

      const cardArea = $getBoundsArea(card.bounds);
      const frameArea = Math.max(1, scaledWidth * scaledHeight);
      const areaRatio = card.detected ? cardArea / frameArea : 0;

      const tilted = card.detected && $isTilted(card.angle);
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
        glare,
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
  } finally {
    $logPerformance('detectIdDocument', startedAt);
  }
}

export async function cropIdDocument(file: File, cropPoints: IdDocumentCropPoints): Promise<File> {
  const startedAt = performance.now();

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
  } finally {
    $logPerformance('cropIdDocument', startedAt);
  }
}

export type IdDocumentDetectionExplanation =
  | {
      ok: false;
      error: {
        name: string;
        message: string;
      };
    }
  | {
      ok: true;
      data: {
        file: File;
        cropPoints: IdDocumentCropPoints | null;
      };
    };

export function explainIdDocumentDetection(
  result: IdDocumentDetectionResult,
): IdDocumentDetectionExplanation {
  if (!result.detected) {
    if (result.tooDark) {
      return {
        ok: false,
        error: {
          name: 'ImageTooDarkError',
          message: 'The photo is too dark. Please take the photo in a brighter place.',
        },
      };
    }

    if (result.tooBright) {
      return {
        ok: false,
        error: {
          name: 'ImageTooBrightError',
          message: 'The photo is too bright. Please avoid strong light and try again.',
        },
      };
    }

    if (result.glare) {
      return {
        ok: false,
        error: {
          name: 'ImageGlareError',
          message: 'There is light reflection on the ID. Please tilt the ID or move the light.',
        },
      };
    }

    if (result.blurry) {
      return {
        ok: false,
        error: {
          name: 'ImageTooBlurredError',
          message: 'The photo is blurry. Please hold your camera steady and try again.',
        },
      };
    }

    if (result.tooFar) {
      return {
        ok: false,
        error: {
          name: 'ImageTooSmallError',
          message: 'The ID is too far. Please move your camera closer.',
        },
      };
    }

    if (result.tooClose) {
      return {
        ok: false,
        error: {
          name: 'ImageTooLargeError',
          message: 'The ID is too close. Please move your camera a little farther.',
        },
      };
    }

    if (result.tilted) {
      return {
        ok: false,
        error: {
          name: 'ImageTiltedError',
          message: 'The ID is not straight. Please hold it level.',
        },
      };
    }

    return {
      ok: false,
      error: {
        name: 'NoIdDocumentDetectedError',
        message: 'No ID found. Please make sure your ID is clear and fully visible in the photo.',
      },
    };
  }

  return {
    ok: true,
    data: {
      file: result.file,
      cropPoints: result.cropPoints,
    },
  };
}
