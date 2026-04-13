import {loadOpenCV, type OpenCV} from '@opencvjs/web';

const BLUR_THRESHOLD = 200;
const GLARE_THRESHOLD = 12;
const DARKNESS_THRESHOLD = 40;
const BRIGHTNESS_THRESHOLD = 200;
const TILT_THRESHOLD = 8; /* in degrees */
const ASPECT_RATIO = 1.586;
const ASPECT_RATIO_TOLERANCE = 0.2;
const MIN_DOCUMENT_AREA_RATIO = 0.15;
const TOO_FAR_AREA_RATIO = 0.25;
const TOO_CLOSE_AREA_RATIO = 0.85;
const GLARE_BRIGHTNESS_THRESHOLD = 245;

let $opencv: typeof OpenCV;

async function $getOpenCV() {
  if (!$opencv) {
    $opencv = await loadOpenCV();
  }

  return $opencv;
}

function $loadImage(subject: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(subject);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    img.src = objectUrl;
  });
}

async function $getImageData(subject: File): Promise<ImageData> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  const img = await $loadImage(subject);
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function $deleteAll(...values: Array<{delete(): void} | null | undefined>) {
  for (const value of values) {
    value?.delete();
  }
}

function $getMatValue(subject: {
  data64F?: ArrayLike<number>;
  data32F?: ArrayLike<number>;
  data?: ArrayLike<number>;
}) {
  return subject.data64F?.[0] ?? subject.data32F?.[0] ?? subject.data?.[0] ?? 0;
}

function $normalizeAngle(angle: number) {
  let normalized = angle;

  while (normalized <= -45) {
    normalized += 90;
  }

  while (normalized > 45) {
    normalized -= 90;
  }

  return normalized;
}

function $getAspectRatio(rect: {size: {width: number; height: number}}) {
  const width = rect.size.width;
  const height = rect.size.height;

  if (width <= 0 || height <= 0) {
    return 0;
  }

  return Math.max(width, height) / Math.min(width, height);
}

function $getTilt(rect: {size: {width: number; height: number}; angle: number}) {
  const normalizedAngle = rect.size.width >= rect.size.height ? rect.angle : rect.angle + 90;
  return Math.abs($normalizeAngle(normalizedAngle));
}

async function $getMaskPixelCount(mask: InstanceType<typeof OpenCV.Mat>) {
  const opencv = await $getOpenCV();
  return Math.max(opencv.countNonZero(mask), 1);
}

async function $getMeanBrightness(
  gray: InstanceType<typeof OpenCV.Mat>,
  mask: InstanceType<typeof OpenCV.Mat>,
) {
  const opencv = await $getOpenCV();
  return opencv.mean(gray, mask)[0] ?? 0;
}

async function $isBlurry(
  gray: InstanceType<typeof OpenCV.Mat>,
  mask: InstanceType<typeof OpenCV.Mat>,
) {
  const opencv = await $getOpenCV();
  const laplacian = new opencv.Mat();
  const mean = new opencv.Mat();
  const stddev = new opencv.Mat();

  try {
    opencv.Laplacian(gray, laplacian, opencv.CV_64F);
    opencv.meanStdDev(laplacian, mean, stddev, mask);
    const variance = $getMatValue(stddev) ** 2;

    return variance < BLUR_THRESHOLD;
  } finally {
    $deleteAll(laplacian, mean, stddev);
  }
}

async function $hasGlare(
  gray: InstanceType<typeof OpenCV.Mat>,
  mask: InstanceType<typeof OpenCV.Mat>,
) {
  const opencv = await $getOpenCV();
  const glareMask = new opencv.Mat();

  try {
    opencv.threshold(gray, glareMask, GLARE_BRIGHTNESS_THRESHOLD, 255, opencv.THRESH_BINARY);
    opencv.bitwise_and(glareMask, mask, glareMask);

    const glareRatio = (opencv.countNonZero(glareMask) / (await $getMaskPixelCount(mask))) * 100;

    return glareRatio > GLARE_THRESHOLD;
  } finally {
    $deleteAll(glareMask);
  }
}

