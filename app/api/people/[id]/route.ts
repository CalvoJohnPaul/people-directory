import {type NextRequest, NextResponse} from 'next/server';
import {getPerson, updatePerson} from '~/services/Person_';
import {getMe} from '~/services/Session';
import type {HttpResponse} from '~/types/common';
import {type Person, UpdatePersonDataInputDefinition} from '~/types/Person';

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/people/[id]'>,
): Promise<NextResponse<HttpResponse<Person | null>>> {
  const params = await ctx.params;
  const id = Number.parseInt(params.id, 10);

  if (Number.isNaN(id) || id < 0) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          name: 'BadRequest',
          message: 'Bad Request',
        },
      },
      {status: 400},
    );
  }

  const data = await getPerson(id);

  if (!data) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          name: 'NotFound',
          message: 'Not Found',
        },
      },
      {status: 404},
    );
  }

  return NextResponse.json({ok: true, data}, {status: 200});
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<'/api/people/[id]'>,
): Promise<NextResponse<HttpResponse<Person | null>>> {
  const params = await ctx.params;
  const me = await getMe();

  if (me === null || me.id.toString() !== params.id) {
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
  const result = UpdatePersonDataInputDefinition.safeParse(body);

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

  const data = await updatePerson(me.id, result.data);

  return NextResponse.json({ok: true, data}, {status: 200});
}
