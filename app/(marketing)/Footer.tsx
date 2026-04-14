import Image from 'next/image';
import Link from 'next/link';
import {Button} from '~/components/ui/Button';

const quickLinks = [
  {label: 'Features', href: '#features'},
  {label: 'How It Works', href: '#how-it-works'},
  {label: 'Testimonials', href: '#testimonials'},
  {label: 'FAQs', href: '#faqs'},
  {label: 'Sign in', href: '/login'},
  {label: 'Register', href: '/register'},
];

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-12 px-4 py-12 lg:flex-row lg:px-6">
        <div>
          <Image
            src="/images/logo-dark.svg"
            alt=""
            width={50}
            height={44}
            className="block h-8 w-auto"
          />
          <p className="mt-3 max-w-md text-neutral-300 text-sm leading-relaxed">
            Let people register themselves and be found publicly while keeping sensitive contact
            details visible only to verified users through liveness checks and ID data matching.
          </p>

          <nav>
            <ul className="mt-3 flex gap-2">
              <li>
                <a href="/#">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 14 14"
                    className="size-6"
                  >
                    <path
                      fill="currentColor"
                      d="M3.677 13.107a3.166 3.166 0 0 1-2.783-2.79C.78 9.242.682 8.138.682 7.013s.097-2.23.212-3.304A3.166 3.166 0 0 1 3.677.919C4.758.799 5.868.695 7 .695s2.242.103 3.323.224a3.166 3.166 0 0 1 2.783 2.79c.115 1.075.212 2.179.212 3.304s-.097 2.229-.212 3.304a3.166 3.166 0 0 1-2.783 2.79q-.63.071-1.273.127a.493.493 0 0 1-.534-.494v-2.695h1.522a.5.5 0 0 0 .5-.5V8.018a.5.5 0 0 0-.5-.5H8.516v-1.01a1.01 1.01 0 0 1 1.011-1.011h.511a.5.5 0 0 0 .5-.5V3.98a1.01 1.01 0 0 0-1.01-1.01h-.506a3.033 3.033 0 0 0-3.033 3.032v1.516H4.467a.5.5 0 0 0-.5.5v1.527a.5.5 0 0 0 .5.5H5.99v2.735a.49.49 0 0 1-.524.494a42 42 0 0 1-1.788-.167"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="w-40 shrink-0">
          <p className="font-semibold text-neutral-200 text-sm uppercase">Quick Links</p>
          <ul className="mt-4 space-y-3 text-neutral-300 text-sm">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-80 shrink-0">
          <p className="font-semibold text-neutral-200 text-sm uppercase">Newsletter</p>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="h-11 w-full rounded-sm border border-neutral-700 bg-neutral-800 px-4 text-neutral-100 outline-none placeholder:text-neutral-400"
            />
            <Button type="submit" className="sm:shrink-0">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </footer>
  );
}
