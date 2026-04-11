import {clamp} from 'es-toolkit';
import {prisma} from '~/config/prisma';
import type {Prisma} from '~/prisma/generated/prisma/client';
import type {PaginatedResponse} from '~/types/common';
import type {CreatePersonInput, PeopleInput, Person, UpdatePersonDataInput} from '~/types/Person';

export async function getPeople(args?: PeopleInput): Promise<PaginatedResponse<Person>> {
  const where: Prisma.PersonWhereInput = {};
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

  return {
    data,
    totalCount,
    pageInfo: {
      hasNextPage,
      endCursor,
    },
  };
}

export function getPerson(id: number): Promise<Person | null> {
  return prisma.person.findUnique({
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
}

export async function createPerson(data: CreatePersonInput): Promise<Person> {}

export async function updatePerson(
  id: number,
  data: Partial<UpdatePersonDataInput>,
): Promise<Person> {}
