import type {Metadata} from 'next';
import {Google_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';
import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {cookies} from 'next/dist/server/request/cookies';
import type {PropsWithChildren} from 'react';
import {cx} from 'tailwind-variants';
import {getClient} from '~/config/client';
import {prisma} from '~/config/prisma';
import {useMeQuery} from '~/hooks/useMeQuery';
import {Providers} from './Providers';

const sans = Google_Sans({
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  subsets: ['latin'],
  preload: true,
  fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  variable: '--font-sans',
});

const mono = JetBrains_Mono({
  weight: ['400'],
  display: 'swap',
  subsets: ['latin'],
  fallback: [
    'ui-monospace',
    'SF Mono',
    'SF Mono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'monospace',
  ],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'People Directory',
    template: '%s | People Directory',
  },
};

export default async function Layout({children}: PropsWithChildren) {
  const client = getClient();
  await client.prefetchQuery({
    queryKey: useMeQuery.getQueryKey(),
    queryFn: async () => {
      const Cookies = await cookies();
      const id = parseInt(Cookies.get('user')?.value ?? '', 10);

      if (Number.isNaN(id)) return null;

      return await prisma.person.findUnique({
        where: {id},
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          gender: true,
          dateOfBirth: true,
          emailAddress: true,
          mobileNumber: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    },
  });

  return (
    <html
      lang="en"
      className={cx(sans.variable, mono.variable, 'scheme-light scroll-smooth')}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-dvh bg-white font-sans text-gray-800">
        <Providers>
          <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>
        </Providers>
      </body>
    </html>
  );
}
