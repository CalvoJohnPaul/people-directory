import {Accordion} from '@ark-ui/react';
import {ChevronDownIcon} from 'lucide-react';

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
      <div className="lg:mx-auto">
        <p className="font-semibold text-neutral-700 text-xs uppercase tracking-[0.15em] lg:text-center">
          FAQs
        </p>
        <h2 className="mt-2 font-bold text-2xl text-neutral-900 leading-tight sm:text-3xl lg:text-center">
          Common questions about visibility and access
        </h2>
      </div>

      <Accordion.Root collapsible className="mt-12 rounded-sm border border-neutral-200 bg-white">
        {faqs.map((item) => (
          <Accordion.Item
            key={item.question}
            value={item.question}
            className="group border-neutral-200 border-b px-6 py-4 last:border-b-0"
          >
            <Accordion.ItemTrigger className="flex w-full items-center justify-between gap-4 text-left font-semibold text-neutral-900 sm:text-lg">
              <span className="grow">{item.question}</span>
              <Accordion.ItemIndicator
                asChild
                className="size-5 ui-open:rotate-180 text-neutral-500 transition-transform duration-250"
              >
                <ChevronDownIcon />
              </Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent className="ui-closed:animate-collapse-out ui-open:animate-collapse-in pt-3 text-neutral-600 text-sm leading-relaxed">
              {item.answer}
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
