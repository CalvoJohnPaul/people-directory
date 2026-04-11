import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {HttpResponseDefinition} from '~/types/common';
import {type Person, PersonDefinition} from '~/types/Person';

const getQueryKey = (): QueryKey => ['me'];

export function useMeQuery(
  opts?: Pick<
    UseQueryOptions<Person | null, Error>,
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
    queryKey: getQueryKey(),
    queryFn: async () => {
      const res = await fetch('/api/me', {
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      })
        .then((r) => r.json())
        .then((r) => HttpResponseDefinition(PersonDefinition.nullable()).parse(r));

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

useMeQuery.getQueryKey = getQueryKey;
