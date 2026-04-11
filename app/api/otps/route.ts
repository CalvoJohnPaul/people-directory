import {addMinutes} from 'date-fns';
import {uid} from 'uid';
import {prisma} from '~/config/prisma';
import type {Otp} from '~/types/Otp';

export async function generateOtp(emailAddress: string): Promise<Otp> {
  const code = uid(6);
  const expiresAt = addMinutes(new Date(), 10);

  const otp = await prisma.otp.upsert({
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
      code: true,
      expiresAt: true,
      emailAddress: true,
    },
  });

  return otp;
}
