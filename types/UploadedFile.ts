import * as z from 'zod';

export const UploadedFileDefinition = z.object({
  id: z.number(),
  url: z.url(),
  name: z.string(),
  type: z.string(),
  size: z.number(),
});

export type UploadedFile = z.infer<typeof UploadedFileDefinition>;
