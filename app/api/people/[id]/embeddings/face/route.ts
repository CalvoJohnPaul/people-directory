import {type NextRequest, NextResponse} from 'next/server';
import * as z from 'zod';
import {prisma} from '~/config/prisma';
import type {HttpVoidResponse} from '~/types/common';

const def = z.object({
  embedding: z.array(z.number()),
});

function normalize(vec: number[]): number[] {
  if (vec.length === 0) {
    throw new Error('Embedding array cannot be empty');
  }
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) {
    throw new Error('Cannot normalize zero vector');
  }
  return vec.map((v) => v / norm);
}

export async function PUT(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse<HttpVoidResponse>> {
  const {id: idParam} = await params;
  const id = Number.parseInt(idParam, 10);

  if (Number.isNaN(id) || id < 0) {
    return NextResponse.json(
      {ok: false, error: {name: 'BadRequest', message: 'Bad Request'}},
      {status: 400},
    );
  }

  const body = await req.json();
  const result = def.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          name: 'BadRequest',
          message: result.error.issues[0].message,
        },
      },
      {status: 400},
    );
  }

  const person = await prisma.person.findUnique({
    where: {id},
    select: {id: true},
  });

  if (!person) {
    return NextResponse.json(
      {ok: false, error: {name: 'NotFound', message: 'Person not found'}},
      {status: 404},
    );
  }

  try {
    const normalized = normalize(result.data.embedding);
    const vectorLiteral = `[${normalized.join(',')}]`;

    await prisma.$executeRaw`
      INSERT INTO face_embeddings ("personId", embedding)
      VALUES (${id}, ${vectorLiteral}::vector)
    `;
  } catch (error) {
    console.error('Failed to save face embedding:', error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          name: 'InternalServerError',
          message: error instanceof Error ? error.message : 'Failed to save embedding',
        },
      },
      {status: 500},
    );
  }

  return NextResponse.json({ok: true});
}
