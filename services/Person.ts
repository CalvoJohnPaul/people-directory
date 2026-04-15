import {hash} from 'bcrypt';
import {clamp, isNil, omitBy} from 'es-toolkit';
import {cache} from 'react';
import {prisma} from '~/config/prisma';
import type {Prisma} from '~/prisma/generated/prisma/client';
import type {CreatePersonInput, PeopleInput, Person, UpdatePersonDataInput} from '~/types/Person';

export const getPerson = cache(async (id: number): Promise<Person | null> => {
  return await prisma.person
    .findUnique({
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
    })
    .then((person) =>
      person
        ? {
            ...person,
            fullName: [person.firstName, person.lastName].filter(Boolean).join(' '),
          }
        : null,
    );
});

export const getPeople = cache(async (input?: PeopleInput): Promise<Person[]> => {
  const take = clamp(input?.limit ?? 100, 1, 100);
  const where: Prisma.PersonWhereInput = {
    ...(input?.q && {
      OR: [
        {
          firstName: {
            contains: input.q,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: input.q,
            mode: 'insensitive',
          },
        },
        {
          middleName: {
            contains: input.q,
            mode: 'insensitive',
          },
        },
      ],
    }),
    ...(input?.id?.length && {
      id: {
        in: input.id,
      },
    }),
    ...(input?.gender?.length && {
      gender: {
        in: input.gender,
      },
    }),
    ...(input?.emailAddress?.length && {
      emailAddress: {
        contains: input.emailAddress,
        mode: 'insensitive',
      },
    }),
    ...(input?.mobileNumber?.length && {
      mobileNumber: {
        equals: input.mobileNumber,
        mode: 'insensitive',
      },
    }),
    ...((input?.dateOfBirth__from || input?.dateOfBirth__to) && {
      dateOfBirth: {
        ...(input.dateOfBirth__from && {
          gte: input.dateOfBirth__from,
        }),
        ...(input.dateOfBirth__to && {
          lte: input.dateOfBirth__to,
        }),
      },
    }),
    ...((input?.createdAt__from || input?.createdAt__to) && {
      createdAt: {
        ...(input.createdAt__from && {
          gte: input.createdAt__from,
        }),
        ...(input.createdAt__to && {
          lte: input.createdAt__to,
        }),
      },
    }),
  };

  return await prisma.person
    .findMany({
      take,
      where,
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
    })
    .then((people) =>
      people.map((person) => ({
        ...person,
        fullName: [person.firstName, person.lastName].filter(Boolean).join(' '),
      })),
    );
});

export async function createPerson(input: CreatePersonInput): Promise<Person> {
  const data = {...input};

  data.password = await hash(input.password, 8);

  return await prisma.person
    .create({
      data,
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
    })
    .then((person) => ({
      ...person,
      fullName: [person.firstName, person.lastName].filter(Boolean).join(' '),
    }));
}

export async function updatePerson(
  ...args: [id: number, data: UpdatePersonDataInput]
): Promise<Person> {
  const id = args[0];
  const data = omitBy(args[1], (v) => isNil(v) || v === '');

  if (data.password) data.password = await hash(data.password, 10);

  return await prisma.person
    .update({
      data,
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
    })
    .then((person) => ({
      ...person,
      fullName: [person.firstName, person.lastName].filter(Boolean).join(' '),
    }));
}
