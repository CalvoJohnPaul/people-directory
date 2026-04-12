import {addDays, isAfter} from 'date-fns';
import {cookies} from 'next/headers';
import {type NextRequest, NextResponse} from 'next/server';
import {prisma} from '~/config/prisma';
import type {HttpVoidResponse} from '~/types/common';
import {CreateSessionInputDefinition} from '~/types/Session';

export async function POST(req: NextRequest): Promise<NextResponse<HttpVoidResponse>> {
  const body = await req.json();
  const result = CreateSessionInputDefinition.safeParse(body);

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

  const {emailAddress, otpCode} = result.data;
  const now = new Date();
  const otp = await prisma.otp.findUnique({
    where: {
      emailAddress,
    },
    select: {
      code: true,
      expiresAt: true,
    },
  });

  if (!otp || isAfter(now, otp.expiresAt) || otpCode !== otp.code) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          name: 'Unauthorized',
          message: 'Invalid OTP code',
        },
      },
      {status: 401},
    );
  }

  await prisma.otp.deleteMany({
    where: {
      emailAddress,
    },
  });

  const person = await prisma.person.findUnique({
    where: {
      emailAddress,
    },
    select: {
      id: true,
    },
  });

  if (person == null) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          name: 'Unauthorized',
          message: 'Unauthorized',
        },
      },
      {status: 401},
    );
  }

  const Cookies = await cookies();

  Cookies.set('user', person.id.toString(), {
    httpOnly: true,
    expires: addDays(new Date(), 1),
    sameSite: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return NextResponse.json({ok: true}, {status: 201});
}

export async function DELETE(): Promise<NextResponse<HttpVoidResponse>> {
  const Cookies = await cookies();
  Cookies.delete('user');
  return NextResponse.json({ok: true});
}
