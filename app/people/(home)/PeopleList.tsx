'use client';

import Link from 'next/link';
import {cx} from 'tailwind-variants';
import {Avatar} from '~/components/ui/Avatar';
import {PersonProvider, usePeopleContext, usePersonContext} from './PeopleContext';

export function PeopleList() {
  const people = usePeopleContext();

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-3 gap-y-5">
      {people.map((person) => (
        <PersonProvider key={person.id} value={person}>
          <Person />
        </PersonProvider>
      ))}
    </div>
  );
}

function Person() {
  const person = usePersonContext();

  return (
    <Link href={`/people/${person.id}`} className="block w-full">
      <Avatar.Root className="w-full">
        <Avatar.Image src={person.image} />
        <Avatar.Fallback />
      </Avatar.Root>
      <h2 className="mt-2 line-clamp-1 font-medium text-sm leading-tight">
        {person.firstName} {person.lastName}
      </h2>
      <div className="line-clamp-1 text-neutral-600 text-xs leading-tight">
        {person.emailAddress.split('').map((char, idx) => (
          <span key={idx} className={cx(char === '*' && 'font-mono opacity-75')}>
            {char}
          </span>
        ))}
      </div>
    </Link>
  );
}
