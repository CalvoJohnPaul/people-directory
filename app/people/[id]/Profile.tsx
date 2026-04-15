'use client';

import {differenceInYears, format} from 'date-fns';
import {map} from 'es-toolkit/compat';
import {cx} from 'tailwind-variants';
import {Avatar} from '~/components/ui/Avatar';
import {usePersonQuery} from '~/hooks/usePersonQuery';
import {CopyProfileLink} from './CopyProfileLink';
import {EditProfile} from './EditProfile';
import {PersonProvider} from './ProfileContext';
import {ViewQrCode} from './ViewQrCode';

interface ProfileProps {
  id: number;
}

export function Profile({id}: ProfileProps) {
  const query = usePersonQuery(id);

  if (!query.data) return null;

  const age = query.data.dateOfBirth ? differenceInYears(new Date(), query.data.dateOfBirth) : null;
  const details = {
    'Last name': query.data.lastName,
    'First name': query.data.firstName,
    'Middle name': query.data.middleName || null,
    Gender: query.data.gender,
    'Date of birth': query.data.dateOfBirth ? format(query.data.dateOfBirth, 'MMM dd, yyyy') : null,
    Age: age !== null ? `${age} years old` : null,
    Email: query.data.emailAddress,
    'Mobile number': query.data.mobileNumber || null,
    'Date registered': format(query.data.createdAt, "MMM dd, yyyy 'at' h:mm a"),
    'Last updated': format(query.data.updatedAt, "MMM dd, yyyy 'at' h:mm a"),
  };

  return (
    <PersonProvider value={query.data}>
      <section className="gap-3 lg:flex">
        <Avatar.Root className="w-56 shrink-0">
          <Avatar.Image src={query.data.image} />
          <Avatar.Fallback />
        </Avatar.Root>
        <div className="hidden grow lg:block"></div>
        <div className="mt-4 flex gap-3 self-start lg:mt-0">
          <ViewQrCode />
          <CopyProfileLink />
          <EditProfile />
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-3 md:mt-6 lg:mt-8 lg:grid-cols-3">
        {map(details, (value, key) => {
          return (
            <div key={key}>
              <div className="text-neutral-500 text-sm">{key}</div>
              <div className={cx(value == null && 'font-mono text-neutral-600')}>
                {value
                  ? value.includes('*')
                    ? value.split('').map((char, idx) => (
                        <span key={idx} className={cx(char === '*' && 'font-mono opacity-75')}>
                          {char}
                        </span>
                      ))
                    : value
                  : '[NA]'}
              </div>
            </div>
          );
        })}
      </section>
    </PersonProvider>
  );
}
