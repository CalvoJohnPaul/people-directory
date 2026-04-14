import {type NextRequest, NextResponse} from 'next/server';
import {createSession, destroySession} from '~/services/Session';
import type {HttpVoidResponse} from '~/types/common';
import {CreateSessionInputDefinition} from '~/types/Session';

export async function POST(req: NextRequest): Promise<NextResponse<HttpVoidResponse>> {
  const body = await req.json();
  const result = CreateSessionInputDefinition.safeParse(body);

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

  const ok = await createSession(result.data);

  if (!ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          name: 'Unauthorized',
          message: 'Unauthorized',
        },
      },
      {status: 401},
    );
  }

  return NextResponse.json({ok: true}, {status: 201});
}

export async function DELETE(): Promise<NextResponse<HttpVoidResponse>> {
  await destroySession();
  return NextResponse.json({ok: true});
}
