import {
  FaceDetector,
  type FaceDetectorOptions,
  FaceLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';
import {invariant} from 'es-toolkit';

let $faceDetector: FaceDetector | null = null;
let $faceLandmarker: FaceLandmarker | null = null;
let $runningMode: FaceDetectorOptions['runningMode'] | null = null;
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
    if ($runningMode !== runningMode) {
      await $faceDetector.setOptions({runningMode});
      $runningMode = runningMode;
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
  $runningMode = runningMode;
  return detector;
}

async function $getFaceLandmarker() {
  if ($faceLandmarker) return $faceLandmarker;

  const vision = await $getVision();
  const landmarker = await FaceLandmarker.createFromOptions(vision, {
    runningMode: 'IMAGE',
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: true,
    numFaces: 1,
    baseOptions: {
      delegate: 'GPU',
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
    },
  });

  $faceLandmarker = landmarker;
  return landmarker;
}

export async function loadFaceModels() {
  return await Promise.all([$getFaceDetector(), $getFaceLandmarker()]);
}

export async function validateFace(
  subject: HTMLImageElement | HTMLVideoElement | File,
): Promise<boolean> {
  try {
    if (subject instanceof File) {
      return $validateFaceFromFile(subject);
    } else if (subject instanceof HTMLImageElement) {
      return $validateFaceFromImage(subject);
    } else if (subject instanceof HTMLVideoElement) {
      return $validateFaceFromVideo(subject);
    } else {
      const error = new Error();
      error.name = 'InvalidSubjectError';
      error.message = 'Subject must be an instance of HTMLImageElement, HTMLVideoElement or File.';
      Error.captureStackTrace?.(error, validateFace);
      throw error;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function $validateFaceFromImage(image: HTMLImageElement): Promise<boolean> {
  const detector = await $getFaceDetector('IMAGE');
  const result = detector.detect(image);
  return result.detections.length > 0;
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

async function $validateFaceFromFile(file: File): Promise<boolean> {
  const image = await $loadImage(file);
  return $validateFaceFromImage(image);
}

async function $validateFaceFromVideo(video: HTMLVideoElement): Promise<boolean> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  invariant(context, 'Could not get canvas context.');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          const error = new Error();
          error.name = 'FaceValidatorError';
          error.message = 'Failed to create blob from canvas.';
          reject(error);
        } else {
          resolve(blob);
        }
      },
      'image/jpg',
      0.9,
    );
  });

  const file = new File([blob], `frame-${Date.now()}.jpg`, {
    type: 'image/jpg',
    endings: 'native',
    lastModified: Date.now(),
  });

  return $validateFaceFromFile(file);
}

export type HeadTurn = 'LEFT' | 'RIGHT' | 'CENTER';

export async function detectHeadTurn(
  subject: HTMLVideoElement | HTMLImageElement | File,
): Promise<HeadTurn | null> {
  try {
    if (subject instanceof File) {
      return $detectHeadTurnFromFile(subject);
    } else if (subject instanceof HTMLImageElement) {
      return $detectHeadTurnFromImage(subject);
    } else if (subject instanceof HTMLVideoElement) {
      return $detectHeadTurnFromVideo(subject);
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

async function $detectHeadTurnFromImage(image: HTMLImageElement): Promise<HeadTurn | null> {
  try {
    const landmarker = await $getFaceLandmarker();
    const result = landmarker.detect(image);

    if (!result.faceLandmarks.length) return null;

    const matrix = result.facialTransformationMatrixes?.[0]?.data;

    if (!matrix) return null;

    const yaw = Math.atan2(matrix[8], matrix[10]) * (180 / Math.PI);
    const invertedYaw = -yaw;

    if (invertedYaw > 15) return 'RIGHT';
    if (invertedYaw < -15) return 'LEFT';
    return 'CENTER';
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function $detectHeadTurnFromFile(file: File): Promise<HeadTurn | null> {
  const image = await $loadImage(file);
  return $detectHeadTurnFromImage(image);
}

async function $detectHeadTurnFromVideo(video: HTMLVideoElement): Promise<HeadTurn | null> {
  if (video.readyState < 2) return null;

  const landmarker = await $getFaceLandmarker();
  const result = landmarker.detectForVideo(video, performance.now());

  if (!result.faceLandmarks.length) return null;

  const matrix = result.facialTransformationMatrixes?.[0]?.data;

  if (!matrix) return null;

  const yaw = Math.atan2(matrix[8], matrix[10]) * (180 / Math.PI);

  if (yaw > 15) return 'RIGHT';
  if (yaw < -15) return 'LEFT';
  return 'CENTER';
}
