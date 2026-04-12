import {uniq} from 'es-toolkit';
import {type NextRequest, NextResponse} from 'next/server';
import {prisma} from '~/config/prisma';
import type {Prisma} from '~/prisma/generated/prisma/client';
import type {HttpResponse} from '~/types/common';
import {PeopleInputDefinition, type Person} from '~/types/Person';

export async function GET(req: NextRequest): Promise<NextResponse<HttpResponse<Person[]>>> {
  const args = PeopleInputDefinition.parse({
    keyword: req.nextUrl.searchParams.get('keyword'),
    image: req.nextUrl.searchParams.getAll('image'),
    id: req.nextUrl.searchParams.getAll('id'),
  });

  const ids: number[] = [];

  if (args.id?.length) {
    ids.push(...args.id);
  }

  const maxCosineDistance = 0.45;
  const vector = args.image?.length ? args.image.map(Number) : null;

  if (vector) {
    const rows = await prisma.$queryRaw<Array<{personId: number; distance: number}>>`
      SELECT
        f."personId",
        MIN(f.embedding <=> ${vector}::vector) AS distance
      FROM face_embeddings f
      GROUP BY f."personId"
      HAVING MIN(f.embedding <=> ${vector}::vector) <= ${maxCosineDistance}
      ORDER BY distance ASC
      LIMIT 200
    `;

    ids.push(...rows.map((r) => r.personId));
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
