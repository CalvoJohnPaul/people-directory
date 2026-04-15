import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {HttpResponseDefinition} from '~/types/common';
import {type Person, PersonDefinition} from '~/types/Person';

const getQueryKey = (vector: string): QueryKey => ['peopleByFaceEmbedding', vector];

const def = PersonDefinition.pick({
  id: true,
  firstName: true,
  lastName: true,
});

export function usePeopleByFaceEmbeddingQuery(
  vector: string,
  opts?: Pick<
    UseQueryOptions<Pick<Person, 'id' | 'firstName' | 'lastName'>[], Error>,
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
    queryKey: getQueryKey(vector),
    queryFn: async () => {
      const res = await fetch(`/api/embeddings/face/${vector}/people`, {
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      })
        .then((r) => r.json())
        .then((r) => HttpResponseDefinition(def.array()).parse(r));

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

usePeopleByFaceEmbeddingQuery.getQueryKey = getQueryKey;
