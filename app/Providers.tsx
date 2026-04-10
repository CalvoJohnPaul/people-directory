'use client';

import {Toast, Toaster} from '@ark-ui/react';
import {QueryClientProvider} from '@tanstack/react-query';
import {XIcon} from 'lucide-react';
import type {Session} from 'next-auth';
import {SessionProvider} from 'next-auth/react';
import {NavigationGuardProvider} from 'next-navigation-guard';
import {NuqsAdapter} from 'nuqs/adapters/next';
import type {ReactNode} from 'react';
import {client} from '~/config/client';
import {toaster} from '~/config/toaster';

export interface ProvidersProps {
  session?: Session | null;
  children: ReactNode;
}

export function Providers({session, children}: ProvidersProps) {
  return (
    <>
      <SessionProvider session={session}>
        <QueryClientProvider client={client}>
          <NuqsAdapter>
            <NavigationGuardProvider>{children}</NavigationGuardProvider>
          </NuqsAdapter>
        </QueryClientProvider>
      </SessionProvider>

      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root key={toast.id}>
            <Toast.Title>{toast.title}</Toast.Title>
            <Toast.Description>{toast.description}</Toast.Description>
            <Toast.CloseTrigger>
              <XIcon />
            </Toast.CloseTrigger>
          </Toast.Root>
        )}
      </Toaster>
    </>
  );
}
