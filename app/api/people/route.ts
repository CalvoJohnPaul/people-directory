import {clamp} from 'es-toolkit';
import {type NextRequest, NextResponse} from 'next/server';
import {prisma} from '~/config/prisma';
import type {Prisma} from '~/prisma/generated/prisma/client';
import type {HttpResponse, PaginatedResponse} from '~/types/common';
import {CreatePersonInputDefinition, PeopleInputDefinition, type Person} from '~/types/Person';

export async function GET(
  req: NextRequest,
): Promise<NextResponse<HttpResponse<PaginatedResponse<Person>>>> {
  const args = PeopleInputDefinition.parse({
    first: req.nextUrl.searchParams.get('first'),
    after: req.nextUrl.searchParams.get('after'),
    keyword: req.nextUrl.searchParams.get('keyword'),
    image: req.nextUrl.searchParams.get('image'),
    id: req.nextUrl.searchParams.getAll('id'),
  });

  const where: Prisma.PersonWhereInput = {
    ...(args.id?.length && {id: {in: args.id}}),
    ...(args.keyword && {
      OR: [
        {firstName: {contains: args.keyword, mode: 'insensitive'}},
        {lastName: {contains: args.keyword, mode: 'insensitive'}},
        {middleName: {contains: args.keyword, mode: 'insensitive'}},
        {emailAddress: {contains: args.keyword, mode: 'insensitive'}},
        {mobileNumber: {contains: args.keyword, mode: 'insensitive'}},
      ],
    }),
  };

  const take = clamp(args?.first ?? 100, 1, 100);
  const cursor: Prisma.PersonWhereUniqueInput | undefined = args?.after
    ? {id: args.after}
    : undefined;

  const [totalCount, data] = await prisma.$transaction([
    prisma.person.count({
      where,
      cursor,
    }),
    prisma.person.findMany({
      where,
      cursor,
      take,
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
    }),
  ]);

  const hasNextPage = totalCount > take;
  const endCursor = data.at(-1)?.id ?? null;

  return NextResponse.json({
    ok: true,
    data: {
      data,
      totalCount,
      pageInfo: {
        hasNextPage,
        endCursor,
      },
    },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse<HttpResponse<Person>>> {
  const body = await req.json();
  const result = CreatePersonInputDefinition.safeParse(body);

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

  const person = await prisma.person.create({
    data: result.data,
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

  return NextResponse.json(
    {
      ok: true,
      data: person,
    },
    {status: 201},
  );
}
