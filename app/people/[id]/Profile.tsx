'use client';

import {differenceInYears, format} from 'date-fns';
import {map} from 'es-toolkit/compat';
import Image from 'next/image';
import {twJoin} from 'tailwind-merge';
import {usePersonQuery} from '~/hooks/usePersonQuery';
import {CopyProfileLink} from './CopyProfileLink';
import {EditProfile} from './EditProfile';
import {PersonProvider} from './ProfileContext';
import {ViewQrCode} from './ViewQrCode';

export function Profile({id}: {id: number}) {
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
  };

  return (
    <PersonProvider value={query.data}>
      <section className="gap-3 lg:flex">
        <div className="aspect-square w-56 shrink-0 bg-gray-50">
          <Image
            src={query.data.image}
            alt="Avatar"
            width={600}
            height={600}
            priority
            unoptimized
            draggable={false}
            className="size-full object-cover"
          />
        </div>
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
              <div className="text-gray-500 text-sm">{key}</div>
              <div className={twJoin(value == null && 'font-mono text-gray-600')}>
                {value || '[NA]'}
              </div>
            </div>
          );
        })}
      </section>
    </PersonProvider>
  );
}
