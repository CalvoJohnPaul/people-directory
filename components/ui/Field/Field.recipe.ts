import {fieldAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/types/anatomyToRecipeSlots';

export const fieldRecipe = tv({
  slots: anatomyToRecipeSlots(fieldAnatomy),
});
