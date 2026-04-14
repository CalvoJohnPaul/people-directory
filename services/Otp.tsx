import {render} from '@react-email/components';
import {addMinutes} from 'date-fns';
import {uid} from 'uid';
import {prisma} from '~/config/prisma';
import Otp from '~/emails/Otp';
import {mailto} from '~/utils/mailto';

export async function sendOtp(emailAddress: string): Promise<boolean> {
  const count = await prisma.person.count({where: {emailAddress}});

  if (count <= 0) return false;

  const code = uid(6).toUpperCase();
  const expiresAt = addMinutes(new Date(), 10);
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

  return true;
}
