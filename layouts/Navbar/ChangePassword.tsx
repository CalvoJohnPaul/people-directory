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
import {useMeQuery} from '~/hooks/useMeQuery';
import {UpdatePasswordInputDefinition} from '~/types/Person';

export function ChangePassword() {
  const disclosure = useDisclosure();
  const form = useForm({
    resolver: zodResolver(
      UpdatePasswordInputDefinition.extend({
        confirmNewPassword: z.string(),
      }).superRefine((data, ctx) => {
        if (data.newPassword !== data.confirmNewPassword) {
          ctx.addIssue({
            code: 'custom',
            path: ['confirmNewPassword'],
            message: 'Passwords do not match',
          });
        }
      }),
    ),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const query = useMeQuery();
  const mutation = useChangePasswordMutation({
    onSuccess() {
      disclosure.setOpen(false);
      toaster.dismiss();
      toaster.success({
        title: 'Success',
        description: 'Password has been updated.',
      });
    },
    onError(error) {
      toaster.dismiss();
      toaster.error({
        title: 'Error',
        description: error.message,
      });
    },
  });

  return (
    <Dialog.Root
      open={disclosure.open}
      onOpenChange={(details) => disclosure.setOpen(details.open)}
      onExitComplete={() => {
        form.reset();
      }}
    >
      <Menu.Item value="change-password" onSelect={() => disclosure.setOpen(true)}>
        <PasscodeLockIcon />
        Change password
      </Menu.Item>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content asChild>
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
                        value={ctx.field.value}
                        onChange={ctx.field.onChange}
                        placeholder="Enter current password"
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
                        value={ctx.field.value}
                        onChange={ctx.field.onChange}
                        placeholder="Enter new password"
                      />
                      <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
                    </Field.Root>
                  )}
                />
                <Controller
                  control={form.control}
                  name="confirmNewPassword"
                  render={(ctx) => (
                    <Field.Root className="mt-4" invalid={ctx.fieldState.invalid}>
                      <Field.Label>Confirm new password</Field.Label>
                      <PasswordField
                        value={ctx.field.value}
                        onChange={ctx.field.onChange}
                        placeholder="Re-enter new password"
                      />
                      <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
                    </Field.Root>
                  )}
                />
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="outline"
                  disabled={mutation.isPending || query.isLoading}
                  onClick={() => disclosure.setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending || query.isLoading}>
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
