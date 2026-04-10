'use client';

import {type Assign, ark, type HTMLArkProps} from '@ark-ui/react';
import {forwardRef} from 'react';
import type {VariantProps} from 'tailwind-variants';
import {splitProps} from '~/utils/splitProps';
import {buttonRecipe} from './Button.recipe';

interface ButtonProps extends Assign<HTMLArkProps<'button'>, VariantProps<typeof buttonRecipe>> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const [variantProps, localProps] = splitProps(props, ...buttonRecipe.variantKeys, 'className');
  const className = buttonRecipe(variantProps);

  return <ark.button ref={ref} type="button" className={className} {...localProps} />;
});

Button.displayName = 'Button';
