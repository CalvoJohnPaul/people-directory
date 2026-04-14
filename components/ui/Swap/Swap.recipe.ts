import {swapAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const swapRecipe = tv({
  slots: anatomyToRecipeSlots(swapAnatomy, {
    indicator: 'ui-closed:animate-scale-out ui-open:animate-scale-in',
  }),
});
