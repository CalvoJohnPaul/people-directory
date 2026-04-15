import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {HttpVoidResponseDefinition} from '~/types/common';
import type {AddFaceEmbeddingInput} from '~/types/FaceEmbedding';

export function useAddFaceEmbeddingMutation(
  opts?: Pick<
    UseMutationOptions<void, Error, AddFaceEmbeddingInput>,
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
    mutationKey: ['addFaceEmbedding'],
    mutationFn: async (input) => {
      const res = await fetch('/api/embeddings/face', {
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
