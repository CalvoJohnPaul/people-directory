import {prisma} from '~/config/prisma';
import type {AddFaceEmbeddingInput} from '~/types/FaceEmbedding';

const FACE_EMBEDDING_DISTANCE_THRESHOLD = 0.75;

export async function getPeopleByFaceEmbedding(vector: string): Promise<
  {
    id: number;
    firstName: string;
    lastName: string;
  }[]
> {
  return await prisma.$queryRaw<
    {
      id: number;
      first_name: string;
      last_name: string;
      distance: number;
    }[]
  >`
    WITH matching_people AS (
      SELECT
        fe."personId" AS person_id,
        MIN(fe.embedding <-> ${vector}::vector) AS distance
      FROM face_embeddings fe
      GROUP BY fe."personId"
      HAVING MIN(fe.embedding <-> ${vector}::vector) <= ${FACE_EMBEDDING_DISTANCE_THRESHOLD}
    )
    SELECT p.id, p.first_name, p.last_name, mp.distance
    FROM matching_people mp
    JOIN people p ON p.id = mp.person_id
    ORDER BY mp.distance ASC, p.id ASC;
  `.then((result) =>
    result.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
    })),
  );
}

export async function addFaceEmbedding(input: AddFaceEmbeddingInput): Promise<void> {
  const {person, vector} = input;

  await prisma.$executeRaw`
    INSERT INTO face_embeddings ("personId", embedding)
    VALUES (${person}, ${vector}::vector)
  `;
}
