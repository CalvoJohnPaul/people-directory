import type {Metadata} from 'next';
import {IBM_Plex_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';
import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {type PropsWithChildren, Suspense} from 'react';
import {cx} from 'tailwind-variants';
import {getClient} from '~/config/client';
import {useMeQuery} from '~/hooks/useMeQuery';
import {getMe} from '~/services/Session';
import {Providers} from './Providers';

const sans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  subsets: ['latin'],
  preload: true,
  variable: '--font-sans',
});

const mono = JetBrains_Mono({
  weight: ['400'],
  display: 'swap',
  subsets: ['latin'],
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
    queryFn: () => getMe(),
  });

  return (
    <html
      lang="en"
      className={cx(sans.variable, mono.variable, 'scheme-light scroll-smooth')}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-dvh bg-white font-sans text-neutral-800">
        <Suspense>
          <Providers>
            <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
