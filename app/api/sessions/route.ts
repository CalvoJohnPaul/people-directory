import {addDays, isAfter} from 'date-fns';
import {cookies} from 'next/headers';
import {type NextRequest, NextResponse} from 'next/server';
import {prisma} from '~/config/prisma';
import type {HttpVoidResponse} from '~/types/common';
import type {CreateSessionInput} from '~/types/Session';
import {CreateSessionInputDefinition} from '~/types/Session';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = CreateSessionInputDefinition.parse(body);
}

export async function DELETE(): Promise<NextResponse<HttpVoidResponse>> {
  const Cookies = await cookies();
  Cookies.delete('user');
  return NextResponse.json({ok: true});
}

async function createSession(input: CreateSessionInput): Promise<boolean> {
  const verified = await verifyOtp(input.emailAddress, input.otpCode);

  if (!verified) return false;

  await deleteOtp(input.emailAddress);

  const id = await getPersonId(input.emailAddress);

  if (id == null) return false;

  const Cookies = await cookies();

  Cookies.set('user', id.toString(), {
    httpOnly: true,
    expires: addDays(new Date(), 1),
    sameSite: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return true;
}

async function getPersonId(emailAddress: string): Promise<number | null> {
  const person = await prisma.person.findUnique({
    where: {emailAddress},
    select: {id: true},
  });

  return person?.id ?? null;
}

async function verifyOtp(emailAddress: string, code: string): Promise<boolean> {
  const otp = await prisma.otp.findUnique({
    where: {
      emailAddress,
    },
    select: {
      code: true,
      expiresAt: true,
    },
  });

  if (!otp) {
    return false;
  }

  const now = new Date();

  if (isAfter(now, otp.expiresAt)) {
    return false;
  }

  return otp.code === code;
}

async function deleteOtp(emailAddress: string): Promise<void> {
  await prisma.otp.deleteMany({
    where: {
      emailAddress,
    },
  });
}

async function destroySession(): Promise<void> {}
