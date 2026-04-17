import {invariant} from 'es-toolkit';
import {type ComponentPropsWithRef, useRef, useState} from 'react';
import {useInterval, useMediaQuery} from 'usehooks-ts';
import {
  cropIdDocument,
  detectIdDocument,
  explainIdDocumentDetection,
  type SuccessIdDocumentDetectionData,
} from '~/utils/idDocument';

export interface UseIdDocumentCameraReturn {
  open: () => Promise<void>;
  close: () => void;
  hint: string | null;
  data: File | null;
  error: string | null;
  opened: boolean;
  opening: boolean;
  getVideoProps: () => ComponentPropsWithRef<'video'>;
  capturing: boolean;
  canCapture: boolean;
  capture: () => void;
  reset: () => void;
}

export function useIdDocumentCamera(): UseIdDocumentCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream>(null);

  const desktop = useMediaQuery('(min-width: 1024px)');
  const aspectRatio = desktop ? 16 / 9 : 4 / 3;
  const getVideoProps = (): ComponentPropsWithRef<'video'> => ({
    ref: videoRef,
    muted: true,
    autoPlay: true,
    playsInline: true,
    preload: 'none',
    disablePictureInPicture: true,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      aspectRatio,
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

  const [result, setResult] = useState<SuccessIdDocumentDetectionData | null>(null);

  const open = async (): Promise<void> => {
    invariant(videoRef.current, 'video element not found');

    setHint(null);
    setData(null);
    setError(null);
    setOpened(false);
    setOpening(true);
    setValidated(false);
    setValidating(false);

    try {
      const result = await navigator.mediaDevices.getUserMedia({
        audio: false,
        preferCurrentTab: true,
        video: {
          facingMode: desktop ? 'environment' : 'user',
          noiseSuppression: true,
          width: {
            ideal: 9999,
          },
          height: {
            ideal: 9999,
          },
          aspectRatio: {
            exact: aspectRatio,
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
    setValidated(false);
    setValidating(false);
    setResult(null);

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

  useInterval(
    async () => {
      if (!videoRef.current) {
        console.warn('video element not found');
        return;
      }

      if (videoRef.current.readyState < videoRef.current.HAVE_ENOUGH_DATA) {
        console.warn('video not ready');
        return;
      }

      const canvas = document.createElement('canvas');

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const context = canvas.getContext('2d');

      if (!context) {
        console.warn('could not get canvas context');
        return;
      }

      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const detection = await detectIdDocument(imageData);
      const result = explainIdDocumentDetection(detection);

      if (!result.ok) {
        setHint(result.error.message);
        setValidated(false);
        setResult(null);
      } else {
        setHint(null);
        setValidated(true);
        setResult(result.data);
      }

      setValidating(false);
    },
    !opened || validating || capturing || data ? null : result ? 2500 : 1000,
  );

  const reset = () => {
    setHint(null);
    setData(null);
    setError(null);
    setValidated(false);
    setValidating(false);
    setResult(null);
  };

  const canCapture = validated && result != null && data == null && !capturing;

  const capture = async () => {
    if (!canCapture) {
      console.warn('ID document cannot be captured at this moment. Please wait and try again.');
      return;
    }

    setCapturing(true);
    const cropped = await cropIdDocument(result.file, result.cropPoints);
    setCapturing(false);
    setData(cropped);
    setHint(null);
    setValidated(false);
    setResult(null);
  };

  return {
    open,
    close,
    hint,
    data,
    error,
    opened,
    opening,
    getVideoProps,
    capture,
    canCapture,
    capturing,
    reset,
  };
}
