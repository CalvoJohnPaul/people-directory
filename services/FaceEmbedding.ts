import {prisma} from '~/config/prisma';
import type {AddFaceEmbeddingInput} from '~/types/FaceEmbedding';
import {InvalidFaceEmbeddingVectorError} from './errors';

export async function addFaceEmbedding(input: AddFaceEmbeddingInput): Promise<void> {
  const {person, vector} = input;

  await prisma.$executeRaw`
    INSERT INTO face_embeddings ("personId", embedding)
    VALUES (${person}, ${vector}::vector)
  `;
}

const FACE_EMBEDDING_PERSON_CANDIDATE_LIMIT = 3;
const FACE_EMBEDDING_MAX_BEST_DISTANCE = 0.28;
const FACE_EMBEDDING_MAX_AVERAGE_DISTANCE = 0.33;
const FACE_EMBEDDING_RESULT_LIMIT = 25;

export async function getPeopleByFaceEmbedding(vector: string): Promise<
  {
    id: number;
    firstName: string;
    lastName: string;
  }[]
> {
  const normalizedVector = normalizeFaceEmbeddingVector(vector);

  return await prisma.$queryRaw<
    {
      id: number;
      first_name: string;
      last_name: string;
      best_distance: number;
      average_distance: number;
      similarity: number;
    }[]
  >`
    WITH query_embedding AS (
      SELECT ${normalizedVector}::vector AS embedding
    ),
    ranked_matches AS (
      SELECT
        fe."personId" AS person_id,
        fe.embedding <=> qe.embedding AS cosine_distance,
        ROW_NUMBER() OVER (
          PARTITION BY fe."personId"
          ORDER BY fe.embedding <=> qe.embedding ASC, fe.id ASC
        ) AS rank
      FROM face_embeddings fe
      CROSS JOIN query_embedding qe
    ),
    matching_people AS (
      SELECT
        rm.person_id,
        MIN(rm.cosine_distance) AS best_distance,
        AVG(rm.cosine_distance) AS average_distance,
        GREATEST(
          0,
          1 - ((MIN(rm.cosine_distance) * 0.7) + (AVG(rm.cosine_distance) * 0.3))
        ) AS similarity
      FROM ranked_matches rm
      WHERE rm.rank <= ${FACE_EMBEDDING_PERSON_CANDIDATE_LIMIT}
      GROUP BY rm.person_id
      HAVING
        MIN(rm.cosine_distance) <= ${FACE_EMBEDDING_MAX_BEST_DISTANCE}
        AND AVG(rm.cosine_distance) <= ${FACE_EMBEDDING_MAX_AVERAGE_DISTANCE}
    )
    SELECT p.id, p.first_name, p.last_name, mp.best_distance, mp.average_distance, mp.similarity
    FROM matching_people mp
    JOIN people p ON p.id = mp.person_id
    ORDER BY mp.similarity DESC, mp.best_distance ASC, mp.average_distance ASC, p.id ASC
    LIMIT ${FACE_EMBEDDING_RESULT_LIMIT};
  `.then((result) =>
    result.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
    })),
  );
}

function normalizeFaceEmbeddingVector(vector: string): string {
  const trimmedVector = vector.trim();

  if (!trimmedVector.startsWith('[') || !trimmedVector.endsWith(']')) {
    throw new InvalidFaceEmbeddingVectorError();
  }

  const innerVector = trimmedVector.slice(1, -1).trim();

  if (!innerVector) {
    throw new InvalidFaceEmbeddingVectorError();
  }

  const values = innerVector.split(',').map((value) => {
    const parsedValue = Number(value.trim());

    if (!Number.isFinite(parsedValue)) {
      throw new InvalidFaceEmbeddingVectorError();
    }

    return parsedValue;
  });

  const norm = Math.hypot(...values);

  if (!Number.isFinite(norm) || norm === 0) {
    throw new InvalidFaceEmbeddingVectorError();
  }

  return `[${values.map((value) => value / norm).join(',')}]`;
}
