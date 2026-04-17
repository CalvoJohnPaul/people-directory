import {
  FaceDetector,
  type FaceDetectorOptions,
  FaceLandmarker,
  type FaceLandmarkerOptions,
  FilesetResolver,
} from '@mediapipe/tasks-vision';
import {invariant} from 'es-toolkit';

let $faceDetector: FaceDetector | null = null;
let $faceDetectorRunningMode: FaceDetectorOptions['runningMode'] | null = null;
let $faceLandmarker: FaceLandmarker | null = null;
let $faceLandmarkerRunningMode: FaceLandmarkerOptions['runningMode'] | null = null;
let $vision: Awaited<ReturnType<(typeof FilesetResolver)['forVisionTasks']>> | null = null;

interface CropPoint {
  x: number;
  y: number;
}

export interface CropPoints {
  topLeft: CropPoint;
  topRight: CropPoint;
  bottomRight: CropPoint;
  bottomLeft: CropPoint;
}

export interface FaceDetectionResult {
  file: File;
  score: number;
  cropPoints?: CropPoints;
}

async function $getVision() {
  if (!$vision) {
    $vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
    );
  }

  return $vision;
}

async function $getFaceDetector(runningMode: 'IMAGE' | 'VIDEO' = 'IMAGE') {
  if ($faceDetector) {
    if ($faceDetectorRunningMode !== runningMode) {
      await $faceDetector.setOptions({runningMode});
      $faceDetectorRunningMode = runningMode;
    }

    return $faceDetector;
  }

  const vision = await $getVision();
  const detector = await FaceDetector.createFromOptions(vision, {
    runningMode,
    minDetectionConfidence: 0.5,
    baseOptions: {
      delegate: 'GPU',
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
    },
  });

  $faceDetector = detector;
  $faceDetectorRunningMode = runningMode;
  return detector;
}

async function $getFaceLandmarker(runningMode: 'IMAGE' | 'VIDEO' = 'IMAGE') {
  if ($faceLandmarker) {
    if ($faceLandmarkerRunningMode !== runningMode) {
      await $faceLandmarker.setOptions({runningMode});
      $faceLandmarkerRunningMode = runningMode;
    }

    return $faceLandmarker;
  }

  const vision = await $getVision();
  const landmarker = await FaceLandmarker.createFromOptions(vision, {
    runningMode,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
    numFaces: 1,
    baseOptions: {
      delegate: 'GPU',
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
    },
  });

  $faceLandmarker = landmarker;
  $faceLandmarkerRunningMode = runningMode;
  return landmarker;
}

export async function detectFace(
  subject: HTMLCanvasElement | File,
  max = 1,
): Promise<FaceDetectionResult | null> {
  try {
    const detector = await $getFaceDetector('IMAGE');

    if (subject instanceof File) {
      const image = await $loadImage(subject);
      const result = detector.detect(image);
      const detections = result.detections;

      if (detections.length < 1 || detections.length > max) return null;

      const detection = detections[0];
      const boundingBox = detection.boundingBox;

      if (!boundingBox) return null;

      return {
        cropPoints: $toCropPoints(
          $getFaceCropBounds(
            image.naturalWidth || image.width,
            image.naturalHeight || image.height,
            boundingBox,
          ),
        ),
        file: subject,
        score: detection.categories.at(0)?.score ?? 0,
      };
    }

    const file = await $canvasToFile(subject);
    const result = detector.detect(subject);
    const detections = result.detections;
    if (detections.length < 1 || detections.length > max) return null;
    const detection = detections[0];
    const boundingBox = detection.boundingBox;

    if (!boundingBox) return null;

    return {
      cropPoints: $toCropPoints($getFaceCropBounds(subject.width, subject.height, boundingBox)),
      file,
      score: detection.categories.at(0)?.score ?? 0,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function $canvasToFile(canvas: HTMLCanvasElement): Promise<File> {
  const type = 'image/jpg';
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 1));

  invariant(blob, 'Could not create a file from the source canvas');

  return new File([blob], `${Date.now()}`, {
    type,
    endings: 'native',
    lastModified: Date.now(),
  });
}

function $drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  invariant(context, 'Could not get canvas context');

  canvas.width = width;
  canvas.height = height;
  context.drawImage(source, 0, 0, width, height);

  return canvas;
}

