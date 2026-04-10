'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {signIn, useSession} from 'next-auth/react';
import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {Button} from '~/components/ui/Button';
import {Field} from '~/components/ui/Field';
import {toaster} from '~/config/toaster';
import {useCooldown} from '~/hooks/useCooldown';

export function LoginForm() {
  const router = useRouter();
  const session = useSession();
  const form = useForm({
    resolver: zodResolver(
      z.object({
        email: z.email('Invalid email').trim().toLowerCase(),
      }),
    ),
    defaultValues: {
      email: '',
    },
  });

  const cooldown = useCooldown();

  useEffect(() => {
    if (session.status === 'authenticated') {
      router.push('/');
    }
  }, [session.status, router]);

  return (
    <form
      onSubmit={form.handleSubmit(async ({email}) => {
        const res = await signIn('email', {
          email,
          redirect: false,
        });

        if (!res?.error) {
          form.reset();
          cooldown.start();
          toaster.success({
            title: 'Email sent',
            description: `A magic link has been sent to ${email}. Please check your inbox.`,
          });

          return;
        }

        toaster.error({
          title: 'Error',
          description: res?.error ?? 'An unexpected error occurred. Please try again.',
        });
      })}
      className="mx-auto max-w-100"
    >
      <Field.Root invalid={!!form.formState.errors.email}>
        <Field.Label>Email</Field.Label>
        <Field.Input type="email" placeholder="Enter your email" {...form.register('email')} />
        <Field.ErrorText>{form.formState.errors.email?.message}</Field.ErrorText>
      </Field.Root>

      <Button
        type="submit"
        fullWidth
        className="mt-8"
        disabled={
          form.formState.isSubmitting || session.status !== 'unauthenticated' || cooldown.cooling
        }
      >
        Get link {cooldown.cooling && <>({cooldown.countdown}s)</>}
      </Button>
    </form>
  );
}
