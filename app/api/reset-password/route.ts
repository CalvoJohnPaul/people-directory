import {type NextRequest, NextResponse} from 'next/server';
import {isServiceError} from '~/services/errors';
import {resetPassword} from '~/services/Person';
import type {HttpVoidResponse} from '~/types/common';
import {ResetPasswordInputDefinition} from '~/types/Person';

export async function POST(req: NextRequest): Promise<NextResponse<HttpVoidResponse>> {
  const body = await req.json();
  const result = ResetPasswordInputDefinition.safeParse(body);

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

  try {
    await resetPassword(result.data);
  } catch (error) {
    if (!isServiceError(error)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            name: 'UnknownError',
            message: 'An unknown error occurred.',
          },
        },
        {status: 500},
      );
    }

    return NextResponse.json({ok: false, error: error.toJSON()}, {status: 400});
  }

  return NextResponse.json({ok: true});
}
