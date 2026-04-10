'use client';

import {Portal} from '@ark-ui/react';
import {noop} from 'es-toolkit';
import {SquarePenIcon, XIcon} from 'lucide-react';
import {AvatarField} from '~/components/forms/AvatarField';
import {Button} from '~/components/ui/Button';
import {Dialog} from '~/components/ui/Dialog';
import {Field} from '~/components/ui/Field';
import {Menu} from '~/components/ui/Menu';

export function EditAccount() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Menu.Item value="edit">
          <SquarePenIcon />
          Edit profile
        </Menu.Item>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Edit Account</Dialog.Title>
              <Dialog.Description>
                Fill in the form to edit your account details.
              </Dialog.Description>
              <Dialog.CloseTrigger>
                <XIcon />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root>
                <Field.Label>Avatar</Field.Label>
                <AvatarField />
              </Field.Root>
              <Field.Root className="mt-4">
                <Field.Label>Name</Field.Label>
                <Field.Input placeholder="Enter your name" />
              </Field.Root>
              <Field.Root className="mt-4">
                <Field.Label>Email</Field.Label>
                <Field.Input
                  type="email"
                  value="johndoe@example.com"
                  onChange={noop}
                  readOnly
                  placeholder="Enter your email"
                />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Context>
              {(api) => (
                <Dialog.Footer>
                  <Button variant="outline" className="w-24" onClick={() => api.setOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="w-24">Save</Button>
                </Dialog.Footer>
              )}
            </Dialog.Context>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