async function $isTooDark(
  gray: InstanceType<typeof OpenCV.Mat>,
  mask: InstanceType<typeof OpenCV.Mat>,
) {
  const meanBrightness = await $getMeanBrightness(gray, mask);
  return meanBrightness < DARKNESS_THRESHOLD;
}

async function $isTooBright(
  gray: InstanceType<typeof OpenCV.Mat>,
  mask: InstanceType<typeof OpenCV.Mat>,
) {
  const meanBrightness = await $getMeanBrightness(gray, mask);
  return meanBrightness > BRIGHTNESS_THRESHOLD;
}

async function $getDocumentAreaRatio(
  gray: InstanceType<typeof OpenCV.Mat>,
  mask: InstanceType<typeof OpenCV.Mat>,
) {
  const imageArea = Math.max(gray.rows * gray.cols, 1);
  const documentArea = await $getMaskPixelCount(mask);
  return documentArea / imageArea;
}

function $isTilted(tilt: number) {
  return tilt > TILT_THRESHOLD;
}

async function $getDeskewAngle(mask: InstanceType<typeof OpenCV.Mat>) {
  const opencv = await $getOpenCV();
  const maskClone = mask.clone();
  const contours = new opencv.MatVector();
  const hierarchy = new opencv.Mat();

  let bestContour: InstanceType<typeof OpenCV.Mat> | null = null;
  let bestArea = 0;

  try {
    opencv.findContours(
      maskClone,
      contours,
      hierarchy,
      opencv.RETR_EXTERNAL,
      opencv.CHAIN_APPROX_SIMPLE,
    );

    if (!contours.size()) {
      return 0;
    }

    for (let index = 0; index < contours.size(); index += 1) {
      const contour = contours.get(index);

      try {
        const area = opencv.contourArea(contour);
        if (area > bestArea) {
          bestArea = area;
          bestContour?.delete();
          bestContour = contour.clone();
        }
      } finally {
        contour.delete();
      }
    }

    if (!bestContour || !bestArea) {
      return 0;
    }

    const rect = opencv.minAreaRect(bestContour);
    const normalizedAngle = rect.size.width >= rect.size.height ? rect.angle : rect.angle + 90;

    return $normalizeAngle(normalizedAngle);
  } finally {
    $deleteAll(bestContour, hierarchy, contours, maskClone);
  }
}

async function $rotateImage(
  src: InstanceType<typeof OpenCV.Mat>,
  angle: number,
): Promise<InstanceType<typeof OpenCV.Mat>> {
  const opencv = await $getOpenCV();
  const center = new opencv.Point(src.cols / 2, src.rows / 2);
  const rotationMatrix = opencv.getRotationMatrix2D(center, angle, 1);
  const rotated = new opencv.Mat();

  try {
    opencv.warpAffine(
      src,
      rotated,
      rotationMatrix,
      new opencv.Size(src.cols, src.rows),
      opencv.INTER_LINEAR,
      opencv.BORDER_REPLICATE,
      new opencv.Scalar(),
    );

    return rotated;
  } finally {
    $deleteAll(rotationMatrix);
  }
}

interface DocumentRegion {
  found: boolean;
  aspectRatio: number;
  tilt: number;
  mask: InstanceType<typeof OpenCV.Mat> | null;
}

