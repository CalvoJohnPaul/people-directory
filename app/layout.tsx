import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import type {PropsWithChildren} from 'react';
import {cx} from 'tailwind-variants';
import {Providers} from './Providers';

const sans = Geist({
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  subsets: ['latin'],
  preload: true,
  variable: '--font-sans',
});

const mono = Geist_Mono({
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  subsets: ['latin'],
  preload: true,
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'People',
    template: '%s | People',
  },
};

export default function Layout({children}: PropsWithChildren) {
  return (
    <html lang="en" className={cx(sans.variable, mono.variable, 'scheme-light scroll-smooth')}>
      <body className="min-h-dvh bg-white font-sans text-gray-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
