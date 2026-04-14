'use client';

import {Presence} from '@ark-ui/react';
import {DownloadIcon, RefreshCcwIcon, SearchIcon, Settings2Icon} from 'lucide-react';
import {Field} from '~/components/ui/Field';
import {IconButton} from '~/components/ui/IconButton';
import {useDisclosure} from '~/hooks/useDisclosure';
import {usePeopleQuery} from '~/hooks/usePeopleQuery';
import {Filter} from './Filter';
import {PeopleProvider} from './PeopleContext';
import {PeopleList} from './PeopleList';

export function People() {
  const disclosure = useDisclosure();
  const query = usePeopleQuery();
  const people = query.data ?? [];
  const searched = false;

  return (
    <div className="flex items-start gap-4">
      <Presence
        present={disclosure.open}
        className="shrink-0 ui-closed:animate-collapse-x-out ui-open:animate-collapse-x-in overflow-hidden [--width:22rem]"
      >
        <Filter onClose={() => disclosure.setOpen(false)} className="w-(--width)" />
      </Presence>
      <div className="grow space-y-8">
        <div className="flex gap-3">
          <IconButton
            variant="outline"
            onClick={() => disclosure.setOpen((open) => !open)}
            className="relative border-amber-400"
          >
            <Settings2Icon />
            <div className="absolute -top-1.5 -right-1.5 aspect-square h-3 ui-closed:animate-fade-out ui-open:animate-fade-in rounded-full bg-amber-500 leading-none" />
          </IconButton>
          <Field.Root className="relative w-64">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-gray-500" />
            <Field.Input placeholder="Search" className="pl-10" />
          </Field.Root>
          <div className="grow" />
          <IconButton variant="outline">
            <DownloadIcon />
          </IconButton>
          <IconButton variant="outline">
            <RefreshCcwIcon />
          </IconButton>
        </div>

        <div>
          <p role="alert" aria-live="polite" className="mb-4 text-gray-500 text-sm">
            {query.isLoading
              ? 'Crunching latest data. Please wait...'
              : searched
                ? people.length <= 0
                  ? 'No matching records'
                  : `Showing ${people.length} matches`
                : 'Showing latest records'}
            .
          </p>

          <PeopleProvider value={query.data ?? []}>
            <PeopleList />
          </PeopleProvider>
        </div>
      </div>
    </div>
  );
}
