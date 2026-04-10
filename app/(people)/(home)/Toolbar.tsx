'use client';

import {ImageIcon, PlusIcon, QrCodeIcon, SearchIcon} from 'lucide-react';
import Link from 'next/link';
import {useSession} from 'next-auth/react';
import {Button} from '~/components/ui/Button';
import {Field} from '~/components/ui/Field';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';

export function Toolbar() {
  const session = useSession();

  return (
    <div className="flex gap-2 lg:gap-5">
      <div className="flex grow gap-2 lg:shrink-0">
        <Field.Root className="relative grow lg:w-80 lg:grow-0" size="lg">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-gray-500" />
          <Field.Input placeholder="eg. john doe" className="pl-10" />
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
      <div className="hidden grow lg:block"></div>
      {session.status === 'authenticated' && (
        <Button asChild size="lg" className="shrink-0">
          <Link href="/new">
            <PlusIcon className="size-5" />
            New
          </Link>
        </Button>
      )}
    </div>
  );
}
