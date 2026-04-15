import * as z from 'zod';

export const AddFaceEmbeddingInputDefinition = z.object({
  person: z.number(),
  embedding: z.array(z.number()).min(1),
});

export type AddFaceEmbeddingInput = z.infer<typeof AddFaceEmbeddingInputDefinition>;
