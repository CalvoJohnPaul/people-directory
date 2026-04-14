import {cache} from 'react';
import {prisma} from '~/config/prisma';
import type {Person} from '~/types/Person';

export const getPerson = cache(async (id: number): Promise<Person | null> => {
  return await prisma.person.findUnique({
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
});
