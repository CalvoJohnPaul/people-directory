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
import {Tabs} from '~/components/ui/Tabs';
import {getClient} from '~/config/client';
import {toaster} from '~/config/toaster';
import {useCooldown} from '~/hooks/useCooldown';
import {useCreateSessionMutation} from '~/hooks/useCreateSessionMutation';
import {useGenerateOtpMutation} from '~/hooks/useGenerateOtpMutation';
import {useMeQuery} from '~/hooks/useMeQuery';
import {CreateSessionInputDefinition} from '~/types/Session';

export function LoginForm() {
  return (
    <Tabs.Root defaultValue="otp">
      <Tabs.List>
        <Tabs.Trigger value="otp">OTP</Tabs.Trigger>
        <Tabs.Trigger value="password">Password</Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Content value="otp">
        <OtpLoginForm />
      </Tabs.Content>
      <Tabs.Content value="password">
        <PasswordLoginForm />
      </Tabs.Content>
    </Tabs.Root>
  );
}

function OtpLoginForm() {
  const client = getClient();
  const query = useMeQuery();
  const generateOtpMutation = useGenerateOtpMutation();
  const createSessionMutation = useCreateSessionMutation({
    onError() {
      toaster.error({
        title: 'Login failed',
        description: 'Invalid email address or OTP code',
      });
    },
    onSuccess() {
      toaster.dismiss();
      client.invalidateQueries({
        queryKey: useMeQuery.getQueryKey(),
        refetchType: 'all',
        exact: true,
      });
    },
  });

  const router = useRouter();
  const form = useForm({
    mode: 'all',
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
    () => z.email().safeParse(emailAddress).success,
    [emailAddress],
  );

  useTimeout(() => router.push('/peoplee'), query.data != null ? 0 : null);

  return (
    <form
      onSubmit={form.handleSubmit(async (data) => {
        createSessionMutation.mutate(data);
      })}
      noValidate
      className="mx-auto max-w-100"
    >
      <Field.Root size="lg" invalid={!!form.formState.errors.emailAddress}>
        <Field.Label>Email address</Field.Label>
        <div className="flex gap-3">
          <Field.Input
            type="email"
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
              createSessionMutation.isPending ||
              generateOtpMutation.isPending
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

      <Button
        type="submit"
        size="lg"
        fullWidth
        className="mt-8"
        disabled={
          form.formState.isSubmitting ||
          query.isLoading ||
          query.data != null ||
          createSessionMutation.isPending
        }
      >
        Sign in
      </Button>
    </form>
  );
}

function PasswordLoginForm() {
  const client = getClient();
  const query = useMeQuery();
  const mutation = useCreateSessionMutation({
    onError() {
      toaster.error({
        title: 'Login failed',
        description: 'Invalid email address or password',
      });
    },
    onSuccess() {
      toaster.dismiss();
      client.invalidateQueries({
        queryKey: useMeQuery.getQueryKey(),
        refetchType: 'all',
        exact: true,
      });
    },
  });

  const router = useRouter();
  const form = useForm({
    mode: 'all',
    resolver: zodResolver(CreateSessionInputDefinition),
    defaultValues: {
      emailAddress: '',
      password: '',
    },
  });

  useTimeout(() => router.push('/'), query.data != null ? 0 : null);

  return (
    <form
      onSubmit={form.handleSubmit(async (data) => {
        mutation.mutate(data);
      })}
      noValidate
      className="mx-auto max-w-100"
    >
      <Field.Root size="lg" invalid={!!form.formState.errors.emailAddress}>
        <Field.Label>Email address</Field.Label>
        <Field.Input
          type="email"
          placeholder="eg. john.doe@example.com"
          {...form.register('emailAddress')}
          className="grow"
        />
        <Field.ErrorText>{form.formState.errors.emailAddress?.message}</Field.ErrorText>
      </Field.Root>

      <Controller
        control={form.control}
        name="password"
        render={(ctx) => (
          <Field.Root size="lg" invalid={ctx.fieldState.invalid} className="mt-4">
            <Field.Label>Password</Field.Label>
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
        disabled={
          form.formState.isSubmitting || query.isLoading || query.data != null || mutation.isPending
        }
      >
        Sign in
      </Button>
    </form>
  );
}
