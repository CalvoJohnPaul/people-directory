'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useId} from 'react';
import {DotIcon} from '~/components/icons/DotIcon';

export function People() {
  return (
    <div className="mt-8 md:mt-12 lg:mt-16">
      <p className="mb-4 text-gray-500 text-sm">Showing 48 matches</p>
      <div className="grid grid-cols-3 gap-x-3 gap-y-5 md:grid-cols-5 lg:grid-cols-7">
        {Array.from({length: 10}).map((_, i) => (
          <Person key={i} />
        ))}
      </div>
    </div>
  );
}

function Person() {
  const id = useId();

  return (
    <Link href="/1" className="block w-full">
      <div className="aspect-square w-full bg-gray-50">
        <Image
          src={`https://i.pravatar.cc/400?u=${id}`}
          width={400}
          height={400}
          draggable={false}
          alt=""
          className="size-full object-cover"
        />
      </div>
      <h2 className="mt-2 line-clamp-1 font-medium text-sm leading-none">John Doe</h2>
      <div className="mt-1 items-center gap-1.5 text-gray-600 text-xs leading-none lg:flex">
        <span className="block">Oct 12, 1992</span>
        <DotIcon className="hidden size-1 text-gray-300 lg:block" />
        <span className="hidden lg:block">Male</span>
      </div>
    </Link>
  );
}
