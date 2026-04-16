import {ArrowLeftIcon, MapPinXIcon} from 'lucide-react';
import type {Metadata} from 'next';
import Link from 'next/link';
import {buttonRecipe} from '~/components/ui/Button/Button.recipe';

export const metadata: Metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-4 py-12">
      <section className="w-full max-w-2xl text-center">
        <MapPinXIcon className="mx-auto mb-8 size-12 text-neutral-300" strokeWidth={1.66667} />

        <p className="font-mono text-rose-600 text-sm uppercase">Error 404</p>
        <h1 className="mt-3 font-semibold text-3xl">This page is off the map</h1>
        <p className="mx-auto mt-3 max-w-md text-neutral-600">
          The page you requested does not exist or may have been moved. Please check the URL and try
          again.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/people" className={buttonRecipe({variant: 'outline'})}>
            <ArrowLeftIcon className="size-4" />
            Go to home
          </Link>
        </div>
      </section>
    </main>
  );
}
