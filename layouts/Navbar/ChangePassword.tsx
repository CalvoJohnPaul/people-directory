import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {Controller, useForm} from 'react-hook-form';
import * as z from 'zod';
import {PasswordField} from '~/components/forms/PasswordField';
import {PasscodeLockIcon} from '~/components/icons/PasscodeLockIcon';
import {Button} from '~/components/ui/Button';
import {Dialog} from '~/components/ui/Dialog';
import {Field} from '~/components/ui/Field';
import {Menu} from '~/components/ui/Menu';
import {toaster} from '~/config/toaster';
import {useChangePasswordMutation} from '~/hooks/useChangePasswordMutation';
import {useDisclosure} from '~/hooks/useDisclosure';
import {ChangePasswordInputDefinition} from '~/types/Person';

export function ChangePassword() {
  const disclosure = useDisclosure();
  const mutation = useChangePasswordMutation({
    onError(error) {
      toaster.error({
        title: 'Error',
        description: error.message,
      });
    },
    onSuccess() {
      disclosure.setOpen(false);
      toaster.success({
        title: 'Success',
        description: 'Password has been changed.',
      });
    },
  });
  const form = useForm({
    resolver: zodResolver(
      ChangePasswordInputDefinition.extend({
        confirmPassword: z.string(),
      }).superRefine((data, ctx) => {
        if (data.newPassword !== data.confirmPassword) {
          ctx.addIssue({
            code: 'custom',
            message: 'Passwords do not match',
            path: ['confirmPassword'],
          });
        }
      }),
    ),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  return (
    <Dialog.Root
      open={disclosure.open}
      onOpenChange={(details) => disclosure.setOpen(details.open)}
      onExitComplete={() => form.reset()}
    >
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
            <form
              noValidate
              onSubmit={form.handleSubmit((data) => {
                mutation.mutate(data);
              })}
            >
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
                <Controller
                  control={form.control}
                  name="oldPassword"
                  render={(ctx) => (
                    <Field.Root invalid={ctx.fieldState.invalid}>
                      <Field.Label>Current password</Field.Label>
                      <PasswordField
                        placeholder="Enter current password"
                        value={ctx.field.value}
                        onChange={ctx.field.onChange}
                      />
                      <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
                    </Field.Root>
                  )}
                />
                <Controller
                  control={form.control}
                  name="newPassword"
                  render={(ctx) => (
                    <Field.Root className="mt-4" invalid={ctx.fieldState.invalid}>
                      <Field.Label>New password</Field.Label>
                      <PasswordField
                        placeholder="Enter new password"
                        value={ctx.field.value}
                        onChange={ctx.field.onChange}
                      />
                      <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
                    </Field.Root>
                  )}
                />
                <Controller
                  control={form.control}
                  name="confirmPassword"
                  render={(ctx) => (
                    <Field.Root className="mt-4" invalid={ctx.fieldState.invalid}>
                      <Field.Label>Confirm new password</Field.Label>
                      <PasswordField
                        placeholder="Re-enter new password"
                        value={ctx.field.value}
                        onChange={ctx.field.onChange}
                      />
                      <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
                    </Field.Root>
                  )}
                />
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => disclosure.setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  Save
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
