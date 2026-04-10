import {invariant} from 'es-toolkit';
import {type ComponentPropsWithRef, type RefObject, useEffect, useRef, useState} from 'react';

export type CameraPosition = 'REAR' | 'FRONT';

export interface UseCameraOptions {
  position?: CameraPosition;
  aspectRatio?: number;
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

export interface UseCameraReturn {
  videoRef: RefObject<HTMLVideoElement | null>;
  videoProps: ComponentPropsWithRef<'video'>;
  opened: boolean;
  open: () => Promise<void>;
  close: () => void;
  snap: (options?: CameraSnapOptions) => Promise<File>;
}

export function useCamera(options?: UseCameraOptions): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoProps: ComponentPropsWithRef<'video'> = {
    ref: videoRef,
    muted: true,
    controls: false,
    autoPlay: true,
    playsInline: true,
    disablePictureInPicture: true,
    style: {
      display: 'block',
      width: '100%',
      height: 'auto',
      objectFit: 'cover',
    },
  };

  const [opened, setOpened] = useState(false);

  const open = async (): Promise<void> => {
    if (opened) return;

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
          facingMode: options?.position === 'REAR' ? 'environment' : 'user',
          aspectRatio: options?.aspectRatio,
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
        },
        preferCurrentTab: true,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
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

  const close = () => {
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
  };

  const snap = ({type = 'image/jpg', quality = 0.925}: CameraSnapOptions = {}): Promise<File> => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    invariant(video, 'Video element is not available.');
    invariant(context, 'Could not get canvas context.');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise<File>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const ext = type.split(/\\/g).at(-1) || 'jpg';
            const name = `screenshot-${crypto.randomUUID()}.${ext}`;
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
        },
        type,
        quality,
      );
    });
  };

  useEffect(() => {
    const handleOpened = () => setOpened(true);
    const handleClosed = () => setOpened(false);

    videoRef.current?.addEventListener('play', handleOpened);
    videoRef.current?.addEventListener('pause', handleClosed);
    videoRef.current?.addEventListener('ended', handleClosed);

    return () => {
      videoRef.current?.removeEventListener('play', handleOpened);
      videoRef.current?.removeEventListener('pause', handleClosed);
      videoRef.current?.removeEventListener('ended', handleClosed);
    };
  });

  return {
    videoRef,
    videoProps,
    opened,
    open,
    close,
    snap,
  };
}

async function checkCameraAvailability(): Promise<'available' | 'unavailable'> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.some((device) => device.kind === 'videoinput') ? 'available' : 'unavailable';
}
