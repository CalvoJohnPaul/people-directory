import {FolderOpenIcon} from 'lucide-react';
import type {Metadata} from 'next';
import Link from 'next/link';
import {Button} from '~/components/ui/Button';

const highlights = [
  {
    title: 'Smart Contact Cards',
    description: 'Create clean, searchable profiles that are easy to share and easier to trust.',
  },
  {
    title: 'One-Tap Verification',
    description:
      'Reduce fake entries with optional email, mobile, and identity verification flows.',
  },
  {
    title: 'Face Matching Ready',
    description:
      'Built to support modern identity workflows for teams that need stronger confidence.',
  },
  {
    title: 'Team-Friendly Access',
    description: 'Organize people records in one place and collaborate without spreadsheet chaos.',
  },
];

const stats = [
  {label: 'People Profiles Created', value: '120K+'},
  {label: 'Avg. Lookup Time', value: '1.2s'},
  {label: 'Verification Success', value: '98.4%'},
];

const faqs = [
  {
    question: 'Can we start without verification?',
    answer:
      'Yes. You can launch with profile capture first, then enable email or mobile verification when your team is ready.',
  },
  {
    question: 'Is People suitable for internal teams?',
    answer:
      'Yes. Operations, onboarding, and support teams use People to keep records accurate in one shared workspace.',
  },
  {
    question: 'How quickly can we go live?',
    answer:
      'Most teams publish their first working directory in a day, then iterate with additional verification rules.',
  },
  {
    question: 'Do profile links work on mobile?',
    answer:
      'Yes. Shared profile pages and quick actions are designed to work smoothly on both desktop and mobile browsers.',
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
  description: 'The faster way to build and manage trusted people profiles.',
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
                Built for fast-moving teams
              </p>
              <h1 className="mt-6 text-balance font-bold text-4xl text-neutral-900 leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Build trusted people profiles without slowing down your team.
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-base text-neutral-700 leading-relaxed sm:text-lg">
                People helps you capture, verify, and organize profiles in one polished workflow.
                From sign-up to verification, every step is designed to keep your directory accurate
                and usable.
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
                Live Identity Health: 98%
              </div>
              <p className="text-stone-300 text-xs uppercase tracking-widest">Today Snapshot</p>
              <p className="mt-2 font-semibold text-3xl">2,483 Active Profiles</p>
              <p className="mt-1 text-sm text-stone-300">
                Updated in real time across your workspace
              </p>

              <div className="mt-8 space-y-3">
                {[
                  {name: 'Verified contacts', value: '1,924'},
                  {name: 'Pending review', value: '118'},
                  {name: 'Need updates', value: '41'},
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
                Everything needed to run a trusted people directory
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
              From signup to searchable profile in three simple steps.
            </h2>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Collect Core Details',
                  body: 'Capture names, contact points, and profile photo with structured forms.',
                },
                {
                  step: '02',
                  title: 'Verify and Enrich',
                  body: 'Run OTP checks and optional identity validation before publishing records.',
                },
                {
                  step: '03',
                  title: 'Share and Maintain',
                  body: 'Distribute profile links and keep records fresh with clear update workflows.',
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
                Customer Story
              </p>
              <h2 className="mt-2 font-bold text-2xl text-neutral-900 leading-tight sm:text-3xl">
                "We replaced four disconnected tools with one flow."
              </h2>
              <p className="mt-5 text-base text-neutral-700 leading-relaxed">
                "Our onboarding team now validates and publishes profiles in minutes. Accuracy
                improved, duplicate records dropped, and everyone works from the same source of
                truth."
              </p>
              <p className="mt-4 font-medium text-neutral-800 text-sm">
                Ariane Tan, Operations Lead
              </p>
            </div>

            <div className="rounded-sm border border-neutral-200 bg-neutral-50 p-7 sm:p-8">
              <h3 className="font-semibold text-lg text-neutral-900">
                Ready to launch your directory?
              </h3>
              <p className="mt-2 text-neutral-700 text-sm">
                Start with your first team and scale profile verification as you grow.
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
              Common questions before you launch
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
              Build and manage trusted profiles in one place. Capture, verify, and share records
              with confidence.
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
