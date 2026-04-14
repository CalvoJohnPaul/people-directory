import type {Metadata} from 'next';
import {Navbar} from '~/components/Navbar';
import {ContactUs} from './ContactUs';
import {Faqs} from './Faqs';
import {Features} from './Features';
import {Footer} from './Footer';
import {Hero} from './Hero';
import {HowItWorks} from './HowItWorks';
import {Testimonials} from './Testimonials';

export const metadata: Metadata = {
  title: 'Marketing',
  description:
    'Self-registration public profiles with robust verification, liveness checks, and protected sensitive fields.',
};

export default function MarketingPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-x-clip bg-white text-neutral-900">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Faqs />
        <ContactUs />
      </main>
      <Footer />
    </>
  );
}
