import {type NextRequest, NextResponse} from 'next/server';
import {prisma} from '~/config/prisma';
import type {HttpResponse} from '~/types/common';
import type {Person} from '~/types/Person';

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
          name: 'BadRequestError',
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
      mobileNumber: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!data) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          name: 'NotFoundError',
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

export async function POST() {}

export async function PATCH() {}
