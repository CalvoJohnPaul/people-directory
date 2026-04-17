/** biome-ignore-all lint/a11y/noStaticElementInteractions: "" */
/** biome-ignore-all lint/a11y/useSemanticElements: "" */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: "" */
'use client';

import {Portal} from '@ark-ui/react';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {capitalize} from 'es-toolkit';
import {QrCodeIcon, XIcon} from 'lucide-react';
import Image from 'next/image';
import {useCallback, useRef, useState} from 'react';
import {cx} from 'tailwind-variants';
import {useDebouncedCallback} from 'use-debounce';
import {useInterval, useTimeout} from 'usehooks-ts';
import z from 'zod';
import {AsyncComboboxField} from '~/components/forms/AsyncComboboxField';
import {DateRangeField} from '~/components/forms/DateRangeField';
import {NumberRangeField} from '~/components/forms/NumberRangeField';
import {SelectField} from '~/components/forms/SelectField';
import {ImagePlaceholderIcon} from '~/components/icons/ImagePlaceholderIcon';
import {Button} from '~/components/ui/Button';
import {Dialog} from '~/components/ui/Dialog';
import {Field} from '~/components/ui/Field';
import {getClient} from '~/config/client';
import {toaster} from '~/config/toaster';
import {useCamera} from '~/hooks/useCamera';
import {useDisclosure} from '~/hooks/useDisclosure';
import {usePeopleByFaceEmbeddingQuery} from '~/hooks/usePeopleByFaceEmbeddingQuery';
import {usePeopleQuery} from '~/hooks/usePeopleQuery';
import {usePersonQuery} from '~/hooks/usePersonQuery';
import type {DateRange, NumberRange} from '~/types/common';
import {type Gender, GenderDefinition} from '~/types/Person';
import {cropFace, detectFace, getFaceEmbedding} from '~/utils/face';
import {parseQrCode} from '~/utils/qrCode';

export interface FilterValue {
  id?: number[] | null;
  gender?: Gender[] | null;
  age?: NumberRange | null;
  image?: number[] | null;
  qrCode?: number | null;
  createdAt?: DateRange | null;
}

export interface FilterProps {
  value?: FilterValue;
  onChange?: (value: FilterValue) => void;
  defaultValue?: FilterValue;
  className?: string;
}

const client = getClient();

