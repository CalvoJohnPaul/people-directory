import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import * as z from 'zod';
import {HttpResponseDefinition} from '~/types/common';
import {type PeopleInput, type Person, PersonDefinition} from '~/types/Person';

const getQueryKey = (args?: PeopleInput): QueryKey => ['people', args].filter(Boolean);
const getQueryFn = (args?: PeopleInput) => async () => {
  const params = new URLSearchParams();

  if (args?.q) {
    params.set('q', args.q);
  }

  if (args?.id?.length) {
    args.id.forEach((id) => {
      params.append('id', id.toString());
    });
  }

  if (args?.gender?.length) {
    args.gender.forEach((gender) => {
      params.append('gender', gender);
    });
  }

  if (args?.emailAddress) {
    params.append('emailAddress', args.emailAddress);
  }

  if (args?.mobileNumber) {
    params.append('mobileNumber', args.mobileNumber);
  }

  if (args?.createdAt__from) {
    params.append('createdAt__from', args.createdAt__from.toISOString());
  }

  if (args?.createdAt__to) {
    params.append('createdAt__to', args.createdAt__to.toISOString());
  }

  if (args?.dateOfBirth__from) {
    params.append('dateOfBirth__from', args.dateOfBirth__from.toISOString());
  }

  if (args?.dateOfBirth__to) {
    params.append('dateOfBirth__to', args.dateOfBirth__to.toISOString());
  }

  if (args?.limit) {
    params.append('limit', args.limit.toString());
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
};

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
    queryFn: getQueryFn(args),
    ...opts,
  });
}

usePeopleQuery.getQueryKey = getQueryKey;
usePeopleQuery.getQueryFn = getQueryFn;
