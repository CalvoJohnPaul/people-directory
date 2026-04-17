import {Portal} from '@ark-ui/react';
import {PasswordField} from '~/components/forms/PasswordField';
import {PasscodeLockIcon} from '~/components/icons/PasscodeLockIcon';
import {Button} from '~/components/ui/Button';
import {Dialog} from '~/components/ui/Dialog';
import {Field} from '~/components/ui/Field';
import {Menu} from '~/components/ui/Menu';

export function ChangePassword() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Menu.Item value="change-password">
          <PasscodeLockIcon />
          Change password
        </Menu.Item>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-sm border">
                <PasscodeLockIcon />
              </div>
              <div>
                <Dialog.Title>Change password</Dialog.Title>
                <Dialog.Description>Fill out the form to change your password</Dialog.Description>
                <Dialog.CloseTrigger />
              </div>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root>
                <Field.Label>Current password</Field.Label>
                <PasswordField placeholder="Enter current password" />
              </Field.Root>
              <Field.Root className="mt-4">
                <Field.Label>New password</Field.Label>
                <PasswordField placeholder="Enter new password" />
              </Field.Root>
              <Field.Root className="mt-4">
                <Field.Label>Confirm new password</Field.Label>
                <PasswordField placeholder="Re-enter new password" />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