export function Filter(props: FilterProps) {
  const [value, setValue] = useControllableState({
    prop: props.value,
    defaultProp: props.defaultValue ?? {},
    onChange: props.onChange,
  });

  const [value__internal, setValue__internal] = useState(value);

  const setValue__debounced = useDebouncedCallback(setValue, 350);

  return (
    <div className={cx('rounded-sm border', props.className)}>
      <div className="flex h-11 items-center gap-2 border-b px-4">
        <h2 className="font-medium">Filters</h2>
      </div>
      <div className="space-y-3 p-4">
        <Field.Root className="rounded-sm bg-neutral-100/75 p-3">
          <Field.Label>Email address</Field.Label>
          <AsyncComboboxField
            options={async (emailAddress) => {
              if (emailAddress.trim().length < 1) return [];

              const data = await client.fetchQuery({
                queryKey: usePeopleQuery.getQueryKey({emailAddress, limit: 5}),
                queryFn: usePeopleQuery.getQueryFn({emailAddress, limit: 5}),
              });

              return data.map((person) => ({
                value: `${person.id}`,
                label: `${person.fullName}`,
              }));
            }}
            value={value__internal.id?.map((v) => v.toString()) ?? []}
            onChange={(newValue) => {
              const id = newValue.map((v) => Number.parseInt(v, 10));
              setValue__internal((prev) => ({...prev, id}));
              setValue__debounced((prev) => ({...prev, id}));
            }}
            multiple
            placeholder="Search email address"
          />
        </Field.Root>
        <Field.Root className="rounded-sm bg-neutral-100/75 p-3">
          <Field.Label>Mobile number</Field.Label>
          <AsyncComboboxField
            options={async (mobileNumber) => {
              if (mobileNumber.trim().length < 1) return [];

              const data = await client.fetchQuery({
                queryKey: usePeopleQuery.getQueryKey({mobileNumber, limit: 5}),
                queryFn: usePeopleQuery.getQueryFn({mobileNumber, limit: 5}),
              });

              return data.map((person) => ({
                value: `${person.id}`,
                label: `${person.fullName}`,
              }));
            }}
            value={value__internal.id?.map((v) => v.toString()) ?? []}
            onChange={(newValue) => {
              const id = newValue.map((v) => Number.parseInt(v, 10));
              setValue__internal((prev) => ({...prev, id}));
              setValue__debounced((prev) => ({...prev, id}));
            }}
            multiple
            placeholder="Search mobile number"
          />
        </Field.Root>
        <Field.Root className="rounded-sm bg-neutral-100/75 p-3">
          <Field.Label>Gender</Field.Label>
          <SelectField
            options={GenderDefinition.options.map((option) => ({
              value: option,
              label: capitalize(option.toLowerCase()),
            }))}
            value={value__internal.gender ?? []}
            onChange={(newValue) => {
              const gender = z.array(GenderDefinition).parse(newValue);
              setValue__internal((prev) => ({...prev, gender}));
              setValue__debounced((prev) => ({...prev, gender}));
            }}
            multiple
            placeholder="Select gender"
          />
        </Field.Root>
        <Field.Root className="rounded-sm bg-neutral-100/75 p-3">
          <Field.Label>Age</Field.Label>
          <NumberRangeField
            value={value__internal.age ?? null}
            onChange={(age) => {
              setValue__internal((prev) => ({...prev, age}));
              setValue__debounced((prev) => ({...prev, age}));
            }}
          />
        </Field.Root>
        <Field.Root className="rounded-sm bg-neutral-100/75 p-3">
          <Field.Label>Date registered</Field.Label>
          <DateRangeField
            placeholder="Select date"
            value={value__internal.createdAt}
            onChange={(createdAt) => {
              setValue__internal((prev) => ({...prev, createdAt}));
              setValue__debounced((prev) => ({...prev, createdAt}));
            }}
          />
        </Field.Root>
        <SearchByQrCode
          onChange={(qrCode) => {
            setValue__internal((prev) => ({...prev, qrCode}));
            setValue__debounced((prev) => ({...prev, qrCode}));
          }}
        />
        <SearchByPhoto
          onChange={(image) => {
            setValue__internal((prev) => ({...prev, image}));
            setValue__debounced((prev) => ({...prev, image}));
          }}
        />
      </div>
    </div>
  );
}

function SearchByQrCode({onChange}: {onChange?: (id: number | null) => void}) {
  const camera = useCamera();
  const disclosure = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);

  const parseId = useCallback(async (code: string): Promise<number | null> => {
    setParsing(true);

    const segments = code.split('/');
    const segment = segments.at(-1);

    const id = Number.parseInt(segment ?? '', 10);

    if (Number.isNaN(id) || id < 0) {
      return null;
    }

    try {
      const person = await client.fetchQuery({
        queryKey: usePersonQuery.getQueryKey(id),
        queryFn: usePersonQuery.getQueryFn(id),
      });

      return person?.id ?? null;
    } catch {
      return null;
    } finally {
      setParsing(false);
    }
  }, []);

  useInterval(
    async () => {
      if (parsing) return;
      if (!camera.videoRef.current) return;
      const code = await parseQrCode(camera.videoRef.current);
      if (!code) return;
      const id = await parseId(code);
      if (id === null) return;
      disclosure.setOpen(false);
      onChange?.(id);
    },
    disclosure.open && camera.opened ? 1000 : null,
  );

  return (
    <Dialog.Root
      open={disclosure.open}
      onOpenChange={(details) => {
        disclosure.setOpen(details.open);
      }}
      closeOnEscape
      closeOnInteractOutside
      onExitComplete={() => {
        camera.close();
      }}
    >
      <Field.Root className="rounded-sm bg-neutral-100/75 p-3">
        <Field.Label>QR Code</Field.Label>
        <button
          type="button"
          onClick={() => {
            disclosure.setOpen(true);
          }}
          className="relative block aspect-video w-full rounded-sm border bg-white outline-none"
        >
          {file && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange?.(null);
                setFile(null);
              }}
              className="absolute top-2 right-2 grid size-7 place-items-center self-end rounded-sm border bg-white"
            >
              <XIcon className="size-4.5 text-neutral-700" />
            </span>
          )}

          {file && (
            <div className="flex size-full flex-col justify-center">
              <Image
                src={URL.createObjectURL(file)}
                alt=""
                width={400}
                height={400}
                unoptimized
                className="mx-auto max-h-[80%] w-auto max-w-[80%] object-cover"
              />
            </div>
          )}

          {!file && (
            <QrCodeIcon
              className="absolute top-1/2 left-1/2 block size-14 -translate-x-1/2 -translate-y-1/2 text-gray-300"
              strokeWidth={1.66667}
            />
          )}
        </button>
      </Field.Root>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className="h-auto w-96 p-6 lg:min-w-100 lg:max-w-100">
            <Dialog.CloseTrigger className="absolute -top-8 right-0 size-6 rounded-sm bg-white/8 text-white hover:text-white lg:top-0 lg:-right-8">
              <XIcon className="size-5" />
            </Dialog.CloseTrigger>
            <div className="relative block aspect-square w-full rounded-sm bg-neutral-50">
              <div
                hidden={camera.opened}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-300"
              >
                <QrCodeIcon className="size-15" strokeWidth={1.66667} />
              </div>
              <video {...camera.getVideoProps()} />
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                fullWidth
                variant="outline"
                disabled={camera.opened || parsing}
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

                  const id = await parseId(code);

                  if (id === null) {
                    toaster.error({
                      title: 'Invalid QR code',
                      description: 'The uploaded image does not contain a valid QR code.',
                    });

                    if (inputRef.current) inputRef.current.value = '';

                    return;
                  }

                  setFile(file);
                  onChange?.(id);
                  disclosure.setOpen(false);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="hidden"
              />
              <Button
                disabled={parsing}
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

