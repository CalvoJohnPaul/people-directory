import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {HttpVoidResponseDefinition} from '~/types/common';
import type {CreateSessionInput} from '~/types/Session';

export function useCreateSessionMutation(
  opts?: Pick<
    UseMutationOptions<void, Error, CreateSessionInput>,
    | 'gcTime'
    | 'onError'
    | 'onMutate'
    | 'onSettled'
    | 'onSuccess'
    | 'retry'
    | 'retryDelay'
    | 'throwOnError'
  >,
) {
  return useMutation({
    mutationKey: ['createSession'],
    mutationFn: async (input) => {
      const res = await fetch('/api/sessions', {
        body: JSON.stringify(input),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
      })
        .then((r) => r.json())
        .then((r) => HttpVoidResponseDefinition.parse(r));

      if (!res.ok) {
        const err = new Error();
        err.name = res.error.name;
        err.message = res.error.message;
        throw err;
      }
    },
    ...opts,
  });
}
