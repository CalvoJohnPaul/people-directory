import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {HttpResponseDefinition} from '~/types/common';
import {type Person, PersonDefinition, type UpdatePersonInput} from '~/types/Person';

export function useUpdatePersonMutation(
  opts?: Pick<
    UseMutationOptions<Person, Error, UpdatePersonInput>,
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
    mutationKey: ['updatePerson'],
    mutationFn: async (input) => {
      const res = await fetch(`/api/people/${input.id}`, {
        body: JSON.stringify(input.data),
        method: 'PATCH',
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
