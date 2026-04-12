'use client';

import {Portal} from '@ark-ui/react';
import {SquarePenIcon} from 'lucide-react';
import {Dialog} from '~/components/ui/Dialog';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';
import {useMeQuery} from '~/hooks/useMeQuery';
import {usePersonContext} from './ProfileContext';

export function EditProfile() {
  const query = useMeQuery();
  const person = usePersonContext();

  if (query.data?.id !== person.id) return null;

  return (
    <Dialog.Root>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Dialog.Trigger asChild>
            <IconButton size="lg" variant="outline">
              <SquarePenIcon />
            </IconButton>
          </Dialog.Trigger>
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
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content></Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
