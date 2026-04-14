import Link from 'next/link';
import {Button} from '~/components/ui/Button';

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-4 py-28 lg:px-6 lg:py-40">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="font-semibold text-neutral-700 text-xs uppercase tracking-[0.15em]">
            What This App Does
          </p>
          <h2 className="mt-2 font-bold text-2xl text-neutral-900 leading-tight sm:text-3xl">
            A public people directory with privacy-aware access control.
          </h2>
          <p className="mt-5 text-base text-neutral-700 leading-relaxed">
            The directory is discoverable for everyone, while private contact details remain visible
            only to users who are logged in and verified through liveness and ID-based validation.
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
              <Link href="/register">Create account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
