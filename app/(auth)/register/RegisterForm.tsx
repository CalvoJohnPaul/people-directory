'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {useNavigationGuard} from 'next-navigation-guard';
import {useRef} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {useTimeout} from 'usehooks-ts';
import {PasswordField} from '~/components/forms/PasswordField';
import {PhotoField} from '~/components/forms/PhotoField';
import {Button} from '~/components/ui/Button';
import {Field} from '~/components/ui/Field';
import {getClient} from '~/config/client';
import {toaster} from '~/config/toaster';
import {useAddFaceEmbeddingMutation} from '~/hooks/useAddFaceEmbeddingMutation';
import {useCreatePersonMutation} from '~/hooks/useCreatePersonMutation';
import {useMeQuery} from '~/hooks/useMeQuery';
import {CreatePersonInputDefinition} from '~/types/Person';
import {getFaceEmbedding} from '~/utils/face';

export function RegisterForm() {
  const client = getClient();
  const query = useMeQuery();
  const photoRef = useRef<File | null>(null);
  const addFaceEmbeddingMutation = useAddFaceEmbeddingMutation();
  const createPersonMutation = useCreatePersonMutation({
    onError(error) {
      toaster.error({
        title: 'Error',
        description: error.message,
      });
    },
    onSuccess(person) {
      client.clear();

      setTimeout(() => {
        client.invalidateQueries({queryKey: useMeQuery.getQueryKey()});

        if (photoRef.current) {
          getFaceEmbedding(photoRef.current)
            .then((embedding) => {
              if (embedding) {
                addFaceEmbeddingMutation.mutate({
                  person: person.id,
                  vector: embedding.vector,
                });
              }
            })
            .catch(console.error);
        }
      }, 1);
    },
  });

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
      password: '',
    },
  });

  useTimeout(() => router.push('/people'), query.data != null ? 0 : null);

  useNavigationGuard({
    enabled: form.formState.isDirty && !createPersonMutation.isSuccess,
    confirm: () => window.confirm('You have unsaved changes. Are you sure you want to leave?'),
  });

  return (
    <form
      className="mx-auto max-w-100"
      noValidate
      onSubmit={form.handleSubmit((data) => {
        createPersonMutation.mutate(data);
      })}
    >
      <Field.Root size="lg" invalid={!!form.formState.errors.firstName}>
        <Field.Label>First name</Field.Label>
        <Field.Input placeholder="Enter first name" {...form.register('firstName')} />
        <Field.ErrorText>{form.formState.errors.firstName?.message}</Field.ErrorText>
      </Field.Root>
      <Field.Root size="lg" className="mt-4" invalid={!!form.formState.errors.lastName}>
        <Field.Label>Last name</Field.Label>
        <Field.Input placeholder="Enter last name" {...form.register('lastName')} />
        <Field.ErrorText>{form.formState.errors.lastName?.message}</Field.ErrorText>
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
              onFileChange={(file) => {
                photoRef.current = file;
              }}
            />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />

      <Field.Root size="lg" className="mt-4" invalid={!!form.formState.errors.emailAddress}>
        <Field.Label>Email address</Field.Label>
        <Field.Input
          type="email"
          autoComplete="email"
          placeholder="Enter email address"
          {...form.register('emailAddress')}
        />
        <Field.ErrorText>{form.formState.errors.emailAddress?.message}</Field.ErrorText>
      </Field.Root>

      <Controller
        control={form.control}
        name="password"
        render={(ctx) => (
          <Field.Root className="mt-4" invalid={ctx.fieldState.invalid}>
            <Field.Label>Password</Field.Label>
            <PasswordField value={ctx.field.value} onChange={ctx.field.onChange} />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />

      <div className="mt-8">
        <Button
          size="lg"
          type="submit"
          fullWidth
          disabled={query.isLoading || query.data != null || createPersonMutation.isPending}
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
