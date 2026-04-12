import {render} from '@react-email/components';
import {addMinutes} from 'date-fns';
import {type NextRequest, NextResponse} from 'next/server';
import {uid} from 'uid';
import z from 'zod';
import {prisma} from '~/config/prisma';
import Otp from '~/emails/Otp';
import type {HttpVoidResponse} from '~/types/common';
import {mailto} from '~/utils/mailto';

const def = z.object({emailAddress: z.email()});

export async function POST(req: NextRequest): Promise<NextResponse<HttpVoidResponse>> {
  const Cookies = req.cookies;
  const id = Number.parseInt(Cookies.get('user')?.value ?? '', 10);

  if (id == null || Number.isNaN(id)) {
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

  const body = await req.json();
  const result = def.safeParse(body);

  if (!result.success) {
    return NextResponse.json({
      ok: false,
      error: {
        name: 'BadRequest',
        message: result.error.issues[0].message,
      },
    });
  }

  const count = await prisma.person.count({
    where: {
      id,
      emailAddress: result.data.emailAddress,
    },
  });

  if (count <= 0) {
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

  const code = uid(6);
  const expiresAt = addMinutes(new Date(), 10);
  const {emailAddress} = result.data;
  const emailContent = await render(<Otp code={code} emailAddress={emailAddress} />);

  await Promise.all([
    mailto({
      recipient: emailAddress,
      subject: 'Your OTP Code',
      html: emailContent,
    }),
    prisma.otp.upsert({
      where: {
        emailAddress,
      },
      create: {
        code,
        expiresAt,
        emailAddress,
      },
      update: {
        code,
        expiresAt,
      },
      select: {
        id: true,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
  });
}
