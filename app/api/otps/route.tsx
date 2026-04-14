import {type NextRequest, NextResponse} from 'next/server';
import z from 'zod';
import {sendOtp} from '~/services/Otp';
import type {HttpVoidResponse} from '~/types/common';

const def = z.object({emailAddress: z.email()});

export async function POST(req: NextRequest): Promise<NextResponse<HttpVoidResponse>> {
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

  const ok = await sendOtp(result.data.emailAddress);

  if (!ok) {
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

  return NextResponse.json({ok: true});
}
