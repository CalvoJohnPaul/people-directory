'use client';

import Image from 'next/image';
import Link from 'next/link';
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
      <div className="aspect-square w-full bg-neutral-50 transition-all">
        <Image
          src={person.image}
          width={400}
          height={400}
          draggable={false}
          alt=""
          className="size-full rounded-sm object-cover"
          unoptimized
        />
      </div>
      <h2 className="mt-2 line-clamp-1 font-medium text-sm leading-tight">
        {person.firstName} {person.lastName}
      </h2>
      <div className="line-clamp-1 text-neutral-600 text-xs leading-tight">
        {person.emailAddress}
      </div>
    </Link>
  );
}
