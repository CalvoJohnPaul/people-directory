import {type NextRequest, NextResponse} from 'next/server';
import {isServiceError} from '~/services/errors';
import {getPeopleByFaceEmbedding} from '~/services/FaceEmbedding';
import type {HttpResponse} from '~/types/common';
import type {Person} from '~/types/Person';

export async function GET(
  _: NextRequest,
  ctx: RouteContext<'/api/embeddings/face/[vector]/people'>,
): Promise<NextResponse<HttpResponse<Pick<Person, 'id' | 'firstName' | 'lastName'>[]>>> {
  try {
    const {vector} = await ctx.params;
    const data = await getPeopleByFaceEmbedding(vector);

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    if (isServiceError(error)) {
      return NextResponse.json({ok: false, error: error.toJSON()}, {status: 400});
    }

    throw error;
  }
}
