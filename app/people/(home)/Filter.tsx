'use client';

import {Portal, Swap} from '@ark-ui/react';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {capitalize, invariant, uniq} from 'es-toolkit';
import {ImageIcon, QrCodeIcon, XIcon} from 'lucide-react';
import Image from 'next/image';
import {parseAsFloat, parseAsInteger, parseAsNativeArrayOf, useQueryState} from 'nuqs';
import {useRef, useState} from 'react';
import {cx} from 'tailwind-variants';
import {useInterval} from 'usehooks-ts';
import {DateRangeField} from '~/components/forms/DateRangeField';
import {MobileNumberField} from '~/components/forms/MobileNumberField';
import {SelectField} from '~/components/forms/SelectField';
import {ImagePlaceholderIcon} from '~/components/icons/ImagePlaceholderIcon';
import {Button} from '~/components/ui/Button';
import {Dialog} from '~/components/ui/Dialog';
import {Field} from '~/components/ui/Field';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';
import {toaster} from '~/config/toaster';
import {useCamera} from '~/hooks/useCamera';
import {useDisclosure} from '~/hooks/useDisclosure';
import {type Gender, GenderDefinition} from '~/types/Person';
import {cropFace, detectFace, getFaceEmbedding} from '~/utils/face';
import {parseQrCode} from '~/utils/qrCode';

interface FilterValue {
  qrCode?: number[];
  gender?: Gender[];
  image?: number[];
}

interface FilterProps {
  value?: FilterValue | null;
  onChange?: (value: FilterValue | null) => void;
  defaultValue?: FilterValue | null;
  onClose?: () => void;
  className?: string;
}

export function Filter(props: FilterProps) {
  const [value, setValue] = useControllableState({
    prop: props.value,
    defaultProp: props.defaultValue ?? null,
    onChange: props.onChange,
  });

  return (
    <div className={cx('rounded-sm border', props.className)}>
      <div className="flex h-11 items-center gap-2 border-b px-4">
        <h2 className="font-medium">Filters</h2>
        <div className="grow"></div>
        <button type="button" onClick={() => props.onClose?.()}>
          <XIcon className="size-5" />
        </button>
      </div>
      <div className="space-y-3 p-4">
        <Field.Root className="rounded-md bg-gray-50 p-3">
          <Field.Label>Email address</Field.Label>
          <Field.Input placeholder="Enter email address" />
        </Field.Root>
        <Field.Root className="rounded-md bg-gray-50 p-3">
          <Field.Label>Mobile number</Field.Label>
          <MobileNumberField />
        </Field.Root>
        <Field.Root className="rounded-md bg-gray-50 p-3">
          <Field.Label>Gender</Field.Label>
          <SelectField
            options={GenderDefinition.options.map((option) => ({
              value: option,
              label: capitalize(option.toLowerCase()),
            }))}
            multiple
            placeholder="Select gender"
          />
        </Field.Root>
        <Field.Root className="rounded-md bg-gray-50 p-3">
          <Field.Label>Date registered</Field.Label>
          <DateRangeField placeholder="Select date" />
        </Field.Root>
      </div>
    </div>
  );
}

