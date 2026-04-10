import {checkboxAnatomy} from '@ark-ui/react/checkbox';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const checkboxRecipe = tv({
  slots: anatomyToRecipeSlots(checkboxAnatomy, {
    root: 'flex items-center gap-2',
    control:
      'flex shrink-0 cursor-pointer ui-disabled:cursor-not-allowed ui-readonly:cursor-default items-center justify-center border ui-checked:border-gray-900 bg-white ui-checked:bg-gray-900! ui-disabled:opacity-50',
    indicator: 'text-white',
    label: 'text-gray-600',
  }),
  variants: {
    size: {
      sm: {
        control: 'size-4',
        indicator: 'size-3',
      },
      md: {
        control: 'size-5',
        indicator: 'size-4',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
