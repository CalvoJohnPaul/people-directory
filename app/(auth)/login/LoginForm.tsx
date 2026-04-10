'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {Controller, useForm} from 'react-hook-form';
import * as z from 'zod';
import {CheckField} from '~/components/forms/CheckField';
import {Button} from '~/components/ui/Button';
import {Field} from '~/components/ui/Field';
import {toaster} from '~/config/toaster';
import {useCooldown} from '~/hooks/useCooldown';

export function LoginForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(
      z.object({
        email: z.email('Invalid email').trim().toLowerCase(),
        staySignedIn: z.boolean(),
      }),
    ),
    defaultValues: {
      email: '',
      staySignedIn: true,
    },
  });

  const cooldown = useCooldown();

  return (
    <form
      onSubmit={form.handleSubmit(async ({email, staySignedIn}) => {
        form.reset();
        cooldown.start();
        toaster.success({
          title: 'Email sent',
          description: `A magic link has been sent to ${email}. Please check your inbox.`,
        });
      })}
      noValidate
      className="mx-auto max-w-100"
    >
      <Field.Root size="lg" invalid={!!form.formState.errors.email}>
        <Field.Label>Email</Field.Label>
        <Field.Input type="email" placeholder="Enter your email" {...form.register('email')} />
        <Field.ErrorText>{form.formState.errors.email?.message}</Field.ErrorText>
      </Field.Root>

      <Controller
        control={form.control}
        name="staySignedIn"
        render={({field}) => (
          <CheckField className="mt-5" value={field.value} onChange={field.onChange}>
            Keep me signed in
          </CheckField>
        )}
      />
      <Button
        type="submit"
        size="lg"
        fullWidth
        className="mt-6"
        disabled={form.formState.isSubmitting || cooldown.cooling}
      >
        Get link {cooldown.cooling && <>({cooldown.countdown}s)</>}
      </Button>
    </form>
  );
}
