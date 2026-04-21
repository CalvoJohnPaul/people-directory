import {type NextRequest, NextResponse} from 'next/server';
import {isServiceError} from '~/services/errors';
import {changePassword} from '~/services/Person';
import {getMe} from '~/services/Session';
import type {HttpVoidResponse} from '~/types/common';
import {ChangePasswordInputDefinition} from '~/types/Person';

export async function PATCH(req: NextRequest): Promise<NextResponse<HttpVoidResponse>> {
  const me = await getMe();

  if (!me) {
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

  const body = await req.json();
  const result = ChangePasswordInputDefinition.safeParse(body);

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
    await changePassword(me.id, result.data);
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
