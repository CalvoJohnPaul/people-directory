import {FolderOpenIcon} from 'lucide-react';
import type {Metadata} from 'next';
import Link from 'next/link';
import {Button} from '~/components/ui/Button';

const highlights = [
  {
    title: 'Self-Registration Profiles',
    description:
      'People can register themselves and publish a profile so others can easily find them.',
  },
  {
    title: 'Verified Privacy Controls',
    description:
      'Mobile number and email remain protected unless a viewer is logged in and verified.',
  },
  {
    title: 'Robust Identity Verification',
    description:
      'Verification uses face liveness checks and compares submitted details against ID document data.',
  },
  {
    title: 'Public Profile Discovery',
    description:
      'Anyone can discover public profile information while sensitive fields stay gated.',
  },
];

const stats = [
  {label: 'Search Methods', value: 'Face, QR, Email+'},
  {label: 'Profile Visibility', value: 'Public by default'},
  {label: 'Sensitive Fields', value: 'Verified users only'},
];

const faqs = [
  {
    question: 'Can anyone view mobile number or email?',
    answer:
      'No. Sensitive fields like mobile number and email are hidden unless the viewer is logged in and verified.',
  },
  {
    question: 'Do people create their own profile?',
    answer:
      'Yes. The app is designed for self-registration so individuals can create and manage their own public profile.',
  },
  {
    question: 'How robust is your verification process?',
    answer:
      'Our flow includes liveness checks during face verification and data matching against submitted ID details to strengthen trust.',
  },
  {
    question: 'How can someone search for a person?',
    answer:
      'Search supports multiple methods including face, QR code, email, and other searchable profile details.',
  },
];

const footerQuickLinks = [
  {label: 'Features', href: '#features'},
  {label: 'How It Works', href: '#how-it-works'},
  {label: 'Testimonials', href: '#testimonials'},
  {label: 'FAQs', href: '#faqs'},
  {label: 'Log in', href: '/login'},
  {label: 'Register', href: '/register'},
];

export const metadata: Metadata = {
  title: 'Marketing',
  description:
    'Self-registration public profiles with robust verification, liveness checks, and protected sensitive fields.',
};

