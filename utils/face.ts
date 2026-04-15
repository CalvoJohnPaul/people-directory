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
  subject: HTMLImageElement | HTMLVideoElement | File,
  max = 1,
): Promise<number> {
  try {
    if (subject instanceof File) {
      return $detectFaceFromFile(subject, max);
    } else if (subject instanceof HTMLImageElement) {
      return $detectFaceFromImage(subject, max);
    } else if (subject instanceof HTMLVideoElement) {
      return $detectFaceFromVideo(subject, max);
    } else {
      const error = new Error();
      error.name = 'InvalidSubjectError';
      error.message = 'Subject must be an instance of HTMLImageElement, HTMLVideoElement or File.';
      Error.captureStackTrace?.(error, detectFace);
      throw error;
    }
  } catch (error) {
    console.error(error);
    return 0;
  }
}

async function $detectFaceFromImage(image: HTMLImageElement, max = 1): Promise<number> {
  const detector = await $getFaceDetector('IMAGE');
  const result = detector.detect(image);
  const detections = result.detections;
  if (detections.length < 1 || detections.length > max) return 0;
  const detection = detections[0];
  const score = detection.categories.at(0)?.score;
  return score ?? 0;
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

async function $detectFaceFromFile(file: File, max = 1): Promise<number> {
  const image = await $loadImage(file);
  return $detectFaceFromImage(image, max);
}

async function $detectFaceFromVideo(video: HTMLVideoElement, max = 1): Promise<number> {
  const detector = await $getFaceDetector('VIDEO');
  const result = detector.detectForVideo(video, performance.now());
  const detections = result.detections;
  if (detections.length < 1 || detections.length > max) return 0;
  const detection = detections[0];
  const score = detection.categories.at(0)?.score;
  return score ?? 0;
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

export async function cropFace(file: File): Promise<File> {
  try {
    const detector = await $getFaceDetector('IMAGE');
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    invariant(context, 'Could not get canvas context');

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    context.drawImage(bitmap, 0, 0);
    const result = detector.detect(canvas);

    invariant(result.detections.length > 0, 'No faces detected in the image');

    const detection = result.detections[0];
    const boundingBox = detection.boundingBox;

    invariant(boundingBox, 'No bounding box found for detected face');

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
    const sourceRight = Math.min(canvas.width, desiredRight);
    let sourceBottom = Math.min(canvas.height, desiredBottom);

    const lostTop = sourceY - desiredTop;

    if (lostTop > 0) {
      sourceBottom = Math.min(canvas.height, sourceBottom + lostTop);
    }

    const sourceWidth = Math.max(1, sourceRight - sourceX);
    const sourceHeight = Math.max(1, sourceBottom - sourceY);
    const squareSize = Math.max(sourceWidth, sourceHeight);
    const excessWidth = squareSize - sourceWidth;
    const excessHeight = squareSize - sourceHeight;

    let finalSourceX = Math.max(0, sourceX - Math.floor(excessWidth / 2));
    let finalSourceY = Math.max(0, sourceY - Math.floor(excessHeight / 2));

    finalSourceX = Math.min(finalSourceX, Math.max(0, canvas.width - squareSize));
    finalSourceY = Math.min(finalSourceY, Math.max(0, canvas.height - squareSize));

    const outputSize = 1024;
    const croppedCanvas = document.createElement('canvas');
    const croppedContext = croppedCanvas.getContext('2d');

    invariant(croppedContext, 'Could not get cropped canvas context');

    croppedCanvas.width = outputSize;
    croppedCanvas.height = outputSize;
    croppedContext.drawImage(
      canvas,
      finalSourceX,
      finalSourceY,
      squareSize,
      squareSize,
      0,
      0,
      outputSize,
      outputSize,
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      croppedCanvas.toBlob(resolve, file.type, 1),
    );

    invariant(blob, 'Could not create blob from cropped canvas');

    return new File([blob], file.name, {
      type: file.type,
      endings: 'native',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error(error);
    return file;
  }
}
