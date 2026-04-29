'use client';

import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {differenceInYears, format} from 'date-fns';
import {capitalize} from 'es-toolkit';
import {AlertTriangleIcon, AtSignIcon, CheckCircle2Icon, SmartphoneIcon} from 'lucide-react';
import {Controller, useForm} from 'react-hook-form';
import {cx} from 'tailwind-variants';
import * as z from 'zod';
import {MobileNumberField} from '~/components/forms/MobileNumberField';
import {OtpField} from '~/components/forms/OtpField';
import {Button} from '~/components/ui/Button';
import {Dialog} from '~/components/ui/Dialog';
import {Field} from '~/components/ui/Field';
import {useCooldown} from '~/hooks/useCooldown';
import {useDisclosure} from '~/hooks/useDisclosure';
import {useMeQuery} from '~/hooks/useMeQuery';
import {usePersonQuery} from '~/hooks/usePersonQuery';
import {formatMobileNumber} from '~/utils/mobileNumber';
import {CopyProfileLink} from './CopyProfileLink';
import {DeleteAccount} from './DeleteAccount';
import {EditProfile} from './EditProfile';
import {PersonProvider, usePersonContext} from './ProfileContext';
import {ViewProfilePhoto} from './ViewProfilePhoto';
import {ViewQrCode} from './ViewQrCode';

interface ProfileProps {
  id: number;
}

export function Profile({id}: ProfileProps) {
  const personQuery = usePersonQuery(id);
  const person = personQuery.data ?? null;

  if (!person) return null;

  const age = person.dateOfBirth ? differenceInYears(new Date(), person.dateOfBirth) : null;
  const details: {
    label: React.ReactNode;
    value: React.ReactNode;
    hidden?: boolean;
  }[] = [
    {
      label: 'Last name',
      value: person.lastName,
    },
    {
      label: 'First name',
      value: person.firstName,
    },
    {
      label: 'Middle name',
      value: person.middleName || null,
    },
    {
      label: 'Gender',
      value: person.gender ? capitalize(person.gender.toLowerCase()) : null,
    },
    {
      label: 'Date of birth',
      value: person.dateOfBirth ? format(person.dateOfBirth, 'MMM dd, yyyy') : null,
    },
    {
      label: 'Age',
      value: age !== null ? `${age} years old` : null,
    },
    {
      label: 'Address',
      value: !person.address ? null : (
        <span title={person.address} className="block truncate lg:max-w-64">
          {person.address}
        </span>
      ),
    },
    {
      label: 'Email address',
      value: <EmailAddress />,
    },
    {
      label: 'Mobile number',
      value: <MobileNumber />,
    },
    {
      label: 'Date registered',
      value: format(person.createdAt, "MMM dd, yyyy 'at' h:mm a"),
    },
    {
      label: 'Date verified',
      value: person.verifiedAt ? format(person.verifiedAt, "MMM dd, yyyy 'at' h:mm a") : null,
    },
    {
      label: 'Last updated',
      value: format(person.updatedAt, "MMM dd, yyyy 'at' h:mm a"),
    },
    {
      label: 'Date last logged in',
      value: person.lastLoggedInAt
        ? format(person.lastLoggedInAt, "MMM dd, yyyy 'at' h:mm a")
        : null,
    },
  ];

  return (
    <PersonProvider value={person}>
      <section className="relative gap-3 lg:flex">
        <ViewProfilePhoto />
        <div className="hidden grow lg:block"></div>
        <div className="mt-4 flex gap-3 self-start lg:mt-0">
          <DeleteAccount />
          <ViewQrCode />
          <CopyProfileLink />
          <EditProfile />
        </div>
      </section>

      <section className="mt-4 space-y-3 md:mt-6 lg:mt-8 lg:grid lg:grid-cols-3 lg:gap-x-5 lg:gap-y-3 lg:space-y-0">
        {details.map(({label, value, hidden}, key) => {
          if (hidden) return null;

          return (
            <div key={key}>
              <div className="flex items-center gap-1 text-neutral-500 text-sm">{label}</div>
              <div className={cx(value == null && 'font-mono text-neutral-600')}>
                {value ?? '[NA]'}
              </div>
            </div>
          );
        })}
      </section>
    </PersonProvider>
  );
}

