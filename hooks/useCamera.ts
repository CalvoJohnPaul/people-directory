import {invariant} from 'es-toolkit';
import {type ComponentPropsWithRef, type RefObject, useRef, useState} from 'react';

export type CameraPosition = 'REAR' | 'FRONT';

export interface UseCameraOptions {
  position?: CameraPosition;
  aspectRatio?: number;
  transformer?: (snapshot: File) => File | Promise<File>;
}

export interface CameraSnapOptions {
  /**
   * @description The quality of the snapshot, between 0 and 1
   * @default 0.925
   */
  quality?: number;
  /**
   * @description The image format of the snapshot
   * @default 'image/jpeg'
   */
  type?: string;
}

type Event =
  | {
      type: 'OPENED';
      details?: never;
    }
  | {
      type: 'CLOSED';
      details?: never;
    }
  | {
      type: 'SNAPSHOT';
      details: {
        file: File;
      };
    };

type SubscribeFn = (event: Event) => void;
type UnsubscribeFn = () => void;

export interface UseCameraReturn {
  videoRef: RefObject<HTMLVideoElement | null>;
  opened: boolean;
  open: () => Promise<void>;
  close: () => Promise<void>;
  snap: (options?: CameraSnapOptions) => Promise<File>;
  snapping: boolean;
  subscribe: (fn: SubscribeFn) => UnsubscribeFn;
  getVideoProps: () => ComponentPropsWithRef<'video'>;
}

export function useCamera(options?: UseCameraOptions): UseCameraReturn {
  const position = options?.position ?? 'FRONT';
  const aspectRatio = options?.aspectRatio ?? 1;
  const transformer = options?.transformer ?? ((file: File) => file);
  const mirrored = position === 'FRONT';

  const [opened, setOpened] = useState(false);
  const [snapping, setSnapping] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getVideoProps = (): ComponentPropsWithRef<'video'> => ({
    ref: videoRef,
    muted: true,
    autoPlay: true,
    controls: false,
    preload: 'none',
    playsInline: true,
    disablePictureInPicture: true,
    style: {
      width: '100%',
      height: 'auto',
      display: 'block',
      position: 'relative',
      boxSizing: 'border-box',
      background: 'transparent',
      pointerEvents: 'none',
      transform: mirrored ? 'scaleX(-1)' : undefined,
    },
  });

  const subscribers = useRef<SubscribeFn[]>([]);
  const subscribe = (fn: SubscribeFn): UnsubscribeFn => {
    subscribers.current = [...subscribers.current, fn];

    return () => {
      subscribers.current = subscribers.current.filter((subscriber) => subscriber !== fn);
    };
  };

  const open = async (): Promise<void> => {
    if (opened) return;

    setOpened(false);
    setSnapping(false);

    const availability = await checkCameraAvailability();

    if (availability === 'unavailable') {
      const error = new Error();
      error.name = 'CameraError';
      error.message = 'No camera device found.';
      throw error;
    }

    if (!videoRef.current) {
      const error = new Error();
      error.name = 'CameraError';
      error.message = 'Could not find the video element.';
      throw error;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: position === 'REAR' ? 'environment' : 'user',
          noiseSuppression: true,
          width: {
            ideal: 9999,
          },
          height: {
            ideal: 9999,
          },
          frameRate: {
            max: 120,
            ideal: 90,
          },
          aspectRatio: {
            exact: aspectRatio,
          },
        },
        preferCurrentTab: true,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setOpened(true);
      subscribers.current.forEach((subscriber) => {
        subscriber({type: 'OPENED'});
      });
    } catch (exception) {
      const error = new Error();
      error.name = 'CameraError';
      error.message = 'An unknown error occurred while accessing the camera.';

      if (exception instanceof DOMException && exception.name === 'NotFoundError') {
        error.message = 'No camera device found.';
      }

      if (exception instanceof DOMException && exception.name === 'NotAllowedError') {
        error.message = 'Permission to access camera was denied.';
      }

      throw error;
    }
  };

  const close = async (): Promise<void> => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }

    setOpened(false);
    setSnapping(false);

    subscribers.current.forEach((subscriber) => {
      subscriber({type: 'CLOSED'});
    });

    return Promise.resolve();
  };

  const snap = async ({
    type = 'image/jpg',
    quality = 0.925,
  }: CameraSnapOptions = {}): Promise<File> => {
    if (!opened) {
      const error = new Error();
      error.name = 'CameraError';
      error.message = 'Camera is not opened.';
      throw error;
    }

    setSnapping(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    invariant(video, 'Video element is not available.');
    invariant(context, 'Could not get canvas context.');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (mirrored) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const snapshot = await new Promise<File>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const ext = type.split(/\\/g).at(-1) || 'jpg';
            const name = `screenshot-${Date.now()}.${ext}`;
            const file = new File([blob], name, {
              type,
              endings: 'native',
              lastModified: Date.now(),
            });

            resolve(file);
          } else {
            const error = new Error();
            error.name = 'CameraError';
            error.message = 'Failed to create a snapshot.';
            reject(error);
          }

          setSnapping(false);
        },
        type,
        quality,
      );
    });

    const final = await transformer(snapshot);

    subscribers.current.forEach((subscriber) => {
      subscriber({
        type: 'SNAPSHOT',
        details: {
          file: final,
        },
      });
    });

    return final;
  };

  return {
    videoRef,
    opened,
    snapping,
    open,
    close,
    snap,
    subscribe,
    getVideoProps,
  };
}

async function checkCameraAvailability(): Promise<'available' | 'unavailable'> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.some((device) => device.kind === 'videoinput') ? 'available' : 'unavailable';
}
