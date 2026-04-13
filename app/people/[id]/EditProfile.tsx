'use client';

import {Portal} from '@ark-ui/react';
import {SquarePenIcon} from 'lucide-react';
import Link from 'next/link';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';
import {useMeQuery} from '~/hooks/useMeQuery';
import {usePersonContext} from './ProfileContext';

export function EditProfile() {
  const query = useMeQuery();
  const person = usePersonContext();

  if (query.data?.id !== person.id) return null;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <IconButton size="lg" variant="outline" asChild>
          <Link href="/edit">
            <SquarePenIcon />
          </Link>
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
