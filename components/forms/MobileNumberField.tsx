import {useFieldContext} from '@ark-ui/react';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {twMerge} from 'tailwind-merge';
import {dataAttr} from '~/utils/dataAttr';
import {fieldRecipe} from '../ui/Field/Field.recipe';

export interface MobileNumberFieldProps {
  size?: 'md' | 'lg';
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  className?: string;
}

export function MobileNumberField(props: MobileNumberFieldProps) {
  const [value, setValue] = useControllableState({
    prop: props.value,
    defaultProp: props.defaultValue ?? '',
    onChange: props.onChange,
  });

  const field = useFieldContext();

  return (
    <div className={twMerge('relative', props.className)}>
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">+63</span>
      <input
        value={isValid(value) ? removeAreaCode(value) : value}
        onChange={(e) => {
          setValue(isValid(e.target.value) ? addAreaCode(e.target.value) : e.target.value);
        }}
        onKeyDown={(e) => {
          const key = e.key.toUpperCase();

          if (
            key === 'BACKSPACE' ||
            key === 'ARROWRIGHT' ||
            key === 'ARROWLEFT' ||
            key === 'ENTER' ||
            key === 'TAB'
          ) {
            return;
          }

          if (/[0-9]/.test(key)) {
            return;
          }

          if (
            /* Highlight all */
            (e.ctrlKey && key === 'A') ||
            /* Copy */
            (e.ctrlKey && key === 'C') ||
            /* Paste */
            (e.ctrlKey && key === 'V')
          ) {
            return;
          }

          e.preventDefault();
        }}
        onPaste={(e) => {
          e.preventDefault();
          if (value.length) return;
          const data = e.clipboardData.getData('text/plain').replace(/\s/g, '');
          if (!isValid(data)) return;
          setValue(addAreaCode(data));
        }}
        disabled={props.disabled ?? field?.disabled}
        required={props.required ?? field?.required}
        readOnly={props.readOnly ?? field?.readOnly}
        aria-invalid={props.invalid ?? field?.invalid}
        data-invalid={dataAttr(props.invalid ?? field?.invalid)}
        data-disabled={dataAttr(props.disabled ?? field?.disabled)}
        data-required={dataAttr(props.required ?? field?.required)}
        data-readonly={dataAttr(props.readOnly ?? field?.readOnly)}
        autoComplete="off"
        placeholder={props.placeholder || '9190000000'}
        className={fieldRecipe({size: props.size}).input({
          className: 'pl-12',
        })}
      />
    </div>
  );
}

function isValid(mobileNumber: string) {
  return /^(?:\+?63|0)?9\d{9}$/.test(mobileNumber);
}

function addAreaCode(mobileNumber: string) {
  if (mobileNumber.startsWith('9')) return `+63${mobileNumber}`;
  if (mobileNumber.startsWith('0')) return `+63${mobileNumber.slice(1)}`;
  if (mobileNumber.startsWith('63')) return `+${mobileNumber}`;
  return mobileNumber;
}

function removeAreaCode(mobileNumber: string) {
  if (mobileNumber.startsWith('0')) return mobileNumber.slice(1);
  if (mobileNumber.startsWith('63')) return mobileNumber.slice(2);
  if (mobileNumber.startsWith('+63')) return mobileNumber.slice(3);
  return mobileNumber;
}
