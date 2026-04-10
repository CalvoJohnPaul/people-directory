import {ImageIcon, PlusIcon, QrCodeIcon, SearchIcon} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {Field} from '~/components/ui/Field';
import {IconButton} from '~/components/ui/IconButton';

export default async function Page() {
  return (
    <div className="mx-auto max-w-6xl lg:py-12">
      <div className="flex gap-2 lg:gap-5">
        <div className="flex grow gap-2 lg:shrink-0">
          <Field.Root className="relative grow lg:w-80 lg:grow-0" size="lg">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-gray-500" />
            <Field.Input placeholder="Search name" className="pl-10" />
          </Field.Root>
          <IconButton variant="outline" size="lg">
            <QrCodeIcon />
          </IconButton>
          <IconButton variant="outline" size="lg">
            <ImageIcon />
          </IconButton>
        </div>
        <div className="hidden grow lg:block"></div>
        <IconButton asChild size="lg" className="shrink-0">
          <Link href="/new">
            <PlusIcon />
          </Link>
        </IconButton>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-x-3 gap-y-5 md:mt-12 md:grid-cols-5 lg:mt-16 lg:grid-cols-7">
        {Array.from({length: 10}).map((_, i) => (
          <Link key={i} href="/1" className="block w-full">
            <Image
              src={`https://i.pravatar.cc/400?u=${i}`}
              width={400}
              height={400}
              draggable={false}
              alt=""
              className="aspect-square w-full object-cover"
            />
            <h2 className="mt-2 line-clamp-1 font-medium text-sm leading-none">John Doe</h2>
            <div className="mt-1 items-center gap-1.5 text-gray-600 text-xs leading-none lg:flex">
              <span className="block">Oct 12, 1992</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 8 8"
                className="hidden size-1 text-gray-300 lg:block"
              >
                <circle cx="4" cy="4" r="3" />
              </svg>
              <span className="hidden lg:block">Male</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
