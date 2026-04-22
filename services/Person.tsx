import {render} from '@react-email/components';
import {compare, hash} from 'bcrypt';
import {clamp, isNil, omitBy} from 'es-toolkit';
import {cache} from 'react';
import {prisma} from '~/config/prisma';
import Welcome from '~/emails/Welcome';
import type {Prisma} from '~/prisma/generated/prisma/client';
import type {
  ChangePasswordInput,
  CreatePersonInput,
  PeopleInput,
  Person,
  ResetPasswordInput,
  UpdatePersonDataInput,
} from '~/types/Person';
import {mailto} from '~/utils/mailto';
import {
  AccountNotFoundError,
  EmailAddressNotAvailableError,
  IncorrectPasswordError,
  InvalidOtpError,
  MobileNumberNotAvailableError,
  OtpAlreadyExpiredError,
} from './errors';

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
        address: true,
        image: true,
        verifiedAt: true,
        lastLoggedInAt: true,
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
        address: true,
        image: true,
        verifiedAt: true,
        lastLoggedInAt: true,
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

  const unavailableEmailAddress = await prisma.person
    .count({where: {emailAddress: data.emailAddress}})
    .then((c) => c > 0);

  if (unavailableEmailAddress) {
    throw new EmailAddressNotAvailableError();
  }

  data.password = await hash(input.password, 8);

  const [person] = await Promise.all([
    prisma.person
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
          address: true,
          image: true,
          verifiedAt: true,
          lastLoggedInAt: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      .then((person) => ({
        ...person,
        fullName: [person.firstName, person.lastName].filter(Boolean).join(' '),
      })),
    mailto({
      recipient: input.emailAddress,
      subject: 'Welcome to People Directory',
      html: await render(
        <Welcome
          name={input.firstName}
          redirectUrl={process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}
        />,
      ),
    }).catch(console.warn),
  ]);

  return person;
}

export async function updatePerson(
  ...args: [id: number, data: UpdatePersonDataInput]
): Promise<Person> {
  const id = args[0];
  const data = omitBy(args[1], (v) => isNil(v) || v === '');

  const [unavailableEmailAddress, unavailableMobileNumber] = await (async () => {
    const l = [
      data.emailAddress
        ? prisma.person.count({where: {emailAddress: data.emailAddress, id: {not: id}}})
        : null,
      data.mobileNumber
        ? prisma.person.count({where: {mobileNumber: data.mobileNumber, id: {not: id}}})
        : null,
    ].filter(Boolean);

    if (l.length <= 0) {
      return [false, false];
    }

    const r = await prisma.$transaction(l);

    return [
      !!data.emailAddress && r[0] > 0,
      !!data.mobileNumber && r[data.emailAddress ? 1 : 0] > 0,
    ];
  })();

  if (unavailableEmailAddress) throw new EmailAddressNotAvailableError();
  if (unavailableMobileNumber) throw new MobileNumberNotAvailableError();

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
        address: true,
        image: true,
        verifiedAt: true,
        lastLoggedInAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    .then((person) => ({
      ...person,
      fullName: [person.firstName, person.lastName].filter(Boolean).join(' '),
    }));
}

export async function deletePerson(id: number): Promise<void> {
  await prisma.person.delete({where: {id}});
}

export async function changePassword(id: number, data: ChangePasswordInput): Promise<void> {
  const {newPassword, oldPassword} = data;

  const person = await prisma.person.findUnique({
    where: {id},
    select: {password: true},
  });

  if (!person) {
    throw new AccountNotFoundError();
  }

  const matches = await compare(oldPassword, person.password);

  if (!matches) {
    throw new IncorrectPasswordError();
  }

  await prisma.person.update({
    where: {id},
    data: {password: await hash(newPassword, 8)},
  });
}

export async function resetPassword(data: ResetPasswordInput): Promise<void> {
  const {emailAddress, password, otpCode} = data;

  const person = await prisma.person.findUnique({
    where: {emailAddress},
    select: {id: true},
  });

  if (!person) {
    throw new AccountNotFoundError();
  }

  const otp = await prisma.otp.findUnique({
    where: {
      code: otpCode,
      emailAddress,
    },
    select: {
      code: true,
      expiresAt: true,
    },
  });

  if (!otp || otp.code !== otpCode) {
    throw new InvalidOtpError();
  }

  if (otp.expiresAt < new Date()) {
    throw new OtpAlreadyExpiredError();
  }

  await prisma.$transaction([
    prisma.otp.deleteMany({where: {code: otpCode, emailAddress}}),
    prisma.person.update({
      where: {emailAddress},
      data: {password: await hash(password, 8)},
    }),
  ]);
}
