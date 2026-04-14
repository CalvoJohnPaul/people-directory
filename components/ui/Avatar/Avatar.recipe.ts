import {avatarAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const avatarRecipe = tv({
  slots: anatomyToRecipeSlots(avatarAnatomy, {
    root: 'relative flex aspect-square items-center justify-center bg-neutral-50',
    image: 'size-full rounded-sm object-cover',
  }),
  variants: {
    size: {
      sm: {root: 'w-10'},
      md: {root: 'w-11'},
      lg: {root: 'w-12'},
    },
    round: {
      true: {root: 'rounded-full'},
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
