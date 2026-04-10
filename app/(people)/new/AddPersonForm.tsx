'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {capitalize} from 'es-toolkit';
import Link from 'next/link';
import {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {DateField} from '~/components/forms/DateField';
import {SelectField} from '~/components/forms/SelectField';
import {Button} from '~/components/ui/Button';
import {Field} from '~/components/ui/Field';
import {toaster} from '~/config/toaster';
import {CreatePersonInputDefinition, GenderDefinition} from '~/types/Person';

export function AddPersonForm() {
  const form = useForm({
    resolver: zodResolver(CreatePersonInputDefinition),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: new Date(),
      gender: 'MALE',
      image: '',
    },
  });

  useEffect(() => {
    toaster.success({
      title: 'Success',
      description: 'Person created successfully',
    });
  });

  return (
    <form className="mx-auto max-w-100" noValidate onSubmit={form.handleSubmit(async () => {})}>
      <Field.Root required invalid={!!form.formState.errors.lastName}>
        <Field.Label>
          Last name <Field.RequiredIndicator />
        </Field.Label>
        <Field.Input placeholder="eg. Doe" {...form.register('lastName')} />
        <Field.ErrorText>{form.formState.errors.lastName?.message}</Field.ErrorText>
      </Field.Root>
      <Field.Root className="mt-4" required invalid={!!form.formState.errors.firstName}>
        <Field.Label>
          First name <Field.RequiredIndicator />
        </Field.Label>
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
        name="dateOfBirth"
        render={(ctx) => (
          <Field.Root className="mt-4" required invalid={ctx.fieldState.invalid}>
            <Field.Label>
              Date of birth <Field.RequiredIndicator />
            </Field.Label>
            <DateField value={ctx.field.value} onChange={ctx.field.onChange} />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />
      <Controller
        control={form.control}
        name="gender"
        render={(ctx) => (
          <Field.Root className="mt-4" required invalid={ctx.fieldState.invalid}>
            <Field.Label>
              Gender <Field.RequiredIndicator />
            </Field.Label>
            <SelectField
              options={GenderDefinition.options.map((option) => ({
                value: option,
                label: capitalize(option.toLowerCase()),
              }))}
              value={ctx.field.value}
              onChange={ctx.field.onChange}
            />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />

      <div className="mt-8 flex gap-3">
        <Button variant="outline" fullWidth asChild>
          <Link href="/">Cancel</Link>
        </Button>
        <Button type="submit" fullWidth>
          Submit
        </Button>
      </div>
    </form>
  );
}
