'use client';

import {isNil, omitBy} from 'es-toolkit';
import {size} from 'es-toolkit/compat';
import Image from 'next/image';
import Link from 'next/link';
import {parseAsInteger, parseAsNativeArrayOf, parseAsString, useQueryStates} from 'nuqs';
import {usePeopleQuery} from '~/hooks/usePeopleQuery';

export function People() {
  const [state] = useQueryStates({
    keyword: parseAsString,
    image: parseAsNativeArrayOf(parseAsInteger),
    id: parseAsNativeArrayOf(parseAsInteger),
  });

  const query = usePeopleQuery({
    first: 21,
    ...state,
  });

  const totalCount = query.data?.pages.at(0)?.totalCount ?? 0;
  const people = query.data?.pages.at(0)?.data ?? [];
  const searched =
    size(omitBy(state, (v) => isNil(v) || v === '' || (Array.isArray(v) && v.length === 0))) > 0;

  return (
    <section className="mt-8 lg:mt-12">
      <p role="alert" aria-live="polite" className="mb-4 text-gray-500 text-sm">
        {query.isLoading
          ? 'Crunching latest data. Please wait...'
          : searched
            ? totalCount <= 0
              ? 'No matching records'
              : `Showing ${totalCount} matches`
            : 'Showing latest records'}
        .
      </p>

      <div className="grid grid-cols-3 gap-x-3 gap-y-5 md:grid-cols-5 lg:grid-cols-7">
        {query.isLoading && <Loader />}
        {!query.isLoading &&
          people.map((person) => (
            <Link key={person.id} href={`/${person.id}`} className="block w-full">
              <div className="aspect-square w-full bg-gray-50">
                <Image
                  src={person.image}
                  width={400}
                  height={400}
                  draggable={false}
                  alt=""
                  className="size-full object-cover"
                  unoptimized
                />
              </div>
              <h2 className="mt-2 line-clamp-1 font-medium text-sm leading-tight">
                {person.firstName} {person.lastName}
              </h2>
              <div className="line-clamp-1 text-gray-600 text-xs leading-tight">
                {person.emailAddress}
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
}

function Loader() {
  const l = Array.from({length: 21}, (_, i) => i);
  return l.map((i) => <div key={i} className="aspect-square w-full animate-pulse bg-gray-100" />);
}