function SearchByQrCode() {
  const [, setQueryState] = useQueryState(
    'id',
    parseAsNativeArrayOf(parseAsInteger).withDefault([]),
  );

  const camera = useCamera();
  const disclosure = useDisclosure();

  const [value, setValue] = useState<number | null>(null);

  const parseId = (code: string): number | null => {
    const segments = code.split('/');
    const segment = segments.at(-1);
    const id = Number.parseInt(segment ?? '', 10);
    if (Number.isNaN(id) || id < 0) return null;
    return id;
  };

  useInterval(
    async () => {
      if (!camera.videoRef.current) return;
      const code = await parseQrCode(camera.videoRef.current);
      if (!code) return;
      const id = parseId(code);
      if (id === null) return;
      setValue(id);
      setQueryState((prev) => uniq([id, ...prev]));
      disclosure.setOpen(false);
    },
    disclosure.open && camera.opened ? 1000 : null,
  );

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root
      open={disclosure.open}
      onOpenChange={(details) => {
        disclosure.setOpen(details.open);
      }}
      onExitComplete={() => {
        camera.close();
      }}
      closeOnEscape
      closeOnInteractOutside
    >
      <Swap.Root swap={value !== null}>
        <Swap.Indicator type="off">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Dialog.Trigger asChild>
                <IconButton variant="outline" size="lg" className="shrink-0">
                  <QrCodeIcon />
                </IconButton>
              </Dialog.Trigger>
            </Tooltip.Trigger>
            <Portal>
              <Tooltip.Positioner>
                <Tooltip.Content>
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                  Search by QR code
                </Tooltip.Content>
              </Tooltip.Positioner>
            </Portal>
          </Tooltip.Root>
        </Swap.Indicator>
        <Swap.Indicator type="on">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <IconButton
                variant="outline"
                size="lg"
                className="shrink-0"
                onClick={() => {
                  setValue(null);
                  setQueryState((prev) => prev.filter((id) => id !== value));
                }}
              >
                <XIcon />
              </IconButton>
            </Tooltip.Trigger>
            <Portal>
              <Tooltip.Positioner>
                <Tooltip.Content>
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                  Clear QR code search
                </Tooltip.Content>
              </Tooltip.Positioner>
            </Portal>
          </Tooltip.Root>
        </Swap.Indicator>
      </Swap.Root>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className="h-auto w-96 p-6 lg:min-w-100 lg:max-w-100">
            <Dialog.CloseTrigger className="absolute -top-8 right-0 size-6 bg-white/8 text-white hover:text-white lg:top-0 lg:-right-8">
              <XIcon className="size-5" />
            </Dialog.CloseTrigger>
            <div className="relative block aspect-square w-full bg-gray-50">
              <div
                hidden={camera.opened}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300"
              >
                <QrCodeIcon className="size-15" strokeWidth={1.33333} />
              </div>
              <video {...camera.getVideoProps()} />
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                fullWidth
                variant="outline"
                disabled={camera.opened}
                onClick={() => {
                  inputRef.current?.click();
                }}
              >
                Upload
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  const code = await parseQrCode(file);

                  if (!code) {
                    toaster.error({
                      title: 'Invalid QR code',
                      description: 'The uploaded image does not contain a valid QR code.',
                    });

                    if (inputRef.current) inputRef.current.value = '';
                    return;
                  }

                  const id = parseId(code);

                  if (id === null) {
                    toaster.error({
                      title: 'Invalid QR code',
                      description: 'The QR code does not contain a valid ID.',
                    });

                    if (inputRef.current) inputRef.current.value = '';
                    return;
                  }

                  setValue(id);
                  setQueryState((prev) => uniq([id, ...prev]));
                  disclosure.setOpen(false);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="hidden"
              />
              <Button
                fullWidth
                onClick={() => {
                  if (camera.opened) {
                    camera.close();
                  } else {
                    camera.open();
                  }
                }}
              >
                {camera.opened ? 'Cancel' : 'Scan'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function SearchByPhoto() {
  const [value, setValue] = useQueryState(
    'image',
    parseAsNativeArrayOf(parseAsFloat).withDefault([]),
  );

  const disclosure = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);

  return (
    <Dialog.Root
      open={disclosure.open}
      onOpenChange={(details) => {
        disclosure.setOpen(details.open);
      }}
      closeOnEscape
      closeOnInteractOutside
      onExitComplete={() => {
        setPhoto(null);
        setParsing(false);
      }}
    >
      <Swap.Root swap={value.length > 0}>
        <Swap.Indicator type="off">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Dialog.Trigger asChild>
                <IconButton variant="outline" size="lg" className="shrink-0">
                  <ImageIcon />
                </IconButton>
              </Dialog.Trigger>
            </Tooltip.Trigger>
            <Portal>
              <Tooltip.Positioner>
                <Tooltip.Content>
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                  Search by photo
                </Tooltip.Content>
              </Tooltip.Positioner>
            </Portal>
          </Tooltip.Root>
        </Swap.Indicator>
        <Swap.Indicator type="on">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <IconButton
                variant="outline"
                size="lg"
                className="shrink-0"
                onClick={() => {
                  setValue([]);
                }}
              >
                <XIcon />
              </IconButton>
            </Tooltip.Trigger>
            <Portal>
              <Tooltip.Positioner>
                <Tooltip.Content>
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                  Clear photo search
                </Tooltip.Content>
              </Tooltip.Positioner>
            </Portal>
          </Tooltip.Root>
        </Swap.Indicator>
      </Swap.Root>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className="h-auto w-96 p-6 lg:min-w-100 lg:max-w-100">
            <Dialog.CloseTrigger className="absolute -top-8 right-0 size-6 bg-white/8 text-white hover:text-white lg:top-0 lg:-right-8">
              <XIcon className="size-5" />
            </Dialog.CloseTrigger>
            <div className="relative block aspect-square w-full bg-gray-50">
              {photo && (
                <Image
                  src={URL.createObjectURL(photo)}
                  alt="Uploaded photo"
                  width={400}
                  height={400}
                  unoptimized
                  className="size-full object-cover"
                />
              )}

              {!photo && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300">
                  <ImagePlaceholderIcon className="size-15" />
                </div>
              )}
            </div>
            <div className="mt-5 flex gap-3">
              {!!photo && (
                <>
                  <Button
                    fullWidth
                    variant="outline"
                    disabled={parsing}
                    onClick={() => {
                      setPhoto(null);
                    }}
                  >
                    Reupload
                  </Button>
                  <Button
                    fullWidth
                    disabled={parsing}
                    onClick={async () => {
                      setParsing(true);

                      try {
                        const embedding = await getFaceEmbedding(photo);
                        invariant(embedding, 'No face embedding found');
                        setValue(embedding);
                        disclosure.setOpen(false);
                      } catch (error) {
                        console.log(error);
                        toaster.error({
                          title: 'Face extraction failed',
                          description:
                            'Unable to process the uploaded photo. Please try again with a different photo.',
                        });
                      } finally {
                        setParsing(false);
                      }
                    }}
                  >
                    Continue
                  </Button>
                </>
              )}

              {!photo && (
                <>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => disclosure.setOpen(false)}
                    disabled={parsing}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => {
                      inputRef.current?.click();
                    }}
                    disabled={parsing}
                  >
                    Upload
                  </Button>
                </>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  setParsing(true);
                  const faceFound = await detectFace(file);

                  if (!faceFound) {
                    toaster.error({
                      title: 'No face detected',
                      description: 'The uploaded image does not contain a detectable face.',
                    });

                    if (inputRef.current) inputRef.current.value = '';
                    setParsing(false);
                    return;
                  }

                  const face = await cropFace(file);
                  setPhoto(face);
                  if (inputRef.current) inputRef.current.value = '';
                  setParsing(false);
                }}
                className="hidden"
              />
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
