'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {Button} from '~/components/ui/Button';
import {Field} from '~/components/ui/Field';

const def = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  emailAddress: z.email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
});

export function ContactUs() {
  const form = useForm({
    resolver: zodResolver(def),
    defaultValues: {
      firstName: '',
      lastName: '',
      emailAddress: '',
      message: '',
    },
  });

  return (
    <section id="contact-us" className="bg-neutral-50 py-20">
      <p className="font-semibold text-neutral-700 text-xs uppercase tracking-[0.14em] lg:text-center">
        Contact Us
      </p>
      <h2 className="mt-2 font-bold text-2xl text-neutral-900 sm:text-3xl lg:text-center">
        Send us a message and we will get back to you soon.
      </h2>

      <form
        noValidate
        onSubmit={form.handleSubmit((data) => {
          console.log(data);
        })}
        className="mx-auto mt-12 max-w-2xl rounded-md border border-neutral-200 bg-white p-6 sm:p-8"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Field.Root invalid={!!form.formState.errors.firstName}>
            <Field.Label>First name</Field.Label>
            <Field.Input placeholder="Jane" {...form.register('firstName')} />
            <Field.ErrorText>{form.formState.errors.firstName?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!form.formState.errors.lastName}>
            <Field.Label>Last name</Field.Label>
            <Field.Input placeholder="Doe" {...form.register('lastName')} />
            <Field.ErrorText>{form.formState.errors.lastName?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root className="lg:col-span-2" invalid={!!form.formState.errors.emailAddress}>
            <Field.Label>Email</Field.Label>
            <Field.Input
              type="email"
              placeholder="you@example.com"
              {...form.register('emailAddress')}
            />
            <Field.ErrorText>{form.formState.errors.emailAddress?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root className="lg:col-span-2" invalid={!!form.formState.errors.message}>
            <Field.Label>Message</Field.Label>
            <Field.Textarea
              autoresize
              placeholder="Tell us what you need help with..."
              {...form.register('message')}
            />
            <Field.ErrorText>{form.formState.errors.message?.message}</Field.ErrorText>
          </Field.Root>
        </div>
        <div className="mt-6">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Send message
          </Button>
        </div>
      </form>
    </section>
  );
}
