import {fieldAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const fieldRecipe = tv({
  slots: anatomyToRecipeSlots(fieldAnatomy, {
    label: 'mb-1.5 flex font-semibold text-gray-600 text-sm',
    input: 'block w-full rounded-sm bg-white outline-none',
    errorText: 'mt-1 block text-rose-600 text-sm',
    requiredIndicator: 'ml-0.5 text-rose-400',
  }),
  variants: {
    size: {
      md: {
        input: 'h-11 px-4',
      },
      lg: {
        input: 'h-12 px-4.5',
      },
    },
    variant: {
      outline: {
        input: 'border ui-invalid:border-rose-400',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'outline',
  },
});
