'use client';

import {Avatar, Carousel} from '@ark-ui/react';
import {chunk} from 'es-toolkit';
import {ChevronLeftIcon, ChevronRightIcon, QuoteIcon} from 'lucide-react';
import {useMediaQuery} from 'usehooks-ts';

interface Testimonial {
  author: {
    name: string;
    photo: string;
    company: {
      name: string;
      position: string;
    };
  };
  message: string;
}

const testimonials: Testimonial[] = [
  {
    author: {
      name: 'Tony Stark',
      photo: 'https://i.pravatar.cc/300?u=1',
      company: {
        name: 'Avengers',
        position: 'CEO',
      },
    },
    message:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus dicta nostrum unde natus ducimus iste itaque reiciendis repellat perspiciatis beatae',
  },
  {
    author: {
      name: 'Bruce Wayne',
      photo: 'https://i.pravatar.cc/300?u=2',
      company: {
        name: 'Wayne Enterprises',
        position: 'Founder',
      },
    },
    message:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus dicta nostrum unde natus ducimus iste itaque reiciendis repellat perspiciatis beatae',
  },
  {
    author: {
      name: 'Clark Kent',
      photo: 'https://i.pravatar.cc/300?u=3',
      company: {
        name: 'Daily Planet',
        position: 'Reporter',
      },
    },
    message:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus dicta nostrum unde natus ducimus iste itaque reiciendis repellat perspiciatis beatae',
  },
  {
    author: {
      name: 'Peter Parker',
      photo: 'https://i.pravatar.cc/300?u=4',
      company: {
        name: 'Daily Bugle',
        position: 'Photographer',
      },
    },
    message:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus dicta nostrum unde natus ducimus iste itaque reiciendis repellat perspiciatis beatae',
  },
];

export function Testimonials() {
  const desktop = useMediaQuery('(min-width: 1024px)');
  const chunks = desktop ? chunk(testimonials, 2) : chunk(testimonials, 1);

  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-4 py-28 lg:px-6 lg:py-40">
      <div className="lg:mx-auto lg:w-fit">
        <p className="font-semibold text-neutral-700 text-xs uppercase tracking-[0.15em] lg:text-center">
          Testimonials
        </p>
        <h2 className="mt-2 font-bold text-2xl text-neutral-900 leading-tight sm:text-3xl lg:text-center">
          See what our customers are saying about us
        </h2>
      </div>

      <Carousel.Root
        slideCount={chunks.length}
        spacing={desktop ? '24px' : '0px'}
        className="mt-12"
      >
        <div className="flex items-center lg:gap-6">
          <Carousel.PrevTrigger className="hidden shrink-0 text-neutral-500 disabled:text-neutral-300 lg:block">
            <ChevronLeftIcon className="size-8" />
          </Carousel.PrevTrigger>
          <Carousel.ItemGroup>
            {chunks.map((list, index) => (
              <Carousel.Item key={index} index={index} asChild>
                <div className="grid gap-6 lg:grid-cols-2">
                  {list.map((item, index) => (
                    <div key={index}>
                      <Item data={item} />
                    </div>
                  ))}
                </div>
              </Carousel.Item>
            ))}
          </Carousel.ItemGroup>
          <Carousel.NextTrigger className="hidden shrink-0 text-neutral-500 disabled:text-neutral-300 lg:block">
            <ChevronRightIcon className="size-8" />
          </Carousel.NextTrigger>
        </div>

        <Carousel.IndicatorGroup className="mx-auto mt-8 flex w-fit gap-2">
          {chunks.map((_, index) => (
            <Carousel.Indicator
              key={index}
              index={index}
              className="size-3 rounded-full bg-neutral-200 ui-current:bg-blue-500"
            />
          ))}
        </Carousel.IndicatorGroup>
      </Carousel.Root>
    </section>
  );
}

interface TestimonialProps {
  data: Testimonial;
}

function Item(props: TestimonialProps) {
  const {author, message} = props.data;

  return (
    <div className="flex-col gap-6 rounded-sm lg:border lg:p-8">
      <QuoteIcon className="size-6 text-neutral-300" />

      <div
        className="mt-4 grow"
        dangerouslySetInnerHTML={{
          __html: message,
        }}
      />

      <div className="mt-4 flex items-center gap-2">
        <Avatar.Root className="size-10 overflow-hidden rounded-full">
          <Avatar.Image src={author.photo} className="size-full object-cover" />
        </Avatar.Root>
        <div>
          <div className="font-medium text-sm">{author.name}</div>
          <div className="text-neutral-500 text-xs">
            {author.company.position} at {author.company.name}
          </div>
        </div>
      </div>
    </div>
  );
}
