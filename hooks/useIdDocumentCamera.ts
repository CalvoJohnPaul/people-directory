import {invariant} from 'es-toolkit';
import {
  type ComponentPropsWithRef,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useMediaQuery} from 'usehooks-ts';
import {cropIdDocument, detectIdDocument, explainIdDocumentDetection} from '~/utils/idDocument';

export type IdDocumentCameraEvent =
  | {type: 'OPENED'}
  | {type: 'CLOSED'}
  | {type: 'ERROR'; data: {error: string}}
  | {type: 'ID_DOCUMENT_DETECTED'; data: {file: File}}
  | {type: 'ID_DOCUMENT_CAPTURED'; data: {file: File}};

export type IdDocumentCameraSubscribeFn = (event: IdDocumentCameraEvent) => void;

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
  subscribe: (fn: IdDocumentCameraSubscribeFn) => () => void;
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
      height: '100%',
      display: 'block',
      boxSizing: 'border-box',
      pointerEvents: 'none',
    },
  });

  const desktop = useMediaQuery('(min-width: 1024px)');

  const [hint, setHint] = useState<string | null>(null);
  const [test, setTest] = useState<File | null>(null);
  const [data, setData] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [validated, setValidated] = useState(false);
  const [validating, setValidating] = useState(false);

  const subscribers = useRef<IdDocumentCameraSubscribeFn[]>([]);

  const subscribe = (fn: IdDocumentCameraSubscribeFn) => {
    subscribers.current = [...subscribers.current, fn];

    return () => {
      subscribers.current = subscribers.current.filter((subscriber) => subscriber !== fn);
    };
  };

  const triggerEvent = useCallback((event: IdDocumentCameraEvent) => {
    subscribers.current.forEach((subscriber) => {
      subscriber(event);
    });
  }, []);

  const open = async (): Promise<void> => {
    invariant(videoRef.current, 'video element not found');

    setHint(null);
    setTest(null);
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

      triggerEvent({type: 'OPENED'});
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
      triggerEvent({type: 'ERROR', data: {error}});
    } finally {
      setOpening(false);
    }
  };

  const close = () => {
    setHint(null);
    setTest(null);
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

    triggerEvent({type: 'CLOSED'});
  };

  useEffect(() => {
    if (!opened) return;
    if (!videoRef.current) return;
    if (validating) return;
    if (data) return;

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

      if (!result.ok) {
        setTest(null);
        setHint(result.error.message);
        setValidated(false);
      } else {
        const cropped = result.data.cropPoints
          ? await cropIdDocument(result.data.file, result.data.cropPoints)
          : result.data.file;

        setTest(cropped);
        setHint(null);
        setValidated(true);
        triggerEvent({type: 'ID_DOCUMENT_DETECTED', data: {file: cropped}});
      }

      setValidating(false);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data, opened, validating, triggerEvent]);

  const reset = () => {
    setHint(null);
    setTest(null);
    setData(null);
    setError(null);
    setValidated(false);
  };

  const canCapture = validated && test != null && data == null;
  const capture = () => {
    if (data != null) {
      console.warn('ID document already captured. Please reset to capture again.');
      return;
    }

    if (test == null) {
      console.warn('No ID document detected yet. Please wait and try again.');
      return;
    }

    setData(test);
    setTest(null);
  };

  return {
    open,
    close,
    hint,
    data,
    error,
    opened,
    opening,
    videoRef,
    getVideoProps,
    subscribe,
    capture,
    canCapture,
    reset,
  };
}
