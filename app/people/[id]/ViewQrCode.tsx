'use client';

import {Portal} from '@ark-ui/react';
import {QrCodeIcon, XIcon} from 'lucide-react';
import {Button} from '~/components/ui/Button';
import {Dialog} from '~/components/ui/Dialog';
import {IconButton} from '~/components/ui/IconButton';
import {QrCode} from '~/components/ui/QrCode';
import {Tooltip} from '~/components/ui/Tooltip';
import {usePersonContext} from './ProfileContext';

export function ViewQrCode() {
  const person = usePersonContext();
  const value = `${process.env.NEXT_PUBLIC_URL}/${person.id}`;

  return (
    <Dialog.Root closeOnInteractOutside closeOnEscape>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Dialog.Trigger asChild>
            <IconButton variant="outline">
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
              View QR code
            </Tooltip.Content>
          </Tooltip.Positioner>
        </Portal>
      </Tooltip.Root>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner className="flex items-center justify-center">
          <Dialog.Content className="h-auto! min-w-80! max-w-80! p-4">
            <Dialog.CloseTrigger className="absolute -top-8 right-0 size-6 rounded-sm bg-white/8 text-white hover:text-white lg:top-0 lg:-right-8">
              <XIcon className="size-5" />
            </Dialog.CloseTrigger>
            <QrCode.Root value={value}>
              <QrCode.Frame>
                <QrCode.Pattern />
              </QrCode.Frame>
              <Dialog.Context>
                {(api) => (
                  <QrCode.DownloadTrigger
                    fileName="qr-code.jpeg"
                    mimeType="image/jpeg"
                    asChild
                    className="mt-3"
                  >
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        api.setOpen(false);
                      }}
                    >
                      Download
                    </Button>
                  </QrCode.DownloadTrigger>
                )}
              </Dialog.Context>
            </QrCode.Root>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
