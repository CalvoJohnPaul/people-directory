import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {HttpVoidResponseDefinition} from '~/types/common';

export function useDestroySessionMutation(
  opts?: Pick<
    UseMutationOptions<void, Error, void>,
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
    mutationKey: ['destroySession'],
    mutationFn: async () => {
      const res = await fetch('/api/sessions', {
        method: 'DELETE',
        headers: {
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
