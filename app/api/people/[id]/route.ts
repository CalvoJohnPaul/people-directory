import {hash} from 'bcrypt';
import {isNil, omitBy} from 'es-toolkit';
import {type NextRequest, NextResponse} from 'next/server';
import {prisma} from '~/config/prisma';
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

  const data = await prisma.person.findUnique({
    where: {id},
    select: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      gender: true,
      dateOfBirth: true,
      emailAddress: true,
      emailAddressVerifiedAt: true,
      mobileNumber: true,
      mobileNumberVerifiedAt: true,
      currentAddress: true,
      permanentAddress: true,
      image: true,
      idDocument: true,
      verifiedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

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

  return NextResponse.json(
    {
      ok: true,
      data,
    },
    {status: 200},
  );
}

export async function PATCH(
  req: NextRequest,
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

  const count = await prisma.person.count({where: {id}});

  if (count === 0) {
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

  const copy = {...result.data};

  if (copy.password) copy.password = await hash(copy.password, 10);

  const data = await prisma.person.update({
    where: {id},
    data: omitBy(copy, (v) => isNil(v) || v === ''),
    select: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      gender: true,
      dateOfBirth: true,
      emailAddress: true,
      emailAddressVerifiedAt: true,
      mobileNumber: true,
      mobileNumberVerifiedAt: true,
      currentAddress: true,
      permanentAddress: true,
      image: true,
      idDocument: true,
      verifiedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      data,
    },
    {status: 200},
  );
}
