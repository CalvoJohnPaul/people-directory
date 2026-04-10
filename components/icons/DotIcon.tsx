import type {ComponentPropsWithRef} from 'react';

export function DotIcon(props: ComponentPropsWithRef<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 8" {...props}>
      <circle cx="4" cy="4" r="3" />
    </svg>
  );
}
