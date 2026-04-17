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

interface CropPoints {
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

export interface DetectFaceOptions {
  maxFaces?: number;
  headTurn?: HeadTurn;
  mirrored?: boolean;
}

export async function detectFace(
  subject: HTMLCanvasElement | File,
  options: DetectFaceOptions = {},
): Promise<FaceDetectionResult | null> {
  const {headTurn, mirrored, maxFaces = 1} = options;

  try {
    const detector = await $getFaceDetector('IMAGE');
    let sourceWidth = 0;
    let sourceHeight = 0;
    let file: File;
    let detections: ReturnType<FaceDetector['detect']>['detections'];
    let landmarkerInput: HTMLImageElement | HTMLCanvasElement;

    if (subject instanceof File) {
      const image = await $loadImage(subject);
      const result = detector.detect(image);
      detections = result.detections;
      sourceWidth = image.naturalWidth || image.width;
      sourceHeight = image.naturalHeight || image.height;
      file = subject;
      landmarkerInput = image;
    } else {
      file = await $canvasToFile(subject);
      const result = detector.detect(subject);
      detections = result.detections;
      sourceWidth = subject.width;
      sourceHeight = subject.height;
      landmarkerInput = subject;
    }

    if (detections.length < 1 || detections.length > maxFaces) return null;

    const firstDetection = detections[0];
    const boundingBox = firstDetection.boundingBox;

    if (!boundingBox) return null;

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

    const right = finalSourceX + squareSize;
    const bottom = finalSourceY + squareSize;

    if (headTurn) {
      const landmarker = await $getFaceLandmarker('IMAGE');
      const landmarkerResult = landmarker.detect(landmarkerInput);
      const matrix = landmarkerResult.facialTransformationMatrixes?.[0]?.data;

      if (!matrix) return null;

      const _yaw = Math.atan2(matrix[8], matrix[10]) * (180 / Math.PI);
      const yaw = mirrored ? -_yaw : _yaw;
      const detectedHeadTurn: HeadTurn = yaw > 15 ? 'RIGHT' : yaw < -15 ? 'LEFT' : 'CENTER';

      if (detectedHeadTurn !== headTurn) return null;
    }

    return {
      cropPoints: {
        topLeft: {x: finalSourceX, y: finalSourceY},
        topRight: {x: right, y: finalSourceY},
        bottomRight: {x: right, y: bottom},
        bottomLeft: {x: finalSourceX, y: bottom},
      },
      file,
      score: firstDetection.categories.at(0)?.score ?? 0,
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
export interface DetectHeadTurnOptions {
  mirrored?: boolean;
}

export async function detectHeadTurn(
  video: HTMLVideoElement,
  options: DetectHeadTurnOptions = {},
): Promise<HeadTurn | null> {
  const {mirrored = false} = options;

  try {
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
  } catch (error) {
    console.error(error);
    return null;
  }
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

    const landmarker = await $getFaceLandmarker('IMAGE');
    const originalResult = landmarker.detect(canvas);
    const originalBlendshape = originalResult.faceBlendshapes?.at(0);

    const originalEmbedding = originalBlendshape
      ? (() => {
          const values = originalBlendshape.categories
            .map((category) => category.score)
            .filter((score) => Number.isFinite(score));

          if (!values.length) return null;

          const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));

          if (norm === 0) return null;

          return values.map((value) => value / norm);
        })()
      : null;

    if (originalEmbedding) {
      return {
        data: originalEmbedding,
        vector: `[${originalEmbedding.join(',')}]`,
      };
    }

    const enhancedCanvas = document.createElement('canvas');
    const enhancedContext = enhancedCanvas.getContext('2d');

    invariant(enhancedContext, 'Could not get enhancement canvas context');

    enhancedCanvas.width = canvas.width;
    enhancedCanvas.height = canvas.height;
    enhancedContext.filter = `brightness(${1.35}) contrast(${1.28})`;
    enhancedContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    enhancedContext.filter = 'none';

    const enhancedResult = landmarker.detect(enhancedCanvas);
    const enhancedBlendshape = enhancedResult.faceBlendshapes?.at(0);

    const enhancedEmbedding = enhancedBlendshape
      ? (() => {
          const values = enhancedBlendshape.categories
            .map((category) => category.score)
            .filter((score) => Number.isFinite(score));

          if (!values.length) return null;

          const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));

          if (norm === 0) return null;

          return values.map((value) => value / norm);
        })()
      : null;

    if (enhancedEmbedding) {
      return {
        data: enhancedEmbedding,
        vector: `[${enhancedEmbedding.join(',')}]`,
      };
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function cropFace(file: File, cropPoints?: CropPoints): Promise<File> {
  try {
    if (!cropPoints) return file;

    const image = await $loadImage(file);
    const canvas = document.createElement('canvas');
    const sourceContext = canvas.getContext('2d');

    invariant(sourceContext, 'Could not get canvas context');

    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    sourceContext.drawImage(image, 0, 0, canvas.width, canvas.height);

    const left = Math.min(cropPoints.topLeft.x, cropPoints.bottomLeft.x);
    const top = Math.min(cropPoints.topLeft.y, cropPoints.topRight.y);
    const right = Math.max(cropPoints.topRight.x, cropPoints.bottomRight.x);
    const bottom = Math.max(cropPoints.bottomLeft.y, cropPoints.bottomRight.y);
    const size = Math.max(1, Math.max(right - left, bottom - top));

    const outputSize = 1024;
    const outputCanvas = document.createElement('canvas');
    const context = outputCanvas.getContext('2d');

    invariant(context, 'Could not get cropped canvas context');

    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    context.drawImage(canvas, left, top, size, size, 0, 0, outputSize, outputSize);

    return $canvasToFile(outputCanvas);
  } catch (error) {
    console.error(error);
    return file;
  }
}
