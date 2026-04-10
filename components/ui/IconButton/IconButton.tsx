'use client';

import {ark, type HTMLArkProps} from '@ark-ui/react';
import {forwardRef} from 'react';

export const Button = forwardRef<HTMLButtonElement, HTMLArkProps<'button'>>((props, ref) => {
  return <ark.button ref={ref} type="button" {...props} />;
});

Button.displayName = 'Button';
