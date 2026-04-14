'use client';

import {Presence, useFieldContext} from '@ark-ui/react';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {XIcon} from 'lucide-react';
import Image from 'next/image';
import {type ComponentPropsWithRef, useRef} from 'react';
import {twMerge} from 'tailwind-merge';
import {dataAttr} from '~/utils/dataAttr';

export interface AvatarFieldProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  defaultValue?: string | null;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  onError?: (msg: string) => void;
}

export function AvatarField(props: AvatarFieldProps) {
  const field = useFieldContext();

  const [value, setValue] = useControllableState({
    prop: props.value,
    onChange: props.onChange,
    defaultProp: props.defaultValue ?? null,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={props.className}>
      <div className="relative size-32">
        <button
          id={field.ids.control}
          type="button"
          onClick={() => {
            if (field?.readOnly || field?.disabled || props.readOnly || props.disabled) return;
            inputRef.current?.click();
          }}
          className={twMerge(
            'relative',
            'grid',
            'size-full',
            'place-items-center',
            'border',
            'ui-invalid:border-rose-400',
            'bg-white',
          )}
          disabled={field?.disabled || props.disabled}
          aria-invalid={field?.invalid || props.invalid}
          data-readonly={dataAttr(field?.readOnly || props.readOnly)}
          data-required={dataAttr(field?.required || props.required)}
          data-invalid={dataAttr(field?.invalid || props.invalid)}
          data-disabled={dataAttr(field?.disabled || props.disabled)}
          aria-label="Upload avatar"
          aria-describedby={field?.ariaDescribedby}
        >
          {value ? (
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={value}
                alt=""
                width={200}
                height={200}
                className="size-full object-cover object-center"
              />
            </div>
          ) : (
            <PlaceholderIcon className="size-16" />
          )}
        </button>
        <Presence
          present={
            value != null &&
            !field?.readOnly &&
            !props.readOnly &&
            !field?.disabled &&
            !props.disabled
          }
          asChild
          className="ui-closed:animate-fade-out ui-open:animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setValue(null)}
            tabIndex={-1}
            className="absolute top-0 -right-9 size-7 place-items-center self-end border"
          >
            <XIcon className="size-4.5 text-neutral-700" />
          </button>
        </Presence>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpg, image/webp, image/jpeg"
        className="hidden size-0"
        onChange={(evt) => {
          const file = evt.target.files?.[0];

          if (!file) return;

          const error = validateFile(file);

          if (error) {
            props.onError?.(error);
            return;
          }

          /* TODO: upload */

          const img = URL.createObjectURL(file);
          setValue(img);
        }}
        aria-hidden
      />
    </div>
  );
}

function validateFile(file: File) {
  const maxSize = 1 * 1024 * 1024;

  if (file.size > maxSize) {
    return 'File size must be less than 1MB';
  }

  const validTypes = ['image/png', 'image/jpg', 'image/webp', 'image/jpeg'];

  if (!validTypes.includes(file.type)) {
    return 'Invalid file type. Only PNG, JPG and WEBP are allowed';
  }

  return null;
}

function PlaceholderIcon(props: ComponentPropsWithRef<'svg'>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 76 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        <path
          d="M69.732 53.2628L59.8204 30.0827C58.0154 25.8394 55.3237 23.4327 52.2521 23.2744C49.2121 23.116 46.2671 25.2377 44.0187 29.291L38.002 40.0894C36.7354 42.3694 34.9304 43.7311 32.967 43.8894C30.9721 44.0794 28.9771 43.0344 27.3621 40.9761L26.6655 40.0894C24.4171 37.2711 21.6305 35.9094 18.7805 36.1944C15.9305 36.4794 13.4921 38.4428 11.8771 41.6411L6.39881 52.5661C4.43548 56.5244 4.62548 61.1161 6.93715 64.8528C9.24881 68.5894 13.2705 70.8378 17.6721 70.8378H58.0787C62.322 70.8378 66.2804 68.7161 68.6237 65.1694C71.0304 61.6228 71.4104 57.1578 69.732 53.2628Z"
          fill="currentColor"
          opacity="0.375"
        />
        <path
          d="M22.0715 26.5375C27.9828 26.5375 32.7747 21.7455 32.7747 15.8342C32.7747 9.92288 27.9828 5.13086 22.0715 5.13086C16.1602 5.13086 11.3682 9.92288 11.3682 15.8342C11.3682 21.7455 16.1602 26.5375 22.0715 26.5375Z"
          fill="currentColor"
          opacity="0.525"
        />
      </g>
    </svg>
  );
}
