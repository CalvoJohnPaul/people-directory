import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {HttpVoidResponseDefinition} from '~/types/common';
import type {UpdatePasswordInput} from '~/types/Person';

export function useChangePasswordMutation(
  opts?: Pick<
    UseMutationOptions<void, Error, UpdatePasswordInput>,
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
    mutationKey: ['changePassword'],
    mutationFn: async (input) => {
      const res = await fetch('/api/me/change-password', {
        body: JSON.stringify(input),
        method: 'PATCH',
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
