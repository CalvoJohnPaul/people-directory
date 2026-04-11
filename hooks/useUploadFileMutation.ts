import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {HttpResponseDefinition} from '~/types/common';
import {type UploadedFile, UploadedFileDefinition} from '~/types/UploadedFile';

export function useUploadFileMutation(
  opts?: Pick<
    UseMutationOptions<UploadedFile, Error, File>,
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
    mutationKey: ['uploadFile'],
    mutationFn: async (file) => {
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/uploads', {
        body,
        method: 'PUT',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      })
        .then((r) => r.json())
        .then((r) => HttpResponseDefinition(UploadedFileDefinition).parse(r));

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
