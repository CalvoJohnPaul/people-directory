'use client';

import {differenceInYears, format} from 'date-fns';
import {capitalize} from 'es-toolkit';
import {AlertTriangleIcon, CheckCircle2Icon} from 'lucide-react';
import {cx} from 'tailwind-variants';
import {useMeQuery} from '~/hooks/useMeQuery';
import {usePersonQuery} from '~/hooks/usePersonQuery';
import {useFutureFlag} from '~/providers/FutureFlagProvider';
import {formatMobileNumber} from '~/utils/mobileNumber';
import {CopyProfileLink} from './CopyProfileLink';
import {DeleteAccount} from './DeleteAccount';
import {EditProfile} from './EditProfile';
import {PersonProvider} from './ProfileContext';
import {ViewProfilePhoto} from './ViewProfilePhoto';
import {ViewQrCode} from './ViewQrCode';

interface ProfileProps {
  id: number;
}

export function Profile({id}: ProfileProps) {
  const [future] = useFutureFlag();
  const meQuery = useMeQuery();
  const me = meQuery.data ?? null;
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
      value: (
        <span className="flex items-center gap-1">
          <span>{person.emailAddress}</span>

          {!future ? null : person.emailAddressVerifiedAt == null ? (
            <>
              {me?.id === person.id && (
                <button type="button">
                  <AlertTriangleIcon className="size-4 text-yellow-500" />
                </button>
              )}
            </>
          ) : (
            <CheckCircle2Icon className="size-4 text-green-400" />
          )}
        </span>
      ),
    },
    {
      label: 'Mobile number',
      value: person.mobileNumber ? (
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

          {!future ? null : person.mobileNumberVerifiedAt == null ? (
            <>
              {me?.id === person.id && (
                <button type="button">
                  <AlertTriangleIcon className="size-4 text-yellow-500" />
                </button>
              )}
            </>
          ) : (
            <CheckCircle2Icon className="size-4 text-green-400" />
          )}
        </span>
      ) : null,
    },
    {
      label: 'Date registered',
      value: format(person.createdAt, "MMM dd, yyyy 'at' h:mm a"),
    },
    {
      label: 'Last updated',
      value: format(person.updatedAt, "MMM dd, yyyy 'at' h:mm a"),
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
