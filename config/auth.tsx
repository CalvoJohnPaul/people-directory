import {PrismaAdapter} from '@auth/prisma-adapter';
import {render} from '@react-email/components';
import {invariant} from 'es-toolkit';
import type {AuthOptions} from 'next-auth';
import EmailProvider, {type SendVerificationRequestParams} from 'next-auth/providers/email';
import nodemailer from 'nodemailer';
import * as z from 'zod';
import {prisma} from '~/config/prisma';
import MagicLink from '~/emails/MagicLink';

invariant(process.env.EMAIL_USERNAME, "Missing env: 'EMAIL_USERNAME'");
invariant(process.env.EMAIL_PASSWORD, "Missing env: 'EMAIL_PASSWORD'");

const schema = z.object({
  email: z.email().lowercase().trim(),
});

async function sendVerificationRequest({identifier, url}: SendVerificationRequestParams) {
  const email = schema.shape.email.parse(identifier);
  const html = await render(<MagicLink url={url} email={email} />);

  const transport = nodemailer.createTransport({
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
  });

  await transport.sendMail({
    subject: 'Sign in to People Directory',
    from: 'People Directory <noreply@peopledirectory.org>',
    to: email,
    html,
  });
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      maxAge: 60 * 10 /* 10m */,
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    async signIn({user}) {
      const {email} = schema.parse(user);

      await prisma.user.upsert({
        where: {email},
        update: {},
        create: {email},
      });

      return true;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/',
  },
};
