'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {useMemo} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {useTimeout} from 'usehooks-ts';
import z from 'zod';
import {OtpField} from '~/components/forms/OtpField';
import {PasswordField} from '~/components/forms/PasswordField';
import {Button} from '~/components/ui/Button';
import {Field} from '~/components/ui/Field';
import {toaster} from '~/config/toaster';
import {useCooldown} from '~/hooks/useCooldown';
import {useGenerateOtpMutation} from '~/hooks/useGenerateOtpMutation';
import {useMeQuery} from '~/hooks/useMeQuery';
import {useResetPasswordMutation} from '~/hooks/useResetPasswordMutation';
import {ResetPasswordInputDefinition} from '~/types/Person';

export function ForgotPasswordForm() {
  const query = useMeQuery();
  const generateOtpMutation = useGenerateOtpMutation();
  const resetPasswordMutation = useResetPasswordMutation({
    onSuccess() {
      router.push('/login');
      toaster.success({
        title: 'Success',
        description: 'Your password has been updated. Please sign in to continue',
      });
    },
    onError(error) {
      toaster.error({
        title: 'Error',
        description: error.message,
      });
    },
  });
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(
      ResetPasswordInputDefinition.extend({
        confirmPassword: z.string(),
      }).superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
          ctx.addIssue({
            code: 'custom',
            message: 'Passwords do not match',
            path: ['confirmPassword'],
          });
        }
      }),
    ),
    defaultValues: {
      emailAddress: '',
      otpCode: '',
      password: '',
      confirmPassword: '',
    },
  });

  const cooldown = useCooldown({
    min: 0,
    max: 60,
    duration: 60 * 1000,
  });

  const emailAddress = useWatch({
    control: form.control,
    name: 'emailAddress',
    defaultValue: '',
  });

  const emailAddressValid = useMemo(
    () => z.email().safeParse(emailAddress).success,
    [emailAddress],
  );

  useTimeout(() => router.push('/people'), query.data != null ? 0 : null);

  return (
    <form
      onSubmit={form.handleSubmit((data) => {
        resetPasswordMutation.mutate(data);
      })}
      noValidate
      className="mx-auto max-w-100"
    >
      <Field.Root size="lg" invalid={!!form.formState.errors.emailAddress}>
        <Field.Label>Email address</Field.Label>
        <div className="flex gap-3">
          <Field.Input
            type="email"
            autoComplete="email"
            placeholder="eg. john.doe@example.com"
            {...form.register('emailAddress')}
            className="grow"
          />
          <Button
            size="lg"
            variant="outline"
            className="shrink-0"
            onClick={async () => {
              try {
                await generateOtpMutation.mutateAsync(emailAddress);
                cooldown.start();
                toaster.success({
                  title: 'OTP sent!',
                  description: (
                    <>
                      An OTP has been sent to {emailAddress}.<br />
                      Please check your inbox.
                    </>
                  ),
                });
              } catch {
                toaster.error({
                  title: 'Failed to send OTP',
                  description: 'An error occurred while sending the OTP. Please try again.',
                });
              }
            }}
            disabled={
              !emailAddressValid ||
              cooldown.cooling ||
              query.isLoading ||
              query.data != null ||
              generateOtpMutation.isPending ||
              resetPasswordMutation.isPending
            }
          >
            Get OTP
            {cooldown.cooling && <span className="tabular-nums">({cooldown.countdown})</span>}
          </Button>
        </div>
        <Field.ErrorText>{form.formState.errors.emailAddress?.message}</Field.ErrorText>
      </Field.Root>

      <Controller
        control={form.control}
        name="otpCode"
        render={(ctx) => (
          <Field.Root size="lg" invalid={ctx.fieldState.invalid} className="mt-4">
            <Field.Label>OTP code</Field.Label>
            <OtpField value={ctx.field.value} onChange={ctx.field.onChange} />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />

      <Controller
        control={form.control}
        name="password"
        render={(ctx) => (
          <Field.Root size="lg" invalid={ctx.fieldState.invalid} className="mt-4">
            <Field.Label>New password</Field.Label>
            <PasswordField value={ctx.field.value} onChange={ctx.field.onChange} />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />

      <Controller
        control={form.control}
        name="confirmPassword"
        render={(ctx) => (
          <Field.Root size="lg" invalid={ctx.fieldState.invalid} className="mt-4">
            <Field.Label>Confirm new password</Field.Label>
            <PasswordField value={ctx.field.value} onChange={ctx.field.onChange} />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />

      <Button
        type="submit"
        size="lg"
        fullWidth
        className="mt-8"
        disabled={resetPasswordMutation.isPending || query.isLoading || query.data != null}
      >
        Reset password
      </Button>
    </form>
  );
}
