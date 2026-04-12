import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import * as z from 'zod';
import {HttpResponseDefinition} from '~/types/common';
import {type PeopleInput, type Person, PersonDefinition} from '~/types/Person';

const getQueryKey = (args?: PeopleInput): QueryKey => ['people', args].filter(Boolean);

export function usePeopleQuery(
  args?: PeopleInput,
  opts?: Pick<
    UseQueryOptions<Person[]>,
    | 'enabled'
    | 'gcTime'
    | 'initialData'
    | 'initialDataUpdatedAt'
    | 'placeholderData'
    | 'refetchInterval'
    | 'refetchIntervalInBackground'
    | 'refetchOnMount'
    | 'refetchOnReconnect'
    | 'refetchOnWindowFocus'
    | 'retry'
    | 'retryDelay'
    | 'retryOnMount'
    | 'staleTime'
    | 'throwOnError'
  >,
) {
  return useQuery({
    queryKey: getQueryKey(args),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (args?.keyword) {
        params.set('keyword', args.keyword);
      }

      if (args?.id) {
        args.id.forEach((id) => {
          params.append('id', id.toString());
        });
      }

      if (args?.image?.length) {
        args.image.forEach((id) => {
          params.append('image', id.toString());
        });
      }

      const res = await fetch(`/api/people?${params.toString()}`, {
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      })
        .then((r) => r.json())
        .then((r) => HttpResponseDefinition(z.array(PersonDefinition)).parse(r));

      if (!res.ok) {
        const err = new Error();
        err.name = res.error.name;
        err.message = res.error.message;
        throw err;
      }

      return res.data;
    },
    ...opts,
  });
}

usePeopleQuery.getQueryKey = getQueryKey;
