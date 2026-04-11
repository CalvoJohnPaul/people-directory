import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {HttpVoidResponseDefinition} from '~/types/common';

export function useGenerateOtpMutation(
  opts?: Pick<
    UseMutationOptions<void, Error, string>,
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
    mutationKey: ['generateOtp'],
    mutationFn: async (emailAddress) => {
      const res = await fetch('/api/otps', {
        body: JSON.stringify({emailAddress}),
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
