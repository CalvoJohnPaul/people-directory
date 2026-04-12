import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {HttpVoidResponseDefinition} from '~/types/common';

interface UpdateFaceEmbeddingInput {
  id: number;
  embedding: number[];
}

export function useUpdateFaceEmbedding(
  opts?: Pick<
    UseMutationOptions<void, Error, UpdateFaceEmbeddingInput>,
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
    mutationKey: ['updateFaceEmbedding'],
    mutationFn: async (input) => {
      const res = await fetch(`/api/people/${input.id}/embeddings/face`, {
        body: JSON.stringify(input),
        method: 'PUT',
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
