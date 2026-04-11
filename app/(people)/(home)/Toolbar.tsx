'use client';

import {Portal} from '@ark-ui/react';
import {ImageIcon, QrCodeIcon, SearchIcon} from 'lucide-react';
import {debounce, parseAsInteger, parseAsNativeArrayOf, parseAsString, useQueryState} from 'nuqs';
import {Dialog} from '~/components/ui/Dialog';
import {Field} from '~/components/ui/Field';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';

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
    parseAsString.withOptions({limitUrlUpdates: debounce(300)}).withDefault(''),
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
  const [, setValue] = useQueryState(
    'id',
    parseAsNativeArrayOf(parseAsInteger)
      .withOptions({limitUrlUpdates: debounce(300)})
      .withDefault([]),
  );

  return (
    <Dialog.Root closeOnEscape closeOnInteractOutside>
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
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content></Dialog.Content>
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
