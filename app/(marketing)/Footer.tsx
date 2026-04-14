import Image from 'next/image';
import Link from 'next/link';

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
    <footer className="border-neutral-800 border-t bg-neutral-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-6">
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
        </div>

        <div>
          <p className="font-semibold text-neutral-200 text-sm uppercase tracking-[0.12em]">
            Quick Links
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-neutral-300 text-sm">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
