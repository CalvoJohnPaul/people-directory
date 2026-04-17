import {invariant} from 'es-toolkit';
import {type ComponentPropsWithRef, type RefObject, useEffect, useRef, useState} from 'react';
import {cropFace, detectFace, type FaceDetectionResult} from '~/utils/face';

export interface UseIdDocumentCameraReturn {
  open: () => Promise<void>;
  close: () => void;
  hint: string | null;
  data: File | null;
  error: string | null;
  opened: boolean;
  opening: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  getVideoProps: () => ComponentPropsWithRef<'video'>;
  capturing: boolean;
  canCapture: boolean;
  capture: () => void;
  reset: () => void;
}

export function useIdDocumentCamera(): UseIdDocumentCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream>(null);

  const getVideoProps = (): ComponentPropsWithRef<'video'> => ({
    ref: videoRef,
    muted: true,
    preload: 'none',
    playsInline: true,
    disablePictureInPicture: true,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      aspectRatio: 4 / 3,
    },
  });

  const [hint, setHint] = useState<string | null>(null);
  const [data, setData] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<FaceDetectionResult | null>(null);

  const open = async (): Promise<void> => {
    invariant(videoRef.current, 'video element not found');

    setHint(null);
    setData(null);
    setError(null);
    setOpened(false);
    setOpening(true);
    setCapturing(false);
    setValidated(false);
    setValidating(false);
    setValidationResult(null);

    try {
      const result = await navigator.mediaDevices.getUserMedia({
        audio: false,
        preferCurrentTab: true,
        video: {
          facingMode: 'environment',
          noiseSuppression: true,
          width: {
            ideal: 9999,
          },
          height: {
            ideal: 9999,
          },
          aspectRatio: {
            exact: 4 / 3,
          },
          frameRate: {
            max: 120,
            ideal: 90,
          },
        },
      });

      videoRef.current.srcObject = result;
      streamRef.current = result;

      setOpened(true);
    } catch (e) {
      console.warn(e);

      let error = 'Failed to open camera. Check your device settings and try again.';

      if (e instanceof Error) {
        switch (e.name) {
          case 'NotAllowedError':
            error = 'You need to allow camera access to use this feature.';
            break;
          case 'NotFoundError':
            error = 'Sorry, but we could not find a camera on your device.';
            break;
          default:
            break;
        }
      }

      setError(error);
    } finally {
      setOpening(false);
    }
  };

  const close = () => {
    setHint(null);
    setData(null);
    setError(null);
    setOpened(false);
    setOpening(false);
    setCapturing(false);
    setValidated(false);
    setValidating(false);
    setValidationResult(null);

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
  };

  useEffect(() => {
    if (!opened) return;
    if (!videoRef.current) return;
    if (validating) return;
    if (capturing) return;
    if (data) return;

    const interval = setInterval(
      async () => {
        invariant(videoRef.current, 'video element not found');

        const canvas = document.createElement('canvas');

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const context = canvas.getContext('2d');

        invariant(context, 'canvas context not found');

        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const result = await detectFace(canvas);

        if (!result) {
          setHint('Please make sure your face is fully visible and clear');
          setValidated(false);
          setValidationResult(null);
        } else {
          setHint(null);
          setValidated(true);
          setValidationResult(result);
        }

        setValidating(false);
      },
      validationResult ? 2500 : 1000,
    );

    return () => {
      clearInterval(interval);
    };
  }, [
    /**/
    data,
    opened,
    capturing,
    validating,
    validationResult,
  ]);

  const reset = () => {
    setHint(null);
    setData(null);
    setError(null);
    setValidated(false);
    setValidationResult(null);
  };

  const canCapture = validated && validationResult != null && data == null && !capturing;

  const capture = async () => {
    if (!canCapture) {
      console.warn('Face cannot be captured at this moment. Please wait and try again.');
      return;
    }

    setCapturing(true);
    const cropped = await cropFace(validationResult.file, validationResult.cropPoints);
    setData(cropped);
    setHint(null);
    setCapturing(false);
    setValidated(false);
    setValidationResult(null);
  };

  return {
    open,
    close,
    reset,
    hint,
    data,
    error,
    opened,
    opening,
    videoRef,
    getVideoProps,
    capture,
    canCapture,
    capturing,
  };
}
