import {avatarAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const avatarRecipe = tv({
  slots: anatomyToRecipeSlots(avatarAnatomy, {
    root: 'relative flex aspect-square items-center justify-center bg-neutral-50',
    image: 'size-full rounded-sm object-cover',
    fallback: 'flex icon:size-1/2 size-full items-center justify-center rounded-sm bg-gray-50',
  }),
  variants: {
    size: {
      sm: {root: 'w-10'},
      md: {root: 'w-11'},
      lg: {root: 'w-12'},
    },
    round: {
      true: {
        image: 'rounded-full',
        fallback: 'rounded-full',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
