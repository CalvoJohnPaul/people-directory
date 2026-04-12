import {hash} from 'bcrypt';
import {addDays} from 'date-fns';
import {uniq} from 'es-toolkit';
import {cookies} from 'next/headers';
import {type NextRequest, NextResponse} from 'next/server';
import {prisma} from '~/config/prisma';
import type {Prisma} from '~/prisma/generated/prisma/client';
import type {HttpResponse} from '~/types/common';
import {CreatePersonInputDefinition, PeopleInputDefinition, type Person} from '~/types/Person';

export async function GET(req: NextRequest): Promise<NextResponse<HttpResponse<Person[]>>> {
  const args = PeopleInputDefinition.parse({
    keyword: req.nextUrl.searchParams.get('keyword'),
    image: req.nextUrl.searchParams.getAll('image'),
    id: req.nextUrl.searchParams.getAll('id'),
  });

  const ids: number[] = [];

  if (args.image?.length) {
    const vectorLiteral = `[${args.image.join(',')}]`;
    const MAX_COSINE_DISTANCE = 0.45;
    const rows = await prisma.$queryRaw<Array<{personId: number}>>`
      SELECT "personId"
      FROM "face_embeddings"
      GROUP BY "personId"
      HAVING MIN(embedding <=> ${vectorLiteral}::vector) <= ${MAX_COSINE_DISTANCE}
      ORDER BY MIN(embedding <=> ${vectorLiteral}::vector) ASC
    `;

    if (rows.length) {
      ids.push(...rows.map((r) => r.personId));
    }
  }

  if (args.id?.length) {
    ids.push(...args.id);
  }

  const where: Prisma.PersonWhereInput = {
    ...(ids.length && {id: {in: uniq(ids)}}),
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

  const data = await prisma.person.findMany({
    take: 100,
    where,
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
    orderBy: {
      id: 'asc',
    },
  });

  return NextResponse.json({
    ok: true,
    data,
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
    data: {
      ...result.data,
      password: await hash(result.data.password, 8),
    },
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

  const Cookies = await cookies();

  Cookies.set('user', person.id.toString(), {
    httpOnly: true,
    expires: addDays(new Date(), 30),
    sameSite: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return NextResponse.json(
    {
      ok: true,
      data: person,
    },
    {status: 201},
  );
}
