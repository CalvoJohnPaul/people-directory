import {NextResponse} from 'next/server';
import type {HttpVoidResponse} from '~/types/common';

export async function GET(): Promise<NextResponse<HttpVoidResponse>> {
  return NextResponse.json({
    ok: true,
  });
}
