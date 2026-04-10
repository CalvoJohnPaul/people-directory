'use client';

import {type Assign, ark, type HTMLArkProps} from '@ark-ui/react';
import {forwardRef} from 'react';
import type {VariantProps} from 'tailwind-variants';
import {splitProps} from '~/utils/splitProps';
import {iconButtonRecipe} from './IconButton.recipe';

interface IconButtonProps
  extends Assign<HTMLArkProps<'button'>, VariantProps<typeof iconButtonRecipe>> {}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const [variantProps, localProps] = splitProps(
    props,
    ...iconButtonRecipe.variantKeys,
    'className',
  );
  const className = iconButtonRecipe(variantProps);

  return <ark.button ref={ref} type="button" className={className} {...localProps} />;
});

IconButton.displayName = 'IconButton';
