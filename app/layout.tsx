import type {Metadata} from 'next';
import {Fira_Code, Google_Sans} from 'next/font/google';
import './globals.css';
import {getServerSession} from 'next-auth';
import type {PropsWithChildren} from 'react';
import {cx} from 'tailwind-variants';
import {authOptions} from '~/config/auth';
import {Providers} from './Providers';

const sans = Google_Sans({
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  subsets: ['latin'],
  preload: true,
  variable: '--font-sans',
});

const mono = Fira_Code({
  weight: ['400', '500', '600', '700'],
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
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      className={cx(sans.variable, mono.variable, 'scheme-light scroll-smooth')}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-dvh bg-white font-sans text-gray-800">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
