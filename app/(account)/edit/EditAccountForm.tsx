'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {capitalize, invariant, isNil, omitBy} from 'es-toolkit';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useNavigationGuard} from 'next-navigation-guard';
import {useRef} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {useTimeout} from 'usehooks-ts';
import {DateField} from '~/components/forms/DateField';
import {MobileNumberField} from '~/components/forms/MobileNumberField';
import {PhotoField} from '~/components/forms/PhotoField';
import {SelectField} from '~/components/forms/SelectField';
import {Button} from '~/components/ui/Button';
import {Field} from '~/components/ui/Field';
import {getClient} from '~/config/client';
import {toaster} from '~/config/toaster';
import {useAddFaceEmbeddingMutation} from '~/hooks/useAddFaceEmbeddingMutation';
import {useMeQuery} from '~/hooks/useMeQuery';
import {usePeopleQuery} from '~/hooks/usePeopleQuery';
import {usePersonQuery} from '~/hooks/usePersonQuery';
import {useUpdatePersonMutation} from '~/hooks/useUpdatePersonMutation';
import {GenderDefinition, type Person, UpdatePersonDataInputDefinition} from '~/types/Person';
import {getFaceEmbedding} from '~/utils/face';
import {normalizeMobileNumber} from '~/utils/mobileNumber';

export function EditAccountForm() {
  const router = useRouter();
  const query = useMeQuery();
  const client = getClient();
  const photoRef = useRef<File | null>(null);
  const addFaceEmbeddingMutation = useAddFaceEmbeddingMutation();
  const updatePersonMutation = useUpdatePersonMutation({
    onSuccess(data) {
      toaster.dismiss();
      toaster.success({
        title: 'Success',
        description: 'Your account has been updated.',
      });

      client.setQueryData<Person>(useMeQuery.getQueryKey(), data);
      client.setQueryData<Person>(usePersonQuery.getQueryKey(data.id), data);
      client.setQueriesData<Person[]>(
        {
          queryKey: usePeopleQuery.getQueryKey(),
          exact: false,
          type: 'all',
        },
        (arr) => arr?.map((p) => (p.id === data.id ? data : p)),
      );

      setTimeout(() => {
        if (photoRef.current) {
          getFaceEmbedding(photoRef.current)
            .then((embedding) => {
              if (embedding) {
                addFaceEmbeddingMutation.mutate({
                  person: data.id,
                  vector: embedding.vector,
                });
              }
            })
            .catch(console.error);
        }
      }, 1);

      form.reset();
      router.push(`/people/${data.id}`);
    },
    onError(error) {
      toaster.error({
        title: 'Error',
        description: error.message,
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(UpdatePersonDataInputDefinition),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      image: '',
      gender: null,
      dateOfBirth: null,
      emailAddress: '',
      mobileNumber: '',
      address: '',
    },
  });

  useTimeout(
    () => {
      form.reset({
        lastName: query.data?.lastName ?? '',
        firstName: query.data?.firstName ?? '',
        middleName: query.data?.middleName ?? '',
        dateOfBirth: query.data?.dateOfBirth ? new Date(query.data.dateOfBirth) : undefined,
        gender: query.data?.gender ?? null,
        emailAddress: query.data?.emailAddress ?? '',
        mobileNumber: query.data?.mobileNumber ?? '',
        image: query.data?.image ?? '',
      });
    },
    query.data == null ? null : 0,
  );

  useTimeout(
    () => {
      router.push('/login');
    },
    !query.isLoading && query.data == null ? 0 : null,
  );

  useNavigationGuard({
    enabled: form.formState.isDirty && updatePersonMutation.isIdle,
    confirm: () => window.confirm('You have unsaved changes. Are you sure you want to leave?'),
  });

  return (
    <form
      className="mx-auto max-w-100"
      onSubmit={form.handleSubmit((values) => {
        const id = query.data?.id;
        invariant(id, "'id' is undefined");
        const data = omitBy(values, (v) => isNil(v) || v === '');
        if (data.mobileNumber) data.mobileNumber = normalizeMobileNumber(data.mobileNumber);
        updatePersonMutation.mutate({
          id,
          data,
        });
      })}
      noValidate
    >
      <Field.Root invalid={!!form.formState.errors.lastName}>
        <Field.Label>Last name</Field.Label>
        <Field.Input placeholder="eg. Doe" {...form.register('lastName')} />
        <Field.ErrorText>{form.formState.errors.lastName?.message}</Field.ErrorText>
      </Field.Root>
      <Field.Root className="mt-4" invalid={!!form.formState.errors.firstName}>
        <Field.Label>First name</Field.Label>
        <Field.Input placeholder="eg. John" {...form.register('firstName')} />
        <Field.ErrorText>{form.formState.errors.firstName?.message}</Field.ErrorText>
      </Field.Root>
      <Field.Root className="mt-4" invalid={!!form.formState.errors.middleName}>
        <Field.Label>Middle name</Field.Label>
        <Field.Input placeholder="eg. Smith" {...form.register('middleName')} />
        <Field.ErrorText>{form.formState.errors.middleName?.message}</Field.ErrorText>
      </Field.Root>
      <Controller
        control={form.control}
        name="gender"
        render={(ctx) => (
          <Field.Root className="mt-4" invalid={ctx.fieldState.invalid}>
            <Field.Label>Gender</Field.Label>
            <SelectField
              options={GenderDefinition.options.map((value) => ({
                label: capitalize(value.toLowerCase()),
                value,
              }))}
              value={ctx.field.value || ''}
              onChange={(v) => ctx.field.onChange(v || null)}
            />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />
      <Controller
        control={form.control}
        name="dateOfBirth"
        render={(ctx) => (
          <Field.Root className="mt-4" invalid={ctx.fieldState.invalid}>
            <Field.Label>Date of birth</Field.Label>
            <DateField
              value={ctx.field.value || null}
              onChange={(v) => ctx.field.onChange(v || null)}
            />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />
      <Field.Root className="mt-4" invalid={!!form.formState.errors.address}>
        <Field.Label>Address</Field.Label>
        <Field.Textarea autoresize placeholder="Enter your address" {...form.register('address')} />
        <Field.ErrorText>{form.formState.errors.address?.message}</Field.ErrorText>
      </Field.Root>
      <Controller
        control={form.control}
        name="mobileNumber"
        render={(ctx) => (
          <Field.Root className="mt-4" invalid={ctx.fieldState.invalid}>
            <Field.Label>Mobile number</Field.Label>
            <MobileNumberField value={ctx.field.value} onChange={ctx.field.onChange} />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />
      <Field.Root className="mt-4" invalid={!!form.formState.errors.emailAddress}>
        <Field.Label>Email address</Field.Label>
        <Field.Input placeholder="eg. john.doe@example.com" {...form.register('emailAddress')} />
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
              onChange={(v) => ctx.field.onChange(v || null)}
              onFileChange={(file) => {
                photoRef.current = file;
              }}
            />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />
      <div className="mt-8 flex gap-3">
        <Button type="button" variant="outline" fullWidth asChild>
          <Link href={`/people/${query.data?.id}`}>Cancel</Link>
        </Button>
        <Button
          type="submit"
          fullWidth
          disabled={query.isLoading || updatePersonMutation.isPending || !form.formState.isDirty}
        >
          Save
        </Button>
      </div>
    </form>
  );
}
