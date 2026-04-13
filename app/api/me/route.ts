import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {prisma} from '~/config/prisma';
import type {HttpResponse} from '~/types/common';
import type {Person} from '~/types/Person';

export async function GET(): Promise<NextResponse<HttpResponse<Person | null>>> {
  const Cookies = await cookies();
  const id = parseInt(Cookies.get('user')?.value ?? '', 10);

  if (Number.isNaN(id)) {
    return NextResponse.json({
      ok: true,
      data: null,
    });
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

  return NextResponse.json({
    ok: true,
    data,
  });
}
