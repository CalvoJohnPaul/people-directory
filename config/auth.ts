import {PrismaAdapter} from '@auth/prisma-adapter';
import {invariant} from 'es-toolkit';
import type {AuthOptions} from 'next-auth';
import EmailProvider, {type SendVerificationRequestParams} from 'next-auth/providers/email';
import nodemailer from 'nodemailer';
import {prisma} from '~/config/prisma';

invariant(process.env.EMAIL_USERNAME, "Missing env: 'EMAIL_USERNAME'");
invariant(process.env.EMAIL_PASSWORD, "Missing env: 'EMAIL_PASSWORD'");

const template = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1f2937;">
        <p style="margin: 0 0 16px; font-size: 16px;">Sign in to <strong>People Directory</strong>.</p>
        <p style="margin: 0 0 24px;">
          <a
            href="%link%"
            style="display: inline-block; border-radius: 9999px; background: #111827; color: #ffffff; padding: 12px 20px; text-decoration: none; font-weight: 600;"
          >
            Sign in
          </a>
        </p>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">This link expires in 10 minutes.</p>
      </div>
    `;

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: 'no-reply@peopledirectory.org',
      maxAge: 10 * 60,
      sendVerificationRequest: async ({identifier, url}: SendVerificationRequestParams) => {
        const transport = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        const result = await transport.sendMail({
          to: identifier,
          from: `People Directory <${process.env.EMAIL_USERNAME}>`,
          subject: 'Sign in to People Directory',
          html: template.replace('%link%', url),
        });

        const failed = result.rejected.concat(result.pending).filter(Boolean);

        if (failed.length > 0) {
          throw new Error(`Email (${failed.join(', ')}) could not be sent`);
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
  },
};
