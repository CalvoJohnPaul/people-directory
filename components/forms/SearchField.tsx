import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {SearchIcon} from 'lucide-react';
import {useState} from 'react';
import {cx} from 'tailwind-variants';
import {useDebouncedCallback} from 'use-debounce';
import {Field} from '../ui/Field';

export interface SearchFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export function SearchField(props: SearchFieldProps) {
  const [value, setValue] = useControllableState({
    prop: props.value,
    defaultProp: props.defaultValue ?? '',
    onChange: props.onChange,
  });

  const [value__internal, setValue__internal] = useState(value);

  const setValue__debounced = useDebouncedCallback(setValue, 350);

  return (
    <Field.Root className={cx('relative', props.className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-neutral-500" />
      <Field.Input
        value={value__internal}
        onChange={(e) => {
          setValue__internal(e.target.value);
          setValue__debounced(e.target.value);
        }}
        autoComplete="off"
        placeholder={props.placeholder ?? 'Search'}
        className="pl-10"
      />
    </Field.Root>
  );
}
