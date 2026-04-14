const steps = [
  {
    step: '1',
    title: 'Register your profile',
    body: 'People create their own public profile with searchable personal details.',
  },
  {
    step: '2',
    title: 'Verify for full access',
    body: 'Verification runs face liveness checks and compares captured data with submitted ID details.',
  },
  {
    step: '3',
    title: 'Find anyone quickly',
    body: 'Use face, QR code, email, and other fields to locate profiles fast.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-neutral-900 py-28 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <p className="font-semibold text-neutral-300 text-xs uppercase tracking-[0.15em]">
          How It Works
        </p>
        <h2 className="mt-2 max-w-2xl font-bold text-2xl leading-tight sm:text-3xl">
          From self-registration to protected profile access in three steps.
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((card) => (
            <article
              key={card.step}
              className="rounded-sm border border-neutral-600 bg-neutral-800 p-6"
            >
              <p className="font-semibold text-neutral-300 text-xs uppercase tracking-[0.16em]">
                Step {card.step}
              </p>
              <h3 className="mt-2 font-semibold text-white text-xl">{card.title}</h3>
              <p className="mt-3 text-neutral-300 text-sm leading-relaxed">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
