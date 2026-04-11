import {invariant} from 'es-toolkit';
import nodemailer from 'nodemailer';

export type MailtoOptions =
  | {
      subject: string;
      recipient: string;
      text?: never;
      html: string;
    }
  | {
      subject: string;
      recipient: string;
      text: string;
      html?: never;
    };

export async function mailto(options: MailtoOptions): Promise<boolean> {
  try {
    const res = await transport.sendMail({
      subject: options.subject,
      from: 'People Directory <noreply@peopledirectory.org>',
      to: options.recipient,
      html: options.html,
      text: options.text,
    });

    return res.rejected.length <= 0;
  } catch (e) {
    console.error(e);
    return false;
  }
}

invariant(process.env.EMAIL_USERNAME, "Missing env: 'EMAIL_USERNAME'");
invariant(process.env.EMAIL_PASSWORD, "Missing env: 'EMAIL_PASSWORD'");

const transport = nodemailer.createTransport({
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
});