export default function MarketingPage() {
  return (
    <>
      <header className="flex items-center border-b p-4 lg:px-6 lg:py-4">
        <Link
          href="/"
          draggable={false}
          className="inline-flex size-11 items-center justify-center rounded-sm border bg-white text-neutral-700"
        >
          <FolderOpenIcon className="size-5" />
        </Link>
        <div className="grow" />
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/people">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="relative overflow-x-clip bg-white text-neutral-900">
        <section className="mx-auto flex max-w-6xl flex-col px-4 pt-4 pb-14 lg:px-6 lg:pt-6 lg:pb-20">
          <div className="mt-16 grid items-end gap-10 lg:mt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div>
              <p className="inline-flex items-center border border-neutral-300 bg-white px-4 py-1.5 font-semibold text-neutral-700 text-xs uppercase tracking-[0.12em]">
                Public directory with privacy controls
              </p>
              <h1 className="mt-6 text-balance font-bold text-4xl text-neutral-900 leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Register once. Get found by anyone.
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-base text-neutral-700 leading-relaxed sm:text-lg">
                People lets individuals create public profiles so others can discover them quickly.
                Non-verified viewers can search and browse, but sensitive fields like mobile number
                and email stay protected. Verification is strengthened with face liveness checks and
                ID data comparison.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/register">Start Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">See Demo Workspace</Link>
                </Button>
              </div>

              <ul className="mt-10 grid gap-4 text-neutral-700 text-sm sm:grid-cols-3">
                {stats.map((item) => (
                  <li
                    key={item.label}
                    className="rounded-sm border border-neutral-200 bg-neutral-50 p-4"
                  >
                    <p className="font-semibold text-2xl text-neutral-900">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide">{item.label}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-sm border border-stone-700 bg-stone-800 p-6 text-white sm:p-8">
              <div className="absolute -top-5 -right-4 rounded-sm border border-stone-500 bg-stone-700 px-4 py-1 font-medium text-stone-100 text-xs">
                Verification: Liveness + ID Match
              </div>
              <p className="text-stone-300 text-xs uppercase tracking-widest">
                Trust & Privacy Rules
              </p>
              <p className="mt-2 font-semibold text-3xl">Robust Verification Enabled</p>
              <p className="mt-1 text-sm text-stone-300">
                Search by face, QR code, email, and profile fields
              </p>

              <div className="mt-8 space-y-3">
                {[
                  {name: 'Public viewers', value: 'Profile basics only'},
                  {name: 'Verified viewers', value: 'Contact details visible'},
                  {name: 'Verification checks', value: 'Liveness + ID data match'},
                ].map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between rounded-sm border border-stone-500/60 bg-stone-700/80 px-4 py-3"
                  >
                    <span className="text-sm text-stone-200">{row.name}</span>
                    <span className="font-semibold text-sm text-white">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 pb-16 lg:px-6 lg:pb-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-semibold text-neutral-700 text-xs uppercase tracking-[0.14em]">
                Features
              </p>
              <h2 className="mt-2 font-bold text-2xl text-neutral-900 sm:text-3xl">
                Core functionality built into your people directory
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-sm border border-neutral-200 bg-neutral-50 p-6"
              >
                <h3 className="font-semibold text-neutral-900 text-xl">{item.title}</h3>
                <p className="mt-3 text-neutral-700 text-sm leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-stone-900 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-6">
            <p className="font-semibold text-stone-300 text-xs uppercase tracking-[0.15em]">
              How It Works
            </p>
            <h2 className="mt-2 max-w-2xl font-bold text-2xl leading-tight sm:text-3xl">
              From self-registration to protected profile access in three steps.
            </h2>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Register Your Profile',
                  body: 'People create their own public profile with searchable personal details.',
                },
                {
                  step: '02',
                  title: 'Verify for Full Access',
                  body: 'Verification runs face liveness checks and compares captured data with submitted ID details.',
                },
                {
                  step: '03',
                  title: 'Find Anyone Quickly',
                  body: 'Use face, QR code, email, and other fields to locate profiles fast.',
                },
              ].map((card) => (
                <article
                  key={card.step}
                  className="rounded-sm border border-stone-600 bg-stone-800 p-6"
                >
                  <p className="font-semibold text-stone-300 text-xs uppercase tracking-[0.16em]">
                    Step {card.step}
                  </p>
                  <h3 className="mt-2 font-semibold text-white text-xl">{card.title}</h3>
                  <p className="mt-3 text-sm text-stone-300 leading-relaxed">{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-semibold text-neutral-700 text-xs uppercase tracking-[0.15em]">
                What This App Does
              </p>
              <h2 className="mt-2 font-bold text-2xl text-neutral-900 leading-tight sm:text-3xl">
                A public people directory with privacy-aware access control.
              </h2>
              <p className="mt-5 text-base text-neutral-700 leading-relaxed">
                The directory is discoverable for everyone, while private contact details remain
                visible only to users who are logged in and verified through liveness and ID-based
                validation.
              </p>
              <p className="mt-4 font-medium text-neutral-800 text-sm">
                Built for open discovery with protected sensitive data.
              </p>
            </div>

            <div className="rounded-sm border border-neutral-200 bg-neutral-50 p-7 sm:p-8">
              <h3 className="font-semibold text-lg text-neutral-900">
                Create your searchable public profile
              </h3>
              <p className="mt-2 text-neutral-700 text-sm">
                Register now and become discoverable by face, QR code, email, and more.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/register">Create Account</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="faqs" className="mx-auto max-w-6xl px-4 pb-16 lg:px-6 lg:pb-20">
          <div className="max-w-3xl">
            <p className="font-semibold text-neutral-700 text-xs uppercase tracking-[0.15em]">
              FAQs
            </p>
            <h2 className="mt-2 font-bold text-2xl text-neutral-900 leading-tight sm:text-3xl">
              Common questions about visibility and access
            </h2>
          </div>

          <div className="mt-10 rounded-sm border border-neutral-200 bg-neutral-50">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="group border-neutral-200 border-b px-6 py-4 last:border-b-0"
              >
                <summary className="flex list-none items-center justify-between gap-4 font-semibold text-base text-neutral-900 leading-snug sm:text-lg">
                  <span>{item.question}</span>
                  <span className="text-neutral-500 text-xl leading-none group-open:hidden">+</span>
                  <span className="hidden text-neutral-500 text-xl leading-none group-open:block">
                    -
                  </span>
                </summary>
                <p className="pt-3 text-neutral-700 text-sm leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-neutral-800 border-t bg-neutral-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-6">
          <div>
            <p className="font-semibold text-lg text-neutral-200">People</p>
            <p className="mt-3 max-w-md text-neutral-300 text-sm leading-relaxed">
              Let people register themselves and be found publicly while keeping sensitive contact
              details visible only to verified users through liveness checks and ID data matching.
            </p>
          </div>

          <div>
            <p className="font-semibold text-neutral-200 text-sm uppercase tracking-[0.12em]">
              Quick Links
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-neutral-300 text-sm">
              {footerQuickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