function EmailAddress() {
  const person = usePersonContext();
  const query = useMeQuery();
  const me = query.data ?? null;
  const disclosure = useDisclosure();
  const form = useForm({
    mode: 'all',
    resolver: zodResolver(
      z.object({
        emailAddress: z.email(),
        otpCode: z.string().min(6).max(6),
      }),
    ),
    defaultValues: {
      emailAddress: person.emailAddress ?? '',
      otpCode: '',
    },
  });

  const cooldown = useCooldown();

  return (
    <span className="flex items-center gap-1">
      <span>{person.emailAddress}</span>

      {person.emailAddressVerifiedAt == null ? (
        <>
          {me?.id === person.id ? (
            <Dialog.Root
              open={disclosure.open}
              onOpenChange={(details) => {
                disclosure.setOpen(details.open);
              }}
            >
              <Dialog.Trigger title="Unverified. Click to verify email address.">
                <AlertTriangleIcon className="size-4 text-yellow-500" />
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <form noValidate onSubmit={form.handleSubmit(() => {})}>
                      <Dialog.Header className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-sm border">
                          <AtSignIcon />
                        </div>
                        <div>
                          <Dialog.Title>Verify Email Address</Dialog.Title>
                          <Dialog.Description>
                            Complete the process to verify your email address.
                          </Dialog.Description>
                          <Dialog.CloseTrigger />
                        </div>
                      </Dialog.Header>

                      <Dialog.Body>
                        <Field.Root>
                          <Field.Label>Email address</Field.Label>
                          <div className="flex gap-3">
                            <Field.Input
                              type="email"
                              autoComplete="email"
                              placeholder="eg. john.doe@example.com"
                              {...form.register('emailAddress')}
                              className="grow"
                              disabled
                            />
                            <Button variant="outline" className="shrink-0" onClick={async () => {}}>
                              Get OTP
                              {cooldown.cooling && (
                                <span className="tabular-nums">({cooldown.countdown})</span>
                              )}
                            </Button>
                          </div>
                        </Field.Root>
                        <Controller
                          control={form.control}
                          name="otpCode"
                          render={(ctx) => (
                            <Field.Root className="mt-4">
                              <Field.Label>OTP code</Field.Label>
                              <OtpField value={ctx.field.value} onChange={ctx.field.onChange} />
                            </Field.Root>
                          )}
                        />
                      </Dialog.Body>
                      <Dialog.Footer>
                        <Button
                          variant="outline"
                          onClick={() => {
                            disclosure.setOpen(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Verify</Button>
                      </Dialog.Footer>
                    </form>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          ) : (
            <span title="Unverified">
              <AlertTriangleIcon className="size-4 text-yellow-500" />
            </span>
          )}
        </>
      ) : (
        <CheckCircle2Icon className="size-4 text-green-400" />
      )}
    </span>
  );
}

function MobileNumber() {
  const person = usePersonContext();
  const query = useMeQuery();
  const me = query.data ?? null;
  const disclosure = useDisclosure();
  const form = useForm({
    mode: 'all',
    resolver: zodResolver(
      z.object({
        mobileNumber: z.string(),
        otpCode: z.string().min(6).max(6),
      }),
    ),
    defaultValues: {
      mobileNumber: person.mobileNumber ?? '',
      otpCode: '',
    },
  });

  const cooldown = useCooldown();

  return person.mobileNumber ? (
    <span className="flex items-center gap-1">
      <span>
        {!person.mobileNumber.includes('*')
          ? formatMobileNumber(person.mobileNumber)
          : person.mobileNumber.split('').map((char, idx) => (
              <span key={idx} className={cx(char === '*' && 'font-mono opacity-75')}>
                {char}
              </span>
            ))}
      </span>

      {person.mobileNumberVerifiedAt == null ? (
        <>
          {me?.id === person.id ? (
            <Dialog.Root
              open={disclosure.open}
              onOpenChange={(details) => {
                disclosure.setOpen(details.open);
              }}
            >
              <Dialog.Trigger title="Unverified. Click to verify mobile number.">
                <AlertTriangleIcon className="size-4 text-yellow-500" />
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <form noValidate onSubmit={form.handleSubmit(() => {})}>
                      <Dialog.Header className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-sm border">
                          <SmartphoneIcon />
                        </div>
                        <div>
                          <Dialog.Title>Verify Mobile Number</Dialog.Title>
                          <Dialog.Description>
                            Complete the process to verify your mobile number.
                          </Dialog.Description>
                          <Dialog.CloseTrigger />
                        </div>
                      </Dialog.Header>

                      <Dialog.Body>
                        <Field.Root>
                          <Field.Label>Mobile Number</Field.Label>
                          <div className="flex gap-3">
                            <MobileNumberField
                              value={person.mobileNumber ?? ''}
                              className="grow"
                              disabled
                            />
                            <Button variant="outline" className="shrink-0" onClick={async () => {}}>
                              Get OTP
                              {cooldown.cooling && (
                                <span className="tabular-nums">({cooldown.countdown})</span>
                              )}
                            </Button>
                          </div>
                        </Field.Root>
                        <Controller
                          control={form.control}
                          name="otpCode"
                          render={(ctx) => (
                            <Field.Root className="mt-4" invalid={ctx.fieldState.invalid}>
                              <Field.Label>OTP code</Field.Label>
                              <OtpField value={ctx.field.value} onChange={ctx.field.onChange} />
                              <Field.ErrorText>{ctx.fieldState.error?.message}</Field.ErrorText>
                            </Field.Root>
                          )}
                        />
                      </Dialog.Body>
                      <Dialog.Footer>
                        <Button
                          variant="outline"
                          onClick={() => {
                            disclosure.setOpen(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Verify</Button>
                      </Dialog.Footer>
                    </form>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          ) : (
            <span title="Unverified">
              <AlertTriangleIcon className="size-4 text-yellow-500" />
            </span>
          )}
        </>
      ) : (
        <CheckCircle2Icon className="size-4 text-green-400" />
      )}
    </span>
  ) : null;
}
