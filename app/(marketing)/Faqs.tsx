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

export function Faqs() {
  return (
    <section id="faqs" className="mx-auto max-w-6xl px-4 pb-28 lg:px-6 lg:pb-40">
      <div className="max-w-3xl">
        <p className="font-semibold text-neutral-700 text-xs uppercase tracking-[0.15em]">FAQs</p>
        <h2 className="mt-2 font-bold text-2xl text-neutral-900 leading-tight sm:text-3xl">
          Common questions about visibility and access
        </h2>
      </div>

      <div className="mt-10 rounded-sm border border-neutral-200 bg-white">
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
  );
}
