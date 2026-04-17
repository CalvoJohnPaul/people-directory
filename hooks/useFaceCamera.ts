import {invariant} from 'es-toolkit';
import {type ComponentPropsWithRef, useRef, useState} from 'react';
import {useInterval} from 'usehooks-ts';
import {cropFace, detectFace, detectHeadTurn, type FaceDetectionResult} from '~/utils/face';

export interface UseFaceCameraReturn {
  open: () => Promise<void>;
  close: () => void;
  data: File | null;
  error: string | null;
  opened: boolean;
  opening: boolean;
  getVideoProps: () => ComponentPropsWithRef<'video'>;
  capturing: boolean;
  canCapture: boolean;
  capture: () => void;
  reset: () => void;
  validatingFace: boolean;
  validatingLivenessLeft: boolean;
  validatingLivenessRight: boolean;
}

export function useFaceCamera(): UseFaceCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream>(null);

  const aspectRatio = 1;
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

  const [data, setData] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const [faceValidated, setFaceValidated] = useState(false);
  const [validatingFace, setValidatingFace] = useState(false);
  const [livenessLeftValidated, setLivenessLeftValidated] = useState(false);
  const [validatingLivenessLeft, setValidatingLivenessLeft] = useState(false);
  const [livenessRightValidated, setLivenessRightValidated] = useState(false);
  const [validatingLivenessRight, setValidatingLivenessRight] = useState(false);

  const [result, setResult] = useState<FaceDetectionResult | null>(null);

  const open = async (): Promise<void> => {
    invariant(videoRef.current, 'video element not found');

    setData(null);
    setError(null);
    setOpened(false);
    setOpening(true);
    setCapturing(false);
    setFaceValidated(false);
    setValidatingFace(false);
    setLivenessLeftValidated(false);
    setValidatingLivenessLeft(false);
    setLivenessRightValidated(false);
    setValidatingLivenessRight(false);
    setResult(null);

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
    setData(null);
    setError(null);
    setOpened(false);
    setOpening(false);
    setCapturing(false);
    setFaceValidated(false);
    setValidatingFace(false);
    setLivenessLeftValidated(false);
    setValidatingLivenessLeft(false);
    setLivenessRightValidated(false);
    setValidatingLivenessRight(false);
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

      try {
        setLivenessRightValidated(true);
        const turn = await detectHeadTurn(videoRef.current, true);
        setLivenessRightValidated(turn === 'RIGHT');
      } catch (error) {
        console.error(error);
      } finally {
        setLivenessRightValidated(false);
      }
    },
    !opened || livenessRightValidated || validatingLivenessRight || capturing || data ? null : 1000,
  );

  useInterval(
    async () => {
      if (!videoRef.current) {
        console.warn('video element not found');
        return;
      }

      try {
        setLivenessLeftValidated(true);
        const turn = await detectHeadTurn(videoRef.current, true);
        setLivenessLeftValidated(turn === 'LEFT');
      } catch (error) {
        console.error(error);
      } finally {
        setLivenessLeftValidated(false);
      }
    },
    !opened ||
      !livenessRightValidated ||
      livenessLeftValidated ||
      validatingLivenessLeft ||
      capturing ||
      data
      ? null
      : 1000,
  );

  useInterval(
    async () => {
      if (!videoRef.current) {
        console.warn('video element not found');
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

      const result = await detectFace(canvas);

      if (!result) {
        setFaceValidated(false);
        setResult(null);
      } else {
        setFaceValidated(true);
        setResult(result);
      }

      setValidatingFace(false);
    },
    !opened ||
      !livenessLeftValidated ||
      !livenessRightValidated ||
      faceValidated ||
      validatingFace ||
      capturing ||
      data
      ? null
      : result
        ? 2500
        : 1000,
  );

  const reset = () => {
    setData(null);
    setError(null);
    setFaceValidated(false);
    setLivenessLeftValidated(false);
    setLivenessRightValidated(false);
    setResult(null);
  };

  const canCapture = result != null && data == null && !capturing;

  const capture = async () => {
    if (!canCapture) {
      console.warn('Face cannot be captured at this moment. Please wait and try again.');
      return;
    }

    setCapturing(true);
    const cropped = await cropFace(result.file, result.cropPoints);
    setCapturing(false);
    setData(cropped);
    setLivenessLeftValidated(false);
    setLivenessRightValidated(false);
    setFaceValidated(false);
  };

  return {
    open,
    close,
    reset,
    data,
    error,
    opened,
    opening,
    getVideoProps,
    capture,
    canCapture,
    capturing,
    validatingFace,
    validatingLivenessLeft,
    validatingLivenessRight,
  };
}