function $getFaceCropBounds(
  sourceWidth: number,
  sourceHeight: number,
  boundingBox: NonNullable<ReturnType<FaceDetector['detect']>['detections'][number]['boundingBox']>,
) {
  const {height, originX, originY, width} = boundingBox;
  const marginX = width * 0.25;
  const marginTop = Math.max(height * 0.55, width * 0.35);
  const marginBottom = height * 1.05;

  const desiredLeft = originX - marginX;
  const desiredTop = originY - marginTop;
  const desiredRight = originX + width + marginX;
  const desiredBottom = originY + height + marginBottom;

  const sourceX = Math.max(0, desiredLeft);
  const sourceY = Math.max(0, desiredTop);
  const sourceRight = Math.min(sourceWidth, desiredRight);
  let sourceBottom = Math.min(sourceHeight, desiredBottom);

  const lostTop = sourceY - desiredTop;

  if (lostTop > 0) {
    sourceBottom = Math.min(sourceHeight, sourceBottom + lostTop);
  }

  const sourceCropWidth = Math.max(1, sourceRight - sourceX);
  const sourceCropHeight = Math.max(1, sourceBottom - sourceY);
  const squareSize = Math.max(sourceCropWidth, sourceCropHeight);
  const excessWidth = squareSize - sourceCropWidth;
  const excessHeight = squareSize - sourceCropHeight;

  let finalSourceX = Math.max(0, sourceX - Math.floor(excessWidth / 2));
  let finalSourceY = Math.max(0, sourceY - Math.floor(excessHeight / 2));

  finalSourceX = Math.min(finalSourceX, Math.max(0, sourceWidth - squareSize));
  finalSourceY = Math.min(finalSourceY, Math.max(0, sourceHeight - squareSize));

  return {
    x: finalSourceX,
    y: finalSourceY,
    size: squareSize,
  };
}

function $toCropPoints(bounds: {x: number; y: number; size: number}): CropPoints {
  const right = bounds.x + bounds.size;
  const bottom = bounds.y + bounds.size;

  return {
    topLeft: {x: bounds.x, y: bounds.y},
    topRight: {x: right, y: bounds.y},
    bottomRight: {x: right, y: bottom},
    bottomLeft: {x: bounds.x, y: bottom},
  };
}

function $cropPointsToBounds(cropPoints: CropPoints) {
  const left = Math.min(cropPoints.topLeft.x, cropPoints.bottomLeft.x);
  const top = Math.min(cropPoints.topLeft.y, cropPoints.topRight.y);
  const right = Math.max(cropPoints.topRight.x, cropPoints.bottomRight.x);
  const bottom = Math.max(cropPoints.bottomLeft.y, cropPoints.bottomRight.y);

  return {
    x: left,
    y: top,
    size: Math.max(1, Math.max(right - left, bottom - top)),
  };
}

async function $cropCanvasToFile(source: HTMLCanvasElement, cropPoints: CropPoints): Promise<File> {
  const bounds = $cropPointsToBounds(cropPoints);
  const outputSize = 1024;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  invariant(context, 'Could not get cropped canvas context');

  canvas.width = outputSize;
  canvas.height = outputSize;
  context.drawImage(
    source,
    bounds.x,
    bounds.y,
    bounds.size,
    bounds.size,
    0,
    0,
    outputSize,
    outputSize,
  );

  return $canvasToFile(canvas);
}

async function $loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };

    image.src = url;
  });
}

export type HeadTurn = 'LEFT' | 'RIGHT' | 'CENTER';

