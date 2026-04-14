'use client';

import {Portal, Presence} from '@ark-ui/react';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {omit} from 'es-toolkit';
import {DownloadIcon, RefreshCcwIcon, SearchIcon, Settings2Icon, XIcon} from 'lucide-react';
import {useReducer, useState} from 'react';
import {useDebouncedCallback} from 'use-debounce';
import {Field} from '~/components/ui/Field';
import {IconButton} from '~/components/ui/IconButton';
import {Swap} from '~/components/ui/Swap';
import {Tooltip} from '~/components/ui/Tooltip';
import {useDisclosure} from '~/hooks/useDisclosure';
import {usePeopleQuery} from '~/hooks/usePeopleQuery';
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
  const query = usePeopleQuery();
  const people = query.data ?? [];
  const searched = true;

  return (
    <div className="flex items-start gap-4">
      <Presence
        present={disclosure.open}
        className="shrink-0 ui-closed:animate-collapse-x-out ui-open:animate-collapse-x-in overflow-hidden [--width:22rem]"
      >
        <Filter value={omit(state, ['q'])} onChange={setState} className="w-(--width)" />
      </Presence>
      <div className="grow space-y-8">
        <div className="flex gap-3">
          <IconButton
            variant="outline"
            onClick={() => disclosure.setOpen((open) => !open)}
            className="relative border-amber-400"
          >
            <Swap.Root swap={disclosure.open}>
              <Swap.Indicator type="off">
                <Settings2Icon />
              </Swap.Indicator>
              <Swap.Indicator type="on">
                <XIcon />
              </Swap.Indicator>
            </Swap.Root>

            <div className="absolute -top-1.5 -right-1.5 aspect-square h-3 ui-closed:animate-fade-out ui-open:animate-fade-in rounded-full bg-amber-500 leading-none" />
          </IconButton>
          <Search value={state.q} onChange={(q) => setState({q})} />
          <div className="grow" />
          <Export />
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

          <PeopleProvider value={query.data ?? []}>
            <PeopleList />
          </PeopleProvider>
        </div>
      </div>
    </div>
  );
}

function Search(props: {
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
}) {
  const [value, setValue] = useControllableState({
    prop: props.value,
    defaultProp: props.defaultValue ?? '',
    onChange: props.onChange,
  });

  const [value__internal, setValue__internal] = useState(value);

  const setValue__debounced = useDebouncedCallback(setValue, 500);

  return (
    <Field.Root className="relative w-64">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-neutral-500" />
      <Field.Input
        value={value__internal}
        onChange={(e) => {
          setValue__internal(e.target.value);
          setValue__debounced(e.target.value);
        }}
        autoComplete="off"
        placeholder="Search"
        className="pl-10"
      />
    </Field.Root>
  );
}

function Export() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <IconButton variant="outline">
          <DownloadIcon />
        </IconButton>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            Export
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}

function Reload() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <IconButton variant="outline">
          <RefreshCcwIcon />
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
