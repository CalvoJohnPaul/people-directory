import { invariant } from 'es-toolkit';
import { type ComponentPropsWithRef, type RefObject, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { cropIdDocument, detectIdDocument, explainIdDocumentDetection } from '~/utils/idDocument';

export interface UseIdDocumentCameraReturn {
  open: () => Promise<void>;
  close: () => void;
  hint: string | null;
  data: File | null;
  error: string | null;
  opened: boolean;
  opening: boolean;
  validated: boolean;
  validating: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  getVideoProps: () => ComponentPropsWithRef<'video'>;
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
      height: '100%',
      display: 'block',
      boxSizing: 'border-box',
      pointerEvents: 'none',
    },
  });

  const desktop = useMediaQuery('(min-width: 1024px)');

  const [hint, setHint] = useState<string | null>(null);
  const [data, setData] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [validated, setValidated] = useState(false);
  const [validating, setValidating] = useState(false);

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
            exact: desktop ? 16 / 9 : 4 / 3,
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

      if (e instanceof Error) {
        switch (e.name) {
          case 'NotAllowedError':
            setError('You need to allow camera access to use this feature.');
            return;
          case 'NotFoundError':
            setError('Sorry, but we could not find a camera on your device.');
            return;
          default:
            break;
        }
      }

      setError('Failed to open camera. Check your device settings and try again.');
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

    const interval = setInterval(async () => {
      invariant(videoRef.current, 'video element not found');

      const canvas = document.createElement('canvas');

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const context = canvas.getContext('2d');

      invariant(context, 'canvas context not found');

      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const detection = await detectIdDocument(imageData);
      const result = explainIdDocumentDetection(detection);

      console.log(detection);

      if (!result.ok) {
        setData(null);
        setHint(result.error.message);
        setValidated(false);
      } else {
        const cropped = result.data.cropPoints
          ? await cropIdDocument(result.data.file, result.data.cropPoints)
          : result.data.file;

        setData(cropped);
        setHint(null);
        setValidated(true);
      }

      setValidating(false);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [opened, validating]);

  return {
    open,
    close,
    hint,
    data,
    error,
    opened,
    opening,
    validated,
    validating,
    videoRef,
    getVideoProps,
  };
}
