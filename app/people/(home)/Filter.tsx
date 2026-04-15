/** biome-ignore-all lint/a11y/noStaticElementInteractions: "" */
/** biome-ignore-all lint/a11y/useSemanticElements: "" */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: "" */
'use client';

import {Portal} from '@ark-ui/react';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {capitalize, uniq} from 'es-toolkit';
import {QrCodeIcon, XIcon} from 'lucide-react';
import Image from 'next/image';
import {parseAsInteger, parseAsNativeArrayOf, useQueryState} from 'nuqs';
import {useRef, useState} from 'react';
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
        <Field.Root className="rounded-md bg-neutral-50 p-3">
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
                label: `${person.firstName} ${person.lastName}`,
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
        <Field.Root className="rounded-md bg-neutral-50 p-3">
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
                label: `${person.firstName} ${person.lastName}`,
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
        <Field.Root className="rounded-md bg-neutral-50 p-3">
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
        <Field.Root className="rounded-md bg-neutral-50 p-3">
          <Field.Label>Age</Field.Label>
          <NumberRangeField
            value={value__internal.age ?? null}
            onChange={(age) => {
              setValue__internal((prev) => ({...prev, age}));
              setValue__debounced((prev) => ({...prev, age}));
            }}
          />
        </Field.Root>
        <Field.Root className="rounded-md bg-neutral-50 p-3">
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
        <SearchByQrCode />
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
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className="h-auto w-96 p-6 lg:min-w-100 lg:max-w-100">
            <Dialog.CloseTrigger className="absolute -top-8 right-0 size-6 bg-white/8 text-white hover:text-white lg:top-0 lg:-right-8">
              <XIcon className="size-5" />
            </Dialog.CloseTrigger>
            <div className="relative block aspect-square w-full bg-neutral-50">
              <div
                hidden={camera.opened}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-300"
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

function SearchByPhoto({onChange}: {onChange?: (ids: number[]) => void}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [vector, setVector] = useState<string>('');

  const query = usePeopleByFaceEmbeddingQuery(vector, {
    enabled: !!vector,
  });

  useTimeout(
    () => onChange?.(query.data?.map((person) => person.id) ?? []),
    query.dataUpdatedAt && query.data ? 1 : null,
  );

  return (
    <>
      <Field.Root className="rounded-md bg-neutral-50 p-3">
        <Field.Label>Image</Field.Label>

        <button
          type="button"
          onClick={() => {
            inputRef.current?.click();
          }}
          className="relative block aspect-video w-full rounded-sm border bg-white"
          disabled={query.isLoading}
        >
          {photo && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange?.([]);
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

          const faceFound = await detectFace(file, 5);

          if (!faceFound) {
            toaster.error({
              title: 'No face detected',
              description: 'The uploaded image does not contain a detectable face.',
            });

            if (inputRef.current) inputRef.current.value = '';
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

          if (inputRef.current) inputRef.current.value = '';
        }}
        className="hidden"
      />
    </>
  );
}
