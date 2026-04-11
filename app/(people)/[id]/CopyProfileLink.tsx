'use client';

import {Portal} from '@ark-ui/react';
import {CheckIcon, LinkIcon} from 'lucide-react';
import {useParams} from 'next/navigation';
import {twJoin} from 'tailwind-merge';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';
import {useClipboard} from '~/hooks/useClipboard';

export function CopyProfileLink() {
  const params = useParams<{id: string}>();
  const clipboard = useClipboard(`${process.env.NEXT_PUBLIC_URL}/${params.id}`);

  return (
    <Tooltip.Root disabled={clipboard.copied}>
      <Tooltip.Trigger asChild>
        <IconButton
          variant="outline"
          disabled={clipboard.copied}
          onClick={() => clipboard.copy()}
          className={twJoin(clipboard.copied && 'text-green-600')}
        >
          {clipboard.copied ? <CheckIcon /> : <LinkIcon />}
        </IconButton>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            Copy profile link
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
