import Image from 'next/image';
import Link from 'next/link';
import {Button} from '~/components/ui/Button';

export function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col px-4 pt-4 pb-28 lg:px-6 lg:pt-6 lg:pb-40">
      <div className="mt-16 grid items-end gap-10 lg:mt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div>
          <p className="inline-flex items-center rounded-sm border border-neutral-300 bg-white px-2.5 py-1.5 font-semibold text-neutral-700 text-xs uppercase tracking-wide">
            Public directory with privacy controls
          </p>
          <h1 className="mt-6 text-balance font-bold text-4xl text-neutral-900 leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Register once. Get found by anyone.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base text-neutral-700 leading-relaxed sm:text-lg">
            People lets individuals create public profiles so others can discover them quickly.
            Non-verified viewers can search and browse, but sensitive fields like mobile number and
            email stay protected. Verification is strengthened with face liveness checks and ID data
            comparison.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">Create account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>

          <ul className="mt-10 max-w-2xl space-y-2 text-neutral-700 text-sm">
            {[
              {
                label: 'Search methods',
                value: 'Face, QR, Email+',
              },
              {
                label: 'Profile visibility',
                value: 'Public by default',
              },
              {
                label: 'Sensitive fields',
                value: 'Verified users only',
              },
            ].map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-4 border-blue-500 border-l-2 bg-neutral-50 px-4 py-3"
              >
                <p className="grow text-neutral-600 text-xs uppercase tracking-[0.12em]">
                  {item.label}
                </p>
                <p className="font-semibold text-lg text-neutral-900 leading-tight">{item.value}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-md border border-neutral-700 bg-neutral-800 p-6 text-white sm:p-8">
          <div className="absolute -top-5 -right-4 rounded-sm border border-neutral-500 bg-neutral-700 px-2 py-1 font-medium text-neutral-100 text-xs">
            Verification: Liveness + ID Match
          </div>
          <p className="text-neutral-300 text-xs uppercase tracking-widest">
            Trust & Privacy Rules
          </p>
          <p className="mt-2 font-semibold text-3xl">Robust Verification Enabled</p>
          <p className="mt-1 text-neutral-300 text-sm">
            Search by face, QR code, email, and profile fields
          </p>

          <Image
            src="/images/hero-network.svg"
            alt=""
            width={720}
            height={420}
            className="mt-5 block h-auto w-full rounded-sm"
          />

          <div className="mt-8 space-y-3">
            {[
              {
                name: 'Public viewers',
                value: 'Profile basics only',
              },
              {
                name: 'Verified viewers',
                value: 'Contact details visible',
              },
              {
                name: 'Verification checks',
                value: 'Liveness + ID data match',
              },
            ].map((row) => (
              <div
                key={row.name}
                className="flex items-center justify-between rounded-sm border border-neutral-500/60 bg-neutral-700/80 px-4 py-3"
              >
                <span className="text-neutral-200 text-sm">{row.name}</span>
                <span className="font-semibold text-sm text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
