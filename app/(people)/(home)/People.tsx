'use client';

import Image from 'next/image';
import Link from 'next/link';

export function People() {
  return (
    <div className="mt-8 md:mt-12 lg:mt-16">
      <p className="mb-4 text-gray-500 text-sm">Showing 48 matches</p>
      <div className="grid grid-cols-3 gap-x-3 gap-y-5 md:grid-cols-5 lg:grid-cols-7">
        {Array.from({length: 10}).map((_, i) => (
          <Person key={i} id={i} />
        ))}
      </div>
    </div>
  );
}

function Person({id}: {id: number}) {
  return (
    <Link href={`/${id}`} className="block w-full">
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
      <h2 className="mt-2 line-clamp-1 font-medium text-sm leading-tight">John Doe</h2>
      <div className="line-clamp-1 text-gray-600 text-xs leading-tight">johndoe@gmail.com</div>
    </Link>
  );
}
