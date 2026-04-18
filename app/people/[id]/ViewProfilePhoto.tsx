'use client';

import {Portal} from '@ark-ui/react';
import {XIcon} from 'lucide-react';
import Image from 'next/image';
import {Avatar} from '~/components/ui/Avatar';
import {Dialog} from '~/components/ui/Dialog';
import {usePersonContext} from './ProfileContext';

export function ViewProfilePhoto() {
  const person = usePersonContext();

  return (
    <Dialog.Root closeOnInteractOutside closeOnEscape>
      <Dialog.Trigger>
        <Avatar.Root className="w-56 shrink-0">
          <Avatar.Image src={person.image} />
          <Avatar.Fallback />
        </Avatar.Root>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner className="flex items-center justify-center">
          <Dialog.Content className="h-auto! min-w-80! max-w-80! p-1 lg:min-w-96! lg:max-w-96!">
            <Dialog.CloseTrigger className="absolute -top-8 right-0 size-6 rounded-sm bg-white/8 text-white hover:text-white lg:top-0 lg:-right-8">
              <XIcon className="size-5" />
            </Dialog.CloseTrigger>

            <div>
              <Image
                src={person.image}
                alt={person.fullName}
                width={500}
                height={500}
                className="h-auto w-full rounded-sm"
                unoptimized
              />
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
