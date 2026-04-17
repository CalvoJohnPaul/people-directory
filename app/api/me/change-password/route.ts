import {NextResponse} from 'next/server';
import {updateAccountPassword} from '~/services/Person';
import {getMe} from '~/services/Session';
import type {HttpVoidResponse} from '~/types/common';
import {UpdatePasswordInputDefinition} from '~/types/Person';

export async function PATCH(req: Request): Promise<NextResponse<HttpVoidResponse>> {
  const body = await req.json();
  const result = UpdatePasswordInputDefinition.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          name: 'BadRequest',
          message: 'Invalid input',
          details: result.error.issues[0].message,
        },
      },
      {status: 400},
    );
  }

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

  try {
    await updateAccountPassword(me.id, result.data);
    return NextResponse.json({ok: true});
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          name: 'BadRequest',
          message: error instanceof Error ? error.message : 'Failed to update password',
        },
      },
      {status: 400},
    );
  }
}
