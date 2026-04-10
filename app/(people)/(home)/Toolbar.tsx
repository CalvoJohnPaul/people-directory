'use client';

import {ImageIcon, QrCodeIcon, SearchIcon} from 'lucide-react';
import {Field} from '~/components/ui/Field';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';

export function Toolbar() {
  return (
    <div className="flex gap-3">
      <Field.Root className="relative grow" size="lg">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-gray-500" />
        <Field.Input placeholder="Search" className="pl-10" />
      </Field.Root>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <IconButton variant="outline" size="lg" className="shrink-0">
            <QrCodeIcon />
          </IconButton>
        </Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            Search by QR code
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <IconButton variant="outline" size="lg" className="shrink-0">
            <ImageIcon />
          </IconButton>
        </Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            Search by photo
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
    </div>
  );
}
