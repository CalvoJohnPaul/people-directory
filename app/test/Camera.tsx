'use client';

import {ArrowBigLeftIcon, ArrowBigRightIcon, CameraOffIcon} from 'lucide-react';
import Image from 'next/image';
import {useEffect, useState} from 'react';
import {twMerge} from 'tailwind-merge';
import {useInterval} from 'usehooks-ts';
import {Button} from '~/components/ui/Button';
import {useCamera} from '~/hooks/useCamera';
import {detectFace, detectHeadTurn} from '~/utils/face';

interface CameraProps {
  onDone?: (photo: File | null) => void;
}

export function Camera(props: CameraProps) {
  const camera = useCamera();
  const [snapshot, setSnapshot] = useState<File | null>(null);
  const src = snapshot ? URL.createObjectURL(snapshot) : null;

  const [faceVerified, setFaceVerified] = useState(false);
  const [faceVerifying, setFaceVerifying] = useState(false);
  const [livenessLeftVerified, setLivenessLeftVerified] = useState(false);
  const [livenessLeftVerifying, setLivenessLeftVerifying] = useState(false);
  const [livenessRightVerified, setLivenessRightVerified] = useState(false);
  const [livenessRightVerifying, setLivenessRightVerifying] = useState(false);

  useEffect(() => {
    const unsubscribe = camera.subscribe(async (event) => {
      if (event.type === 'SNAPSHOT') {
        setSnapshot(event.details.file);
      }
    });

    return () => unsubscribe();
  }, [camera.subscribe]);

  const reset = () => {
    setSnapshot(null);
    setFaceVerified(false);
    setFaceVerifying(false);
    setLivenessLeftVerified(false);
    setLivenessLeftVerifying(false);
    setLivenessRightVerified(false);
    setLivenessRightVerifying(false);
  };

  useEffect(() => {
    return () => {
      setSnapshot(null);
      setFaceVerified(false);
      setFaceVerifying(false);
      setLivenessLeftVerified(false);
      setLivenessLeftVerifying(false);
      setLivenessRightVerified(false);
      setLivenessRightVerifying(false);
    };
  }, []);

  useInterval(
    async () => {
      if (!camera.videoRef.current) return;

      try {
        setLivenessRightVerifying(true);
        const turn = await detectHeadTurn(camera.videoRef.current, true);
        setLivenessRightVerified(turn === 'RIGHT');
      } catch (error) {
        console.error(error);
      } finally {
        setLivenessRightVerifying(false);
      }
    },
    src == null && camera.opened && !livenessRightVerified && !livenessRightVerifying ? 1000 : null,
  );

  useInterval(
    async () => {
      if (!camera.videoRef.current) return;

      try {
        setLivenessLeftVerifying(true);
        const turn = await detectHeadTurn(camera.videoRef.current, true);
        setLivenessLeftVerified(turn === 'LEFT');
      } catch (error) {
        console.error(error);
      } finally {
        setLivenessLeftVerifying(false);
      }
    },
    src == null &&
      camera.opened &&
      livenessRightVerified &&
      !livenessLeftVerified &&
      !livenessLeftVerifying
      ? 1000
      : null,
  );

  useInterval(
    async () => {
      if (!camera.videoRef.current) return;

      try {
        setFaceVerifying(true);
        const score = await detectFace(camera.videoRef.current);
        setFaceVerified(score >= 0.8);
      } catch (error) {
        console.error(error);
      } finally {
        setFaceVerifying(false);
      }
    },
    src == null && camera.opened && livenessRightVerified && livenessLeftVerified && !faceVerifying
      ? 1000
      : null,
  );

  return (
    <div className="mx-auto max-w-80">
      <div hidden={src == null} className="block aspect-square w-full bg-gray-50">
        {!!src && (
          <Image
            src={src}
            alt=""
            width={300}
            height={300}
            unoptimized
            className="block size-full object-cover"
          />
        )}
      </div>

      <div
        hidden={src != null}
        className={twMerge(
          'relative aspect-square w-full bg-gray-50',
          camera.opened && 'border-2 border-dashed',
          faceVerified && livenessLeftVerified && livenessRightVerified
            ? 'border-green-400'
            : 'border-amber-400',
        )}
      >
        <video {...camera.videoProps} />

        {!camera.opened && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-200">
            <CameraOffIcon className="size-12" strokeWidth={1.66667} />
          </div>
        )}

        {camera.opened && !livenessRightVerified && (
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-green-800/50 px-2.5 py-1.5 font-mono text-green-100 text-xs uppercase leading-none">
            <span>Turn right</span>
            <ArrowBigRightIcon className="size-4 animate-sway-right" />
          </div>
        )}

        {camera.opened && livenessRightVerified && !livenessLeftVerified && (
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-green-800/50 px-2.5 py-1.5 font-mono text-green-100 text-xs uppercase leading-none">
            <ArrowBigLeftIcon className="size-4 animate-sway-left" />
            <span>Turn left</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        {src != null && (
          <>
            <Button variant="outline" fullWidth onClick={reset}>
              Retake
            </Button>
            <Button
              fullWidth
              onClick={async () => {
                props.onDone?.(snapshot);
                await camera.close();
              }}
            >
              Use photo
            </Button>
          </>
        )}

        {src == null && (
          <>
            {!camera.opened && (
              <>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={async () => {
                    await camera.close();
                    reset();
                    props.onDone?.(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={async () => {
                    await camera.open();
                  }}
                >
                  Open
                </Button>
              </>
            )}

            {camera.opened && (
              <>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={async () => {
                    await camera.close();
                    reset();
                  }}
                >
                  Close
                </Button>
                <Button
                  fullWidth
                  onClick={async () => {
                    await camera.snap();
                  }}
                  disabled={
                    camera.snapping ||
                    !faceVerified ||
                    !livenessLeftVerified ||
                    !livenessRightVerified
                  }
                >
                  Take photo
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
