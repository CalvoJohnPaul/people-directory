'use client';

import Image from 'next/image';
import Link from 'next/link';
import {debounce, parseAsInteger, parseAsNativeArrayOf, parseAsString, useQueryStates} from 'nuqs';
import {useMediaQuery} from 'usehooks-ts';
import {usePeopleQuery} from '~/hooks/usePeopleQuery';

export function People() {
  const [state, setState] = useQueryStates(
    {
      keyword: parseAsString,
      image: parseAsString,
      id: parseAsNativeArrayOf(parseAsInteger),
    },
    {
      limitUrlUpdates: debounce(300),
    },
  );

  const desktop = useMediaQuery('(min-width: 1024px)');
  const query = usePeopleQuery({
    first: desktop ? 28 : 18,
    ...state,
  });

  return (
    <section className="mt-8 lg:mt-12">
      <p role="alert" aria-live="polite" className="mb-4 text-gray-500 text-sm">
        Showing 48 matches
      </p>

      <div className="grid grid-cols-3 gap-x-3 gap-y-5 md:grid-cols-5 lg:grid-cols-7">
        {Array.from({length: 10}).map((_, i) => (
          <Link key={i} href={`/${i}`} className="block w-full">
            <div className="aspect-square w-full bg-gray-50">
              <Image
                src={`https://i.pravatar.cc/400?u=${i}`}
                width={400}
                height={400}
                draggable={false}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <h2 className="mt-2 line-clamp-1 font-medium text-sm leading-tight">John Doe</h2>
            <div className="line-clamp-1 text-gray-600 text-xs leading-tight">
              johndoe@gmail.com
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
