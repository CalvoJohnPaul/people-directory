import {passwordInputAnatomy} from '@ark-ui/react/password-input';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const passwordInputRecipe = tv({
  slots: anatomyToRecipeSlots(passwordInputAnatomy, {
    control: ['flex', 'border', 'bg-white', 'ui-invalid:border-red-400'],
    input: 'grow outline-none [&::-ms-clear]:hidden [&::-ms-reveal]:hidden',
    visibilityTrigger: 'flex shrink-0 items-center justify-center',
    indicator: 'text-neutral-500',
  }),
  variants: {
    size: {
      md: {
        input: 'h-11 px-4',
        visibilityTrigger: 'icon:size-5 size-11',
      },
      lg: {
        input: 'h-12 px-4.5',
        visibilityTrigger: 'icon:size-6 size-12',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
