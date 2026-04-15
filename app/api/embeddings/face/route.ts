import {type NextRequest, NextResponse} from 'next/server';
import {addFaceEmbedding} from '~/services/FaceEmbedding';
import type {HttpVoidResponse} from '~/types/common';
import {AddFaceEmbeddingInputDefinition} from '~/types/FaceEmbedding';

export async function POST(req: NextRequest): Promise<NextResponse<HttpVoidResponse>> {
  const body = await req.json();
  const result = AddFaceEmbeddingInputDefinition.safeParse(body);

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

  await addFaceEmbedding(result.data);

  return NextResponse.json({ok: true});
}
