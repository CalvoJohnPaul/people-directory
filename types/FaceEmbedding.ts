import * as z from 'zod';

export const AddFaceEmbeddingInputDefinition = z.object({
  person: z.number(),
  vector: z.string(),
});

export type AddFaceEmbeddingInput = z.infer<typeof AddFaceEmbeddingInputDefinition>;
