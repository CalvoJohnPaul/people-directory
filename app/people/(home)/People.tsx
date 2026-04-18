'use client';

import {Dialog, Portal, Presence} from '@ark-ui/react';
import {useIsFetching} from '@tanstack/react-query';
import {isNil, omit, omitBy} from 'es-toolkit';
import {size} from 'es-toolkit/compat';
import {RefreshCcwIcon, Settings2Icon, XIcon} from 'lucide-react';
import {useMemo, useReducer, useState} from 'react';
import {cx} from 'tailwind-variants';
import {useMediaQuery, useTimeout} from 'usehooks-ts';
import {SearchField} from '~/components/forms/SearchField';
import {SpinnerIcon} from '~/components/icons/SpinnerIcon';
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

const currentDate = new Date();
const currentYear = currentDate.getFullYear();

export function People() {
  const [state, setState] = useReducer(
    (prev: PageState, next: Partial<PageState>) => ({
      ...prev,
      ...next,
    }),
    {},
  );

  const disclosure = useDisclosure();

  const dateOfBirth__from = useMemo(
    () => (state.age?.to ? new Date(currentYear - state.age.to, 0, 1, 0, 0, 0, 0) : null),
    [state.age?.to],
  );

  const dateOfBirth__to = useMemo(
    () =>
      state.age?.from ? new Date(currentYear - state.age.from, 11, 31, 23, 59, 59, 999) : null,
    [state.age?.from],
  );

  const id = useMemo(() => {
    const l: number[] = [];

    if (state.id?.length) {
      l.push(...state.id);
    }

    if (state.image?.length) {
      l.push(...state.image);
    }

    if (state.qrCode) {
      l.push(state.qrCode);
    }

    return l.length > 0 ? l : null;
  }, [state.id, state.image, state.qrCode]);

  const input: PeopleInput = useMemo(
    () =>
      omitBy(
        {
          q: state.q,
          id,
          gender: state.gender,
          dateOfBirth__from,
          dateOfBirth__to,
          createdAt__from: state.createdAt?.from,
          createdAt__to: state.createdAt?.to,
        },
        (v) => isNil(v) || v === '' || (Array.isArray(v) && v.length <= 0),
      ),
    [
      id,
      state.q,
      state.gender,
      dateOfBirth__from,
      dateOfBirth__to,
      state.createdAt?.from,
      state.createdAt?.to,
    ],
  );

  const query = usePeopleQuery(input);
  const people = query.data ?? [];
  const filtered = useMemo(() => size(omit(input, ['q'])) > 0, [input]);
  const searched = useMemo(() => size(input) > 0, [input]);
  const desktop = useMediaQuery('(min-width: 1024px)');

  return (
    <PeopleProvider value={query.data ?? []}>
      <div className="flex items-start gap-4">
        <Presence
          present={desktop && disclosure.open}
          unmountOnExit
          className="hidden shrink-0 ui-closed:animate-collapse-x-out ui-open:animate-collapse-x-in overflow-hidden [--width:22rem] lg:block"
        >
          <Filter value={state} onChange={setState} className="w-(--width) rounded-sm border" />
        </Presence>
        <div className="grow space-y-8">
          <div className="flex gap-3">
            <IconButton
              variant="outline"
              onClick={() => disclosure.setOpen((open) => !open)}
              className={cx(
                'relative shrink-0 transition-colors duration-300',
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
            <SearchField value={state.q} onChange={(q) => setState({q})} className="lg:w-64" />
            <div className="hidden grow lg:block" />
            <ExportPeople />
            <Reload />
          </div>

          <div>
            {query.isLoading ? (
              <p className="mb-4 text-neutral-500 text-sm">Crunching latest data. Please wait...</p>
            ) : searched ? (
              people.length > 1 ? (
                <p className="mb-4 text-neutral-500 text-sm">Showing {people.length} matches</p>
              ) : people.length > 0 ? (
                <p className="mb-4 text-neutral-500 text-sm">Showing {people.length} match</p>
              ) : null
            ) : people.length > 0 ? (
              <p className="mb-4 text-neutral-500 text-sm">Showing latest records</p>
            ) : null}

            {query.isLoading && <SpinnerIcon className="block size-6 text-blue-500" />}
            {!query.isLoading && people.length > 0 && <PeopleList />}
            {!query.isLoading && people.length <= 0 && <Empty />}
          </div>
        </div>
      </div>
      <Dialog.Root
        open={!desktop && disclosure.open}
        onOpenChange={(details) => disclosure.setOpen(details.open)}
        lazyMount
        unmountOnExit
        closeOnEscape
        closeOnInteractOutside
      >
        <Dialog.Positioner>
          <Dialog.Content className="fixed top-16 left-0 z-drawer h-[calc(100%---spacing(16))] w-full ui-closed:animate-drawer-out-bottom ui-open:animate-drawer-in-bottom bg-white">
            <Filter
              onClose={() => disclosure.setOpen(false)}
              className="size-full overflow-y-auto"
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </PeopleProvider>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center py-12">
      <h2 className="font-semibold text-neutral-700 text-xl">No records to show</h2>
      <p className="text-neutral-500 text-sm">Try adjusting your filters or check back later.</p>
    </div>
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
          className="shrink-0"
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
