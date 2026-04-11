import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {HttpResponseDefinition} from '~/types/common';
import {type CreatePersonInput, type Person, PersonDefinition} from '~/types/Person';

export function useCreatePersonMutation(
  opts?: Pick<
    UseMutationOptions<Person, Error, CreatePersonInput>,
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
    mutationKey: ['createPerson'],
    mutationFn: async (input) => {
      const res = await fetch('/api/people', {
        body: JSON.stringify(input),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
      })
        .then((r) => r.json())
        .then((r) => HttpResponseDefinition(PersonDefinition).parse(r));

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
