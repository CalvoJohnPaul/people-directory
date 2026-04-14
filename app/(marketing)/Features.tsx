import Image from 'next/image';

const features = [
  {
    title: 'Self-registration profiles',
    image: '/images/public-profile.svg',
    description:
      'People can register themselves and publish a profile so others can easily find them.',
  },
  {
    title: 'Verified privacy controls',
    image: '/images/verification-flow.svg',
    description:
      'Mobile number and email remain protected unless a viewer is logged in and verified.',
  },
  {
    title: 'Robust identity verification',
    image: '/images/robust-verification.svg',
    description:
      'Verification uses face liveness checks and compares submitted details against ID document data.',
  },
  {
    title: 'Public profile discovery',
    image: '/images/search-modes.svg',
    description:
      'Anyone can discover public profile information while sensitive fields stay gated.',
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 pb-28 lg:px-6 lg:pb-40">
      <div className="flex items-end justify-between gap-6 lg:mx-auto lg:w-fit">
        <div>
          <p className="font-semibold text-neutral-700 text-xs uppercase tracking-[0.14em] lg:text-center">
            Features
          </p>
          <h2 className="mt-2 font-bold text-2xl text-neutral-900 sm:text-3xl">
            Core functionality built into your people directory
          </h2>
        </div>
      </div>

      <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2">
        {features.map((item) => (
          <article key={item.title}>
            <Image
              src={item.image}
              alt={item.title}
              width={360}
              height={220}
              className="block h-auto w-full rounded-md"
            />
            <h3 className="mt-4 font-semibold text-neutral-900 text-xl">{item.title}</h3>
            <p className="text-neutral-700 text-sm leading-relaxed">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
