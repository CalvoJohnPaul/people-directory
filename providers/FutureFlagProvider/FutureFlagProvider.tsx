'use client';

import {Portal, Presence} from '@ark-ui/react';
import {invariant, noop} from 'es-toolkit';
import {XIcon} from 'lucide-react';
import {createParser, useQueryState} from 'nuqs';
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
} from 'react';
import {useLocalStorage, useTimeout} from 'usehooks-ts';

export const FeatureFlagContext = createContext<[boolean, Dispatch<SetStateAction<boolean>>]>([
  false,
  noop,
]);

const queryParser = createParser<boolean>({
  parse: (v) => (v === 'true' ? true : v === 'false' ? false : null),
  serialize: (v) => (v === true ? 'true' : v === false ? 'false' : ''),
});

export function FutureFlagProvider(props: PropsWithChildren) {
  const [queryValue, setQueryValue] = useQueryState('future', queryParser);
  const [storageValue, setStorageValue] = useLocalStorage<boolean>('future', false, {
    serializer: (value) => (value ? 'true' : 'false'),
    deserializer: (value) => value === 'true',
    initializeWithValue: false,
  });

  const setValue: Dispatch<SetStateAction<boolean>> = (value) => {
    setQueryValue(null);
    setStorageValue(value);
  };

  useTimeout(
    () => {
      setQueryValue(null);
      setStorageValue(true);
    },
    queryValue === true && storageValue !== true ? 1 : null,
  );

  useTimeout(
    () => {
      setQueryValue(null);
      setStorageValue(false);
    },
    queryValue === false && storageValue !== false ? 1 : null,
  );

  return (
    <FeatureFlagContext value={[storageValue, setValue]}>
      {props.children}
      <Portal>
        <Presence
          present={storageValue}
          className="fixed bottom-6 left-1/2 z-toast flex -translate-x-1/2 ui-closed:animate-fade-out ui-open:animate-fade-in items-center gap-1 bg-black/60 px-1.5 py-0.5 text-white text-xs backdrop-blur-sm"
        >
          Experiment features are enabled
          <button type="button" tabIndex={-1} onClick={() => setValue(false)}>
            <XIcon className="size-3" />
          </button>
        </Presence>
      </Portal>
    </FeatureFlagContext>
  );
}

export function useFutureFlag() {
  const context = useContext(FeatureFlagContext);
  invariant(context, "'useFutureFlag' must be used within a 'FutureFlagProvider'");
  return context;
}
