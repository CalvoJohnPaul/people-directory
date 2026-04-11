'use client';

import {Portal} from '@ark-ui/react';
import {SquarePenIcon} from 'lucide-react';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';

export function EditProfile() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <IconButton size="lg" variant="outline">
          <SquarePenIcon />
        </IconButton>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            Edit profile
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
