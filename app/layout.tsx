import type {Metadata} from 'next';
import {Google_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';
import type {PropsWithChildren} from 'react';
import {cx} from 'tailwind-variants';
import {Providers} from './Providers';

const sans = Google_Sans({
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  subsets: ['latin'],
  preload: true,
  variable: '--font-sans',
});

const mono = JetBrains_Mono({
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
  return (
    <html
      lang="en"
      className={cx(sans.variable, mono.variable, 'scheme-light scroll-smooth')}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-dvh bg-white font-sans text-gray-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
