'use client';

import {QrCodeIcon} from 'lucide-react';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';

export function ViewQrCode() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <IconButton size="lg" variant="outline">
          <QrCodeIcon />
        </IconButton>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          <Tooltip.Arrow>
            <Tooltip.ArrowTip />
          </Tooltip.Arrow>
          View QR code
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
}