async function $detectDocumentRegion(
  gray: InstanceType<typeof OpenCV.Mat>,
): Promise<DocumentRegion> {
  const opencv = await $getOpenCV();
  const blurred = new opencv.Mat();
  const edges = new opencv.Mat();
  const closed = new opencv.Mat();
  const contours = new opencv.MatVector();
  const hierarchy = new opencv.Mat();
  const kernel = opencv.getStructuringElement(opencv.MORPH_RECT, new opencv.Size(5, 5));

  let bestIndex = -1;
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestAspectRatio = 0;
  let bestTilt = 0;

  try {
    opencv.GaussianBlur(gray, blurred, new opencv.Size(5, 5), 0, 0, opencv.BORDER_DEFAULT);
    opencv.Canny(blurred, edges, 75, 200);
    opencv.morphologyEx(edges, closed, opencv.MORPH_CLOSE, kernel);
    opencv.findContours(
      closed,
      contours,
      hierarchy,
      opencv.RETR_EXTERNAL,
      opencv.CHAIN_APPROX_SIMPLE,
    );

    const imageArea = gray.rows * gray.cols;
    const imageCenter = new opencv.Point(gray.cols / 2, gray.rows / 2);

    for (let index = 0; index < contours.size(); index += 1) {
      const contour = contours.get(index);
      const approx = new opencv.Mat();

      try {
        const area = opencv.contourArea(contour);
        if (area <= 0) {
          continue;
        }

        const areaRatio = area / imageArea;
        if (areaRatio < MIN_DOCUMENT_AREA_RATIO) {
          continue;
        }

        const perimeter = opencv.arcLength(contour, true);
        opencv.approxPolyDP(contour, approx, perimeter * 0.02, true);

        const rect = opencv.minAreaRect(contour);
        const aspectRatio = $getAspectRatio(rect);
        if (!aspectRatio) {
          continue;
        }

        const boundingArea = rect.size.width * rect.size.height;
        if (boundingArea <= 0) {
          continue;
        }

        const aspectDelta = Math.abs(aspectRatio - ASPECT_RATIO);
        const aspectScore = Math.max(0, 1 - aspectDelta / (ASPECT_RATIO * ASPECT_RATIO_TOLERANCE));
        const rectangularity = Math.min(area / boundingArea, 1);
        const vertexBonus = approx.rows === 4 ? 0.25 : approx.rows <= 6 ? 0.1 : 0;
        const centerBonus = opencv.pointPolygonTest(contour, imageCenter, false) >= 0 ? 0.2 : -0.2;
        const score = areaRatio * 4 + rectangularity + aspectScore * 2 + vertexBonus + centerBonus;

        if (score > bestScore) {
          bestIndex = index;
          bestScore = score;
          bestAspectRatio = aspectRatio;
          bestTilt = $getTilt(rect);
        }
      } finally {
        $deleteAll(contour, approx);
      }
    }

    const aspectMatches =
      Math.abs(bestAspectRatio - ASPECT_RATIO) <= ASPECT_RATIO * ASPECT_RATIO_TOLERANCE;
    if (bestIndex < 0 || !aspectMatches) {
      return {
        found: false,
        aspectRatio: bestAspectRatio,
        tilt: bestTilt,
        mask: null,
      };
    }

    const mask = opencv.Mat.zeros(gray.rows, gray.cols, opencv.CV_8UC1);
    opencv.drawContours(mask, contours, bestIndex, new opencv.Scalar(255), opencv.FILLED);

    return {
      found: true,
      aspectRatio: bestAspectRatio,
      tilt: bestTilt,
      mask,
    };
  } finally {
    $deleteAll(blurred, edges, closed, contours, hierarchy, kernel);
  }
}

export interface IdDocumentDetection {
  found: boolean;
  blurry: boolean;
  glare: boolean;
  tooDark: boolean;
  tooBright: boolean;
  tilted: boolean;
  tooFar: boolean;
  tooClose: boolean;
}

async function $analyzeIdDocument(imageData: ImageData): Promise<IdDocumentDetection> {
  const opencv = await $getOpenCV();
  const result: IdDocumentDetection = {
    found: false,
    blurry: false,
    glare: false,
    tooDark: false,
    tooBright: false,
    tilted: false,
    tooFar: false,
    tooClose: false,
  };

  let src: InstanceType<typeof OpenCV.Mat> | null = null;
  let gray: InstanceType<typeof OpenCV.Mat> | null = null;
  let mask: InstanceType<typeof OpenCV.Mat> | null = null;

  try {
    src = opencv.matFromImageData(imageData);
    gray = new opencv.Mat();
    opencv.cvtColor(src, gray, opencv.COLOR_RGBA2GRAY);

    const region = await $detectDocumentRegion(gray);
    result.found = region.found;
    result.tilted = $isTilted(region.tilt);

    mask = region.mask;
    if (!mask) {
      return result;
    }

    const documentAreaRatio = await $getDocumentAreaRatio(gray, mask);
    result.tooFar = documentAreaRatio < TOO_FAR_AREA_RATIO;
    result.tooClose = documentAreaRatio > TOO_CLOSE_AREA_RATIO;

    result.blurry = await $isBlurry(gray, mask);
    result.glare = await $hasGlare(gray, mask);
    result.tooDark = await $isTooDark(gray, mask);
    result.tooBright = await $isTooBright(gray, mask);

    return result;
  } finally {
    $deleteAll(mask, gray, src);
  }
}

