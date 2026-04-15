'use client';

import {Toaster} from '@ark-ui/react';
import {QueryClientProvider} from '@tanstack/react-query';
import {XIcon} from 'lucide-react';
import {NavigationGuardProvider} from 'next-navigation-guard';
import {NuqsAdapter} from 'nuqs/adapters/next';
import type {ReactNode} from 'react';
import {HappyFaceIcon} from '~/components/icons/HappyFace';
import {SadFaceIcon} from '~/components/icons/SadFace';
import {Toast} from '~/components/ui/Toast';
import {getClient} from '~/config/client';
import {toaster} from '~/config/toaster';

export interface ProvidersProps {
  children: ReactNode;
}

export function Providers({children}: ProvidersProps) {
  const client = getClient();

  return (
    <>
      <QueryClientProvider client={client}>
        <NuqsAdapter>
          <NavigationGuardProvider>{children}</NavigationGuardProvider>
        </NuqsAdapter>
      </QueryClientProvider>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root key={toast.id}>
            {toast.type === 'success' && <HappyFaceIcon />}
            {toast.type === 'error' && <SadFaceIcon />}

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
