import {type QueryKey, type UseInfiniteQueryOptions, useInfiniteQuery} from '@tanstack/react-query';
import {
  HttpResponseDefinition,
  type PaginatedResponse,
  PaginatedResponseDefinition,
} from '~/types/common';
import {type PeopleInput, type Person, PersonDefinition} from '~/types/Person';

const getQueryKey = (args?: PeopleInput): QueryKey => ['people', args].filter(Boolean);

export function usePeopleQuery(
  args?: PeopleInput,
  opts?: Pick<
    UseInfiniteQueryOptions<
      PaginatedResponse<Person>,
      Error,
      PaginatedResponse<Person>,
      QueryKey,
      number | null
    >,
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
  return useInfiniteQuery({
    queryKey: getQueryKey(args),
    queryFn: async ({pageParam}) => {
      const params = new URLSearchParams();

      if (pageParam) {
        params.set('after', pageParam.toString());
      }

      if (args?.first) {
        params.set('first', args.first.toString());
      }

      if (args?.keyword) {
        params.set('keyword', args.keyword);
      }

      if (args?.id) {
        args.id.forEach((id) => {
          params.append('id', id.toString());
        });
      }

      const res = await fetch(`/api/people?${params.toString()}`, {
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      })
        .then((r) => r.json())
        .then((r) =>
          HttpResponseDefinition(PaginatedResponseDefinition(PersonDefinition)).parse(r),
        );

      if (!res.ok) {
        const err = new Error();
        err.name = res.error.name;
        err.message = res.error.message;
        throw err;
      }

      return res.data;
    },
    initialPageParam: args?.after ?? null,
    getNextPageParam: (lastPage) => {
      return lastPage?.pageInfo?.endCursor ?? null;
    },
    ...opts,
  });
}

usePeopleQuery.getQueryKey = getQueryKey;
