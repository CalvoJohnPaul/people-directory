'use client';

import {RotateCcwIcon, TriangleAlertIcon} from 'lucide-react';
import {Button} from '~/components/ui/Button';

interface Props {
  error: Error & {digest?: string};
  unstable_retry: () => void;
}

export default function Page(props: Props) {
  return (
    <main className="relative grid min-h-dvh place-items-center px-4 py-12">
      <section className="w-full max-w-2xl text-center">
        <TriangleAlertIcon
          className="mx-auto mb-8 size-12 text-neutral-300"
          strokeWidth={1.66667}
        />

        <p className="font-mono text-rose-600 text-sm uppercase">{props.error.name}</p>
        <h1 className="mt-3 font-semibold text-3xl">Something is not right</h1>
        <p className="mx-auto mt-3 max-w-md text-neutral-600">
          An unexpected error has occurred. Please click the button below to retry or refresh the
          page.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={props.unstable_retry}>
            <RotateCcwIcon className="size-4" />
            Retry
          </Button>
        </div>
      </section>
    </main>
  );
}
