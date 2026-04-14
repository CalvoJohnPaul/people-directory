import {fieldAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const fieldRecipe = tv({
  slots: anatomyToRecipeSlots(fieldAnatomy, {
    label: 'mb-1.5 flex font-medium text-neutral-600 text-sm',
    input: 'block w-full rounded-sm border ui-invalid:border-rose-400 bg-white outline-none',
    textarea: 'block w-full rounded-sm border ui-invalid:border-rose-400 bg-white outline-none',
    errorText: 'mt-1 block text-rose-600 text-sm',
    requiredIndicator: 'ml-0.5 text-rose-400',
  }),
  variants: {
    size: {
      md: {
        input: 'h-11 px-4',
        textarea: 'px-4 py-2.5',
      },
      lg: {
        input: 'h-12 px-4.5',
        textarea: 'px-4.5 py-3',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
