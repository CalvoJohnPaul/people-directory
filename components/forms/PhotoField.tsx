'use client';

import {Presence, useFieldContext} from '@ark-ui/react';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {ArrowBigLeftIcon, ArrowBigRightIcon, CameraOffIcon, XIcon} from 'lucide-react';
import Image from 'next/image';
import {useEffect, useState} from 'react';
import {twMerge} from 'tailwind-merge';
import {cx} from 'tailwind-variants';
import {useInterval} from 'usehooks-ts';
import {Button} from '~/components/ui/Button';
import {useCamera} from '~/hooks/useCamera';
import {useDisclosure} from '~/hooks/useDisclosure';
import {useUploadFileMutation} from '~/hooks/useUploadFileMutation';
import {dataAttr} from '~/utils/dataAttr';
import {cropFace, detectFace, detectHeadTurn} from '~/utils/face';
import {ImagePlaceholderIcon} from '../icons/ImagePlaceholderIcon';
import {Dialog} from '../ui/Dialog';

export interface PhotoFieldProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  defaultValue?: string | null;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  onError?: (msg: string) => void;
}

export function PhotoField(props: PhotoFieldProps) {
  const field = useFieldContext();
  const [value, setValue] = useControllableState({
    prop: props.value,
    onChange: props.onChange,
    defaultProp: props.defaultValue ?? null,
  });

  const disclosure = useDisclosure();

  const clearable =
    value !== '' &&
    value !== null &&
    !field?.readOnly &&
    !props.readOnly &&
    !field?.disabled &&
    !props.disabled;

  return (
    <>
      <div className={cx('relative aspect-16/8 w-full', props.className)}>
        <button
          id={field.ids.control}
          type="button"
          onClick={() => {
            if (field?.readOnly || field?.disabled || props.readOnly || props.disabled) return;
            disclosure.setOpen(true);
          }}
          disabled={field?.disabled || props.disabled}
          className="relative flex size-full flex-col items-center justify-center border ui-invalid:border-red-400 bg-white py-4 outline-none"
          aria-invalid={field?.invalid || props.invalid}
          data-readonly={dataAttr(field?.readOnly || props.readOnly)}
          data-required={dataAttr(field?.required || props.required)}
          data-invalid={dataAttr(field?.invalid || props.invalid)}
          data-disabled={dataAttr(field?.disabled || props.disabled)}
          aria-label="Upload photo"
          aria-describedby={field?.ariaDescribedby}
        >
          {value ? (
            <div className="absolute top-0 left-0 size-full">
              <div className="mx-auto mt-2 aspect-square h-[calc(100%-1rem)]">
                <Image
                  src={value}
                  alt=""
                  width={200}
                  height={200}
                  className="size-full"
                  unoptimized
                />
              </div>
            </div>
          ) : (
            <ImagePlaceholderIcon className="size-12" />
          )}
        </button>

        <Presence
          present={clearable}
          asChild
          className="ui-closed:animate-fade-out ui-open:animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setValue(null)}
            tabIndex={-1}
            className="absolute top-2 right-2 size-7 place-items-center self-end border bg-white"
            aria-label="Clear photo"
          >
            <XIcon className="size-4.5 text-gray-700" />
          </button>
        </Presence>
      </div>

      <Dialog.Root
        open={disclosure.open}
        onOpenChange={(details) => {
          disclosure.setOpen(details.open);
        }}
        closeOnEscape
        closeOnInteractOutside
        unmountOnExit
      >
        <Dialog.Backdrop />
        <Dialog.Positioner className="flex items-center justify-center">
          <Dialog.Content className="h-auto w-90 p-6 lg:min-w-100 lg:max-w-100">
            <Dialog.CloseTrigger className="absolute -top-8 right-0 size-6 bg-white/8 text-white hover:text-white lg:top-0 lg:-right-8">
              <XIcon className="size-5" />
            </Dialog.CloseTrigger>

            <Camera
              onCompleted={(photo) => {
                disclosure.setOpen(false);
                setValue(photo);
              }}
              onCancelled={() => {
                disclosure.setOpen(false);
              }}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
}

function Camera(props: {onCancelled?: () => void; onCompleted?: (photo: string | null) => void}) {
  const mutation = useUploadFileMutation();

  const camera = useCamera({
    transformer(file) {
      return cropFace(file);
    },
  });

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
    <div className="w-full">
      <div hidden={src == null} className="block aspect-square w-full bg-gray-100">
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
        <video {...camera.getVideoProps()} />

        {!camera.opened && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300">
            <CameraOffIcon className="size-14" strokeWidth={1.33333} />
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
                if (snapshot) {
                  const uploadedFile = await mutation.mutateAsync(snapshot);
                  props.onCompleted?.(uploadedFile.url);
                } else {
                  props.onCompleted?.(null);
                }

                reset();
                await camera.close();
              }}
              disabled={mutation.isPending}
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
                    props.onCancelled?.();
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