function SearchByPhoto({onChange}: {onChange?: (value: number[] | null) => void}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);

  const [photo, setPhoto] = useState<File | null>(null);
  const [vector, setVector] = useState<string>('');
  const [dragging, setDragging] = useState(false);

  const query = usePeopleByFaceEmbeddingQuery(vector, {
    enabled: !!vector,
  });

  useTimeout(
    () => onChange?.(query.data?.map((person) => person.id) ?? null),
    query.dataUpdatedAt && query.data ? 1 : null,
  );

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toaster.error({
          title: 'Invalid image',
          description: 'Only image files can be used for photo search.',
        });

        return;
      }

      const detection = await detectFace(file, 3);
      const faceFound = !!detection;

      if (!faceFound) {
        toaster.error({
          title: 'No face detected',
          description: 'The uploaded image does not contain a detectable face.',
        });

        return;
      }

      const face = await cropFace(file);
      const embedding = await getFaceEmbedding(file);

      if (embedding) {
        setPhoto(face);
        setVector(embedding.vector);
      } else {
        setPhoto(face);
        setVector('');
        onChange?.([-1]);
      }
    },
    [onChange],
  );

  return (
    <>
      <Field.Root className="rounded-sm bg-neutral-100/75 p-3">
        <Field.Label>Image</Field.Label>

        <button
          type="button"
          onClick={() => {
            inputRef.current?.click();
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            if (query.isLoading) return;
            dragDepthRef.current += 1;
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (query.isLoading) return;
            dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
            if (dragDepthRef.current === 0) {
              setDragging(false);
            }
          }}
          onDrop={async (e) => {
            e.preventDefault();
            if (query.isLoading) return;
            dragDepthRef.current = 0;
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (!file) return;
            await processFile(file);
          }}
          className="relative block aspect-video w-full rounded-sm border ui-dragging:border-dashed bg-white transition-colors"
          data-draging={dragging ? '' : undefined}
          disabled={query.isLoading}
        >
          {photo && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange?.(null);
                setPhoto(null);
                setVector('');
              }}
              className="absolute top-2 right-2 grid size-7 place-items-center self-end rounded-sm border bg-white"
            >
              <XIcon className="size-4.5 text-neutral-700" />
            </span>
          )}

          {photo && (
            <div className="flex size-full flex-col justify-center">
              <Image
                src={URL.createObjectURL(photo)}
                alt=""
                width={400}
                height={400}
                unoptimized
                className="mx-auto max-h-[80%] w-auto max-w-[80%] object-cover"
              />
            </div>
          )}

          {!photo && (
            <ImagePlaceholderIcon className="absolute top-1/2 left-1/2 block size-14 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
          )}
        </button>
      </Field.Root>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          await processFile(file);
          if (inputRef.current) inputRef.current.value = '';
        }}
        className="hidden"
      />
    </>
  );
}
