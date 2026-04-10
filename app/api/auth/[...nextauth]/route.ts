import {PrismaAdapter} from '@auth/prisma-adapter';
import {invariant} from 'es-toolkit';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import {prisma} from '~/config/prisma';

invariant(process.env.GOOGLE_CLIENT_ID, "missing env: 'GOOGLE_CLIENT_ID'");
invariant(process.env.GOOGLE_CLIENT_SECRET, "missing env: 'GOOGLE_CLIENT_SECRET'");

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});

export {handler as GET, handler as POST};
