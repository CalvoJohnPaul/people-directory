'use client';

import {Portal, Swap} from '@ark-ui/react';
import {uniq} from 'es-toolkit';
import {ImageIcon, QrCodeIcon, SearchIcon, XIcon} from 'lucide-react';
import {debounce, parseAsInteger, parseAsNativeArrayOf, parseAsString, useQueryState} from 'nuqs';
import {useRef, useState} from 'react';
import {useInterval} from 'usehooks-ts';
import {Button} from '~/components/ui/Button';
import {Dialog} from '~/components/ui/Dialog';
import {Field} from '~/components/ui/Field';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';
import {useCamera} from '~/hooks/useCamera';
import {useDisclosure} from '~/hooks/useDisclosure';
import {parseQrCode} from '~/utils/qrCode';

export function Toolbar() {
  return (
    <section className="flex gap-3">
      <SearchByName />
      <SearchByQrCode />
      <SearchByPhoto />
    </section>
  );
}

function SearchByName() {
  const [value, setValue] = useQueryState(
    'keyword',
    parseAsString.withOptions({limitUrlUpdates: debounce(350)}).withDefault(''),
  );

  return (
    <Field.Root className="relative grow" size="lg">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-gray-500" />
      <Field.Input
        placeholder="Search"
        className="pl-10"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Field.Root>
  );
}

function SearchByQrCode() {
  const [, setQueryState] = useQueryState(
    'id',
    parseAsNativeArrayOf(parseAsInteger)
      .withOptions({limitUrlUpdates: debounce(300)})
      .withDefault([]),
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
                    if (inputRef.current) inputRef.current.value = '';
                    return;
                  }

                  const id = parseId(code);

                  if (id === null) {
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
  const [, setValue] = useQueryState(
    'image',
    parseAsString.withOptions({
      limitUrlUpdates: debounce(300),
    }),
  );

  return (
    <Dialog.Root closeOnEscape closeOnInteractOutside>
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
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content></Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
