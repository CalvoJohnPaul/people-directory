'use client';

import {Toaster} from '@ark-ui/react';
import {QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {XIcon} from 'lucide-react';
import {NavigationGuardProvider} from 'next-navigation-guard';
import {NuqsAdapter} from 'nuqs/adapters/next';
import type {ReactNode} from 'react';
import {Toast} from '~/components/ui/Toast';
import {client} from '~/config/client';
import {toaster} from '~/config/toaster';

export interface ProvidersProps {
  children: ReactNode;
}

export function Providers({children}: ProvidersProps) {
  return (
    <>
      <QueryClientProvider client={client}>
        <NuqsAdapter>
          <NavigationGuardProvider>{children}</NavigationGuardProvider>
        </NuqsAdapter>
        <ReactQueryDevtools />
      </QueryClientProvider>

      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root key={toast.id}>
            <div>
              <Toast.Title>{toast.title}</Toast.Title>
              <Toast.Description>{toast.description}</Toast.Description>
            </div>
            <Toast.CloseTrigger>
              <XIcon />
            </Toast.CloseTrigger>
          </Toast.Root>
        )}
      </Toaster>
    </>
  );
}
