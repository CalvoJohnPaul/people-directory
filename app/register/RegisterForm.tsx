'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {capitalize} from 'es-toolkit';
import {Controller, useForm} from 'react-hook-form';
import {DateField} from '~/components/forms/DateField';
import {SelectField} from '~/components/forms/SelectField';
import {Button} from '~/components/ui/Button';
import {Field} from '~/components/ui/Field';
import {CreatePersonInputDefinition, GenderDefinition} from '~/types/Person';

export function RegisterForm() {
  const form = useForm({
    resolver: zodResolver(CreatePersonInputDefinition),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: new Date(),
      gender: 'MALE',
      image: '',
      email: '',
      mobileNumber: '',
    },
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
      <Field.Root className="mt-4" invalid={!!form.formState.errors.email}>
        <Field.Label>Email</Field.Label>
        <Field.Input placeholder="eg. john.doe@example.com" {...form.register('email')} />
        <Field.ErrorText>{form.formState.errors.email?.message}</Field.ErrorText>
      </Field.Root>
      <Field.Root className="mt-4" invalid={!!form.formState.errors.mobileNumber}>
        <Field.Label>Mobile number</Field.Label>
        <Field.Input placeholder="eg. 9190000000" {...form.register('mobileNumber')} />
        <Field.ErrorText>{form.formState.errors.mobileNumber?.message}</Field.ErrorText>
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

      <div className="mt-8">
        <Button type="submit" fullWidth>
          Submit
        </Button>
      </div>
    </form>
  );
}
