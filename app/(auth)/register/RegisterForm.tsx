'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {useNavigationGuard} from 'next-navigation-guard';
import {Controller, useForm} from 'react-hook-form';
import {useTimeout} from 'usehooks-ts';
import {PhotoField} from '~/components/forms/PhotoField';
import {Button} from '~/components/ui/Button';
import {Field} from '~/components/ui/Field';
import {useCreatePersonMutation} from '~/hooks/useCreatePersonMutation';
import {useMeQuery} from '~/hooks/useMeQuery';
import {CreatePersonInputDefinition} from '~/types/Person';

export function RegisterForm() {
  const mutation = useCreatePersonMutation();
  const query = useMeQuery();
  const router = useRouter();
  const form = useForm({
    mode: 'all',
    resolver: zodResolver(CreatePersonInputDefinition),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      emailAddress: '',
      image: '',
    },
  });

  useTimeout(() => router.push('/'), query.data != null ? 0 : null);

  useNavigationGuard({
    enabled: form.formState.isDirty,
    confirm: () => window.confirm('You have unsaved changes. Are you sure you want to leave?'),
  });

  return (
    <form className="mx-auto max-w-100" noValidate onSubmit={form.handleSubmit(async () => {})}>
      <div className="flex gap-3">
        <Field.Root size="lg" invalid={!!form.formState.errors.firstName}>
          <Field.Label>First name</Field.Label>
          <Field.Input placeholder="Enter first name" {...form.register('firstName')} />
          <Field.ErrorText>{form.formState.errors.firstName?.message}</Field.ErrorText>
        </Field.Root>
        <Field.Root size="lg" invalid={!!form.formState.errors.lastName}>
          <Field.Label>Last name</Field.Label>
          <Field.Input placeholder="Enter last name" {...form.register('lastName')} />
          <Field.ErrorText>{form.formState.errors.lastName?.message}</Field.ErrorText>
        </Field.Root>
      </div>
      <Field.Root size="lg" className="mt-4" invalid={!!form.formState.errors.emailAddress}>
        <Field.Label>Email address</Field.Label>
        <Field.Input placeholder="Enter email address" {...form.register('emailAddress')} />
        <Field.ErrorText>{form.formState.errors.emailAddress?.message}</Field.ErrorText>
      </Field.Root>
      <Controller
        control={form.control}
        name="image"
        render={(ctx) => (
          <Field.Root className="mt-4" invalid={ctx.fieldState.invalid}>
            <Field.Label>Image</Field.Label>
            <PhotoField
              value={ctx.field.value || null}
              onChange={(value) => ctx.field.onChange(value || '')}
            />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />

      <div className="mt-8">
        <Button
          size="lg"
          type="submit"
          fullWidth
          disabled={form.formState.isSubmitting || query.isLoading || query.data != null}
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
