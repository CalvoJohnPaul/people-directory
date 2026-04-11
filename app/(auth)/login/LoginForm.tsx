'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {useMemo} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {CheckField} from '~/components/forms/CheckField';
import {OtpField} from '~/components/forms/OtpField';
import {Button} from '~/components/ui/Button';
import {Field} from '~/components/ui/Field';
import {toaster} from '~/config/toaster';
import {useCooldown} from '~/hooks/useCooldown';
import {CreateSessionInputDefinition} from '~/types/Session';

export function LoginForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(CreateSessionInputDefinition),
    defaultValues: {
      emailAddress: '',
      otpCode: '',
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
    () => CreateSessionInputDefinition.shape.emailAddress.safeParse(emailAddress).success,
    [emailAddress],
  );

  return (
    <form
      onSubmit={form.handleSubmit(async (data) => {
        router.push('/');
      })}
      noValidate
      className="mx-auto max-w-100"
    >
      <Field.Root size="lg" invalid={!!form.formState.errors.emailAddress}>
        <Field.Label>Email</Field.Label>
        <div className="flex gap-3">
          <Field.Input
            type="email"
            placeholder="Enter your email"
            {...form.register('emailAddress')}
            className="grow"
          />
          <Button
            size="lg"
            variant="outline"
            className="shrink-0"
            onClick={async () => {
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
            }}
            disabled={!emailAddressValid || cooldown.cooling}
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
            <Field.Label>OTP Code</Field.Label>
            <OtpField value={ctx.field.value} onChange={ctx.field.onChange} />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />

      <CheckField className="mt-6">Keep me logged in</CheckField>

      <Button
        type="submit"
        size="lg"
        fullWidth
        className="mt-6"
        disabled={form.formState.isSubmitting}
      >
        Log in
      </Button>
    </form>
  );
}
