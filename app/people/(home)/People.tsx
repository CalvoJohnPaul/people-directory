'use client';

import {Portal, Presence} from '@ark-ui/react';
import {useIsFetching} from '@tanstack/react-query';
import {isNil, omit, omitBy} from 'es-toolkit';
import {size} from 'es-toolkit/compat';
import {RefreshCcwIcon, Settings2Icon, XIcon} from 'lucide-react';
import {useReducer, useState} from 'react';
import {cx} from 'tailwind-variants';
import {useTimeout} from 'usehooks-ts';
import {SearchField} from '~/components/forms/SearchField';
import {IconButton} from '~/components/ui/IconButton';
import {Swap} from '~/components/ui/Swap';
import {Tooltip} from '~/components/ui/Tooltip';
import {getClient} from '~/config/client';
import {useDisclosure} from '~/hooks/useDisclosure';
import {usePeopleQuery} from '~/hooks/usePeopleQuery';
import type {PeopleInput} from '~/types/Person';
import {ExportPeople} from './ExportPeople';
import {Filter, type FilterValue} from './Filter';
import {PeopleProvider} from './PeopleContext';
import {PeopleList} from './PeopleList';

interface PageState extends FilterValue {
  q?: string;
}

export function People() {
  const [state, setState] = useReducer(
    (prev: PageState, next: Partial<PageState>) => ({
      ...prev,
      ...next,
    }),
    {},
  );

  const disclosure = useDisclosure();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const dateOfBirth__from = state.age?.to
    ? new Date(currentYear - state.age.to, 0, 1, 0, 0, 0, 0)
    : null;
  const dateOfBirth__to = state.age?.from
    ? new Date(currentYear - state.age.from, 11, 31, 23, 59, 59, 999)
    : null;

  const input: PeopleInput = omitBy(
    {
      q: state.q,
      id: state.id,
      gender: state.gender,
      dateOfBirth__from,
      dateOfBirth__to,
      createdAt__from: state.createdAt?.from,
      createdAt__to: state.createdAt?.to,
    },
    (v) => isNil(v) || v === '' || (Array.isArray(v) && v.length <= 0),
  );

  const query = usePeopleQuery(input);
  const people = query.data ?? [];
  const filtered = size(omit(input, ['q'])) > 0;
  const searched = size(input) > 0;

  return (
    <PeopleProvider value={query.data ?? []}>
      <div className="flex items-start gap-4">
        <Presence
          present={disclosure.open}
          className="shrink-0 ui-closed:animate-collapse-x-out ui-open:animate-collapse-x-in overflow-hidden [--width:22rem]"
        >
          <Filter value={state} onChange={setState} className="w-(--width)" />
        </Presence>
        <div className="grow space-y-8">
          <div className="flex gap-3">
            <IconButton
              variant="outline"
              onClick={() => disclosure.setOpen((open) => !open)}
              className={cx(
                'relative transition-colors duration-300',
                filtered && 'border-amber-400',
              )}
            >
              <Swap.Root swap={disclosure.open}>
                <Swap.Indicator type="off">
                  <Settings2Icon />
                </Swap.Indicator>
                <Swap.Indicator type="on">
                  <XIcon />
                </Swap.Indicator>
              </Swap.Root>
              <Presence
                present={filtered}
                className="absolute -top-1.5 -right-1.5 aspect-square h-3 ui-closed:animate-fade-out ui-open:animate-fade-in rounded-full bg-amber-500 leading-none"
              />
            </IconButton>
            <SearchField value={state.q} onChange={(q) => setState({q})} className="w-64" />
            <div className="grow" />
            <ExportPeople />
            <Reload />
          </div>

          <div>
            <p role="alert" aria-live="polite" className="mb-4 text-neutral-500 text-sm">
              {query.isLoading
                ? 'Crunching latest data. Please wait...'
                : searched
                  ? people.length <= 0
                    ? 'No matching records'
                    : `Showing ${people.length} matches`
                  : 'Showing latest records'}
              .
            </p>

            <PeopleList />
          </div>
        </div>
      </div>
    </PeopleProvider>
  );
}

function Reload() {
  const [loading, setLoading] = useState(false);

  const client = getClient();
  const count = useIsFetching({
    queryKey: usePeopleQuery.getQueryKey(),
    exact: false,
    type: 'all',
  });

  useTimeout(() => setLoading(true), count > 0 ? 0 : null);
  useTimeout(() => setLoading(false), loading ? 1000 : null);

  return (
    <Tooltip.Root disabled={loading}>
      <Tooltip.Trigger asChild>
        <IconButton
          variant="outline"
          onClick={() => {
            client.invalidateQueries({
              queryKey: usePeopleQuery.getQueryKey(),
              exact: false,
              type: 'all',
            });
          }}
          disabled={loading}
        >
          <RefreshCcwIcon
            className="ui-loading:animate-spin"
            data-loading={loading ? '' : undefined}
          />
        </IconButton>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            Reload
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
