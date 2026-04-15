import {type NextRequest, NextResponse} from 'next/server';
import {getPeopleByFaceEmbedding} from '~/services/FaceEmbedding';

export async function GET(
  _: NextRequest,
  ctx: RouteContext<'/api/embeddings/face/[vector]/people'>,
) {
  const {vector} = await ctx.params;
  const data = await getPeopleByFaceEmbedding(vector);

  return NextResponse.json({
    ok: true,
    data,
  });
}
