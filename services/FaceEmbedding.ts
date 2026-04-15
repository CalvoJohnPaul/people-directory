import {prisma} from '~/config/prisma';
import type {AddFaceEmbeddingInput} from '~/types/FaceEmbedding';

export async function getPeopleByFaceEmbedding(embedding: number[]): Promise<
  {
    id: number;
    firstName: string;
    lastName: string;
  }[]
> {
  const vector = `[${embedding.join(',')}]`;
  const result = await prisma.$queryRaw<
    {
      id: number;
      first_name: string;
      last_name: string;
    }[]
  >`
    SELECT p.id, p.first_name, p.last_name
    FROM face_embeddings fe
    JOIN people p ON p.id = fe.person_id
    ORDER BY fe.embedding <-> ${vector}::vector
    LIMIT 10;
  `;

  return result.map((r) => ({
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
  }));
}

export async function addFaceEmbedding(input: AddFaceEmbeddingInput): Promise<void> {
  const {person, embedding} = input;
  const vector = `[${embedding.join(',')}]`;

  await prisma.$executeRaw`
    INSERT INTO face_embeddings (person_id, embedding)
    VALUES (${person}, ${vector}::vector)
  `;
}