export async function detectHeadTurn(
  subject: HTMLVideoElement | HTMLImageElement | File,
  mirrored = false,
): Promise<HeadTurn | null> {
  try {
    if (subject instanceof File) {
      return $detectHeadTurnFromFile(subject, mirrored);
    } else if (subject instanceof HTMLImageElement) {
      return $detectHeadTurnFromImage(subject, mirrored);
    } else if (subject instanceof HTMLVideoElement) {
      return $detectHeadTurnFromVideo(subject, mirrored);
    } else {
      const error = new Error();
      error.name = 'InvalidSubjectError';
      error.message = 'Subject must be an instance of HTMLImageElement, HTMLVideoElement or File.';
      Error.captureStackTrace?.(error, detectHeadTurn);
      throw error;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function $detectHeadTurnFromImage(
  image: HTMLImageElement,
  mirrored?: boolean,
): Promise<HeadTurn | null> {
  const landmarker = await $getFaceLandmarker();
  const result = landmarker.detect(image);

  if (!result.faceLandmarks.length) return null;

  const matrix = result.facialTransformationMatrixes?.[0]?.data;

  if (!matrix) return null;

  const _yaw = Math.atan2(matrix[8], matrix[10]) * (180 / Math.PI);
  const yaw = mirrored ? -_yaw : _yaw;

  if (yaw > 15) return 'RIGHT';
  if (yaw < -15) return 'LEFT';
  return 'CENTER';
}

async function $detectHeadTurnFromFile(file: File, mirrored?: boolean): Promise<HeadTurn | null> {
  const image = await $loadImage(file);
  return $detectHeadTurnFromImage(image, mirrored);
}

async function $detectHeadTurnFromVideo(
  video: HTMLVideoElement,
  mirrored?: boolean,
): Promise<HeadTurn | null> {
  if (video.readyState < 2) return null;

  const landmarker = await $getFaceLandmarker('VIDEO');
  const result = landmarker.detectForVideo(video, performance.now());

  if (!result.faceLandmarks.length) return null;

  const matrix = result.facialTransformationMatrixes?.[0]?.data;

  if (!matrix) return null;

  const _yaw = Math.atan2(matrix[8], matrix[10]) * (180 / Math.PI);
  const yaw = mirrored ? -_yaw : _yaw;

  if (yaw > 15) return 'RIGHT';
  if (yaw < -15) return 'LEFT';
  return 'CENTER';
}

export interface FaceEmbedding {
  data: number[];
  vector: string;
}

export async function getFaceEmbedding(file: File): Promise<FaceEmbedding | null> {
  try {
    const image = await $loadImage(file);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    invariant(context, 'Could not get canvas context');

    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const embedding_0 = await $extractEmbeddingFromCanvas(canvas);

    if (embedding_0) {
      return {
        data: embedding_0,
        vector: $embeddingToVector(embedding_0),
      };
    }

    const embedding_1 = await $extractEmbeddingFromCanvas($enhanceCanvas(canvas, 1.35, 1.28));

    if (embedding_1) {
      return {
        data: embedding_1,
        vector: $embeddingToVector(embedding_1),
      };
    }

    const cropped_0 = await $cropFaceFromCanvas(canvas);

    if (cropped_0) {
      const embedding_2 = await $extractEmbeddingFromCanvas(cropped_0);

      if (embedding_2) {
        return {
          data: embedding_2,
          vector: $embeddingToVector(embedding_2),
        };
      }

      const cropped_1 = $enhanceCanvas(cropped_0, 1.25, 1.22);
      const embedding_3 = await $extractEmbeddingFromCanvas(cropped_1);

      if (embedding_3)
        return {
          data: embedding_3,
          vector: $embeddingToVector(embedding_3),
        };
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function $embeddingToVector(value: number[]): string {
  return `[${value.join(',')}]`;
}

async function $extractEmbeddingFromCanvas(canvas: HTMLCanvasElement): Promise<number[] | null> {
  const landmarker = await $getFaceLandmarker('IMAGE');
  const result = landmarker.detect(canvas);
  const faceBlendshape = result.faceBlendshapes?.at(0);

  if (!faceBlendshape) return null;

  const values = faceBlendshape.categories
    .map((category) => category.score)
    .filter((score) => Number.isFinite(score));

  if (!values.length) return null;

  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));

  if (norm === 0) return null;

  return values.map((value) => value / norm);
}

function $enhanceCanvas(
  source: HTMLCanvasElement,
  brightness: number,
  contrast: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  invariant(context, 'Could not get enhancement canvas context');

  canvas.width = source.width;
  canvas.height = source.height;
  context.filter = `brightness(${brightness}) contrast(${contrast})`;
  context.drawImage(source, 0, 0, source.width, source.height);
  context.filter = 'none';

  return canvas;
}

async function $cropFaceFromCanvas(source: HTMLCanvasElement): Promise<HTMLCanvasElement | null> {
  const detector = await $getFaceDetector('IMAGE');
  const result = detector.detect(source);
  const detection = result.detections.at(0);
  const box = detection?.boundingBox;

  if (!box) return null;

  const marginX = box.width * 0.3;
  const marginY = box.height * 0.45;
  const left = Math.max(0, Math.floor(box.originX - marginX));
  const top = Math.max(0, Math.floor(box.originY - marginY));
  const right = Math.min(source.width, Math.ceil(box.originX + box.width + marginX));
  const bottom = Math.min(source.height, Math.ceil(box.originY + box.height + marginY));
  const width = Math.max(1, right - left);
  const height = Math.max(1, bottom - top);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  invariant(context, 'Could not get crop canvas context');

  canvas.width = 512;
  canvas.height = 512;
  context.drawImage(source, left, top, width, height, 0, 0, 512, 512);

  return canvas;
}

export async function cropFace(file: File, cropPoints?: CropPoints): Promise<File> {
  try {
    if (!cropPoints) return file;

    const image = await $loadImage(file);
    const canvas = $drawToCanvas(
      image,
      image.naturalWidth || image.width,
      image.naturalHeight || image.height,
    );

    return $cropCanvasToFile(canvas, cropPoints);
  } catch (error) {
    console.error(error);
    return file;
  }
}