export async function detectIdDocument(file: File): Promise<IdDocumentDetection> {
  try {
    const imageData = await $getImageData(file);
    return await $analyzeIdDocument(imageData);
  } catch (error) {
    console.error(error);
    return {
      found: false,
      blurry: false,
      glare: false,
      tooDark: false,
      tooBright: false,
      tilted: false,
      tooFar: false,
      tooClose: false,
    };
  }
}

export async function cropIdDocument(file: File): Promise<File> {
  try {
    const opencv = await $getOpenCV();
    const imageData = await $getImageData(file);

    const src = opencv.matFromImageData(imageData);
    const gray = new opencv.Mat();
    let region: DocumentRegion | null = null;
    let rotatedSrc: InstanceType<typeof OpenCV.Mat> | null = null;
    let rotatedGray: InstanceType<typeof OpenCV.Mat> | null = null;
    let rotatedRegion: DocumentRegion | null = null;
    let cropped: InstanceType<typeof OpenCV.Mat> | null = null;
    let croppedGray: InstanceType<typeof OpenCV.Mat> | null = null;
    let croppedRegion: DocumentRegion | null = null;
    let deskewedCropped: InstanceType<typeof OpenCV.Mat> | null = null;

    try {
      opencv.cvtColor(src, gray, opencv.COLOR_RGBA2GRAY);
      region = await $detectDocumentRegion(gray);

      if (!region.found || !region.mask) {
        return file;
      }

      const deskewAngle = await $getDeskewAngle(region.mask);

      let workingSrc = src;
      let workingRegion = region;

      if (Math.abs(deskewAngle) > 0.5) {
        rotatedSrc = await $rotateImage(src, -deskewAngle);
        rotatedGray = new opencv.Mat();
        opencv.cvtColor(rotatedSrc, rotatedGray, opencv.COLOR_RGBA2GRAY);

        rotatedRegion = await $detectDocumentRegion(rotatedGray);
        if (rotatedRegion.found && rotatedRegion.mask) {
          workingSrc = rotatedSrc;
          workingRegion = rotatedRegion;
        }
      }

      if (!workingRegion.mask) {
        return file;
      }

      const boundingRect = opencv.boundingRect(workingRegion.mask);
      if (boundingRect.width <= 0 || boundingRect.height <= 0) {
        return file;
      }

      cropped = workingSrc.roi(boundingRect);

      let outputMat = cropped;
      croppedGray = new opencv.Mat();
      opencv.cvtColor(cropped, croppedGray, opencv.COLOR_RGBA2GRAY);
      croppedRegion = await $detectDocumentRegion(croppedGray);

      if (croppedRegion.found && croppedRegion.mask) {
        const cropDeskewAngle = await $getDeskewAngle(croppedRegion.mask);
        if (Math.abs(cropDeskewAngle) > 0.5) {
          deskewedCropped = await $rotateImage(cropped, -cropDeskewAngle);
          outputMat = deskewedCropped;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = outputMat.cols;
      canvas.height = outputMat.rows;
      opencv.imshow(canvas, outputMat);

      let outputCanvas = canvas;
      if (canvas.height > canvas.width) {
        const rotatedCanvas = document.createElement('canvas');
        rotatedCanvas.width = canvas.height;
        rotatedCanvas.height = canvas.width;

        const rotatedCtx = rotatedCanvas.getContext('2d');
        if (rotatedCtx) {
          rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
          rotatedCtx.rotate(-Math.PI / 2);
          rotatedCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
          outputCanvas = rotatedCanvas;
        }
      }

      return await new Promise((resolve) => {
        outputCanvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name, {type: file.type});
            resolve(croppedFile);
          } else {
            resolve(file);
          }
        });
      });
    } finally {
      $deleteAll(
        deskewedCropped,
        croppedRegion?.mask,
        croppedGray,
        cropped,
        rotatedRegion?.mask,
        rotatedGray,
        rotatedSrc,
        region?.mask,
        gray,
        src,
      );
    }
  } catch (error) {
    console.error(error);
    return file;
  }
}
