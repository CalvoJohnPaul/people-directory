import {pinInputAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const pinInputRecipe = tv({
  slots: anatomyToRecipeSlots(pinInputAnatomy, {
    control: 'grid grid-cols-6 justify-between gap-3',
    input:
      'aspect-square w-full border ui-invalid:border-red-400 text-center font-bold text-xl outline-none',
  }),
});
