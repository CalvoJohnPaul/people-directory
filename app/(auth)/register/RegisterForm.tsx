'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {capitalize} from 'es-toolkit';
import {useNavigationGuard} from 'next-navigation-guard';
import {Controller, useForm} from 'react-hook-form';
import {DateField} from '~/components/forms/DateField';
import {MobileNumberField} from '~/components/forms/MobileNumberField';
import {SelectField} from '~/components/forms/SelectField';
import {Button} from '~/components/ui/Button';
import {Field} from '~/components/ui/Field';
import {CreatePersonInputDefinition, GenderDefinition} from '~/types/Person';

export function RegisterForm() {
  const form = useForm({
    mode: 'all',
    resolver: zodResolver(CreatePersonInputDefinition),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: new Date(),
      gender: 'MALE',
      image: '',
      emailAddress: '',
      mobileNumber: '',
    },
  });

  useNavigationGuard({
    enabled: form.formState.isDirty,
    confirm: () => window.confirm('You have unsaved changes. Are you sure you want to leave?'),
  });

  return (
    <form className="mx-auto max-w-100" noValidate onSubmit={form.handleSubmit(async () => {})}>
      <Field.Root size="lg" required invalid={!!form.formState.errors.lastName}>
        <Field.Label>
          Last name <Field.RequiredIndicator />
        </Field.Label>
        <Field.Input placeholder="eg. Doe" {...form.register('lastName')} />
        <Field.ErrorText>{form.formState.errors.lastName?.message}</Field.ErrorText>
      </Field.Root>
      <Field.Root size="lg" className="mt-4" required invalid={!!form.formState.errors.firstName}>
        <Field.Label>
          First name <Field.RequiredIndicator />
        </Field.Label>
        <Field.Input placeholder="eg. John" {...form.register('firstName')} />
        <Field.ErrorText>{form.formState.errors.firstName?.message}</Field.ErrorText>
      </Field.Root>
      <Field.Root size="lg" className="mt-4" invalid={!!form.formState.errors.middleName}>
        <Field.Label>Middle name</Field.Label>
        <Field.Input placeholder="eg. Smith" {...form.register('middleName')} />
        <Field.ErrorText>{form.formState.errors.middleName?.message}</Field.ErrorText>
      </Field.Root>
      <Field.Root size="lg" className="mt-4" invalid={!!form.formState.errors.emailAddress}>
        <Field.Label>Email address</Field.Label>
        <Field.Input placeholder="eg. john.doe@example.com" {...form.register('emailAddress')} />
        <Field.ErrorText>{form.formState.errors.emailAddress?.message}</Field.ErrorText>
      </Field.Root>
      <Field.Root size="lg" className="mt-4" invalid={!!form.formState.errors.mobileNumber}>
        <Field.Label>Mobile number</Field.Label>
        <MobileNumberField size="lg" />
        <Field.ErrorText>{form.formState.errors.mobileNumber?.message}</Field.ErrorText>
      </Field.Root>
      <Controller
        control={form.control}
        name="dateOfBirth"
        render={(ctx) => (
          <Field.Root size="lg" className="mt-4" required invalid={ctx.fieldState.invalid}>
            <Field.Label>
              Date of birth <Field.RequiredIndicator />
            </Field.Label>
            <DateField size="lg" value={ctx.field.value} onChange={ctx.field.onChange} />
            <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />
      <Controller
        control={form.control}
        name="gender"
        render={(ctx) => (
          <Field.Root size="lg" className="mt-4" required invalid={ctx.fieldState.invalid}>
            <Field.Label>
              Gender <Field.RequiredIndicator />
            </Field.Label>
            <SelectField
              size="lg"
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
        <Button size="lg" type="submit" fullWidth>
          Submit
        </Button>
      </div>
    </form>
  );
}
