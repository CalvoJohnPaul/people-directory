import {qrCodeAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const qrCodeRecipe = tv({
  slots: anatomyToRecipeSlots(qrCodeAnatomy, {
    frame: 'block aspect-square w-full border',
    pattern: 'block size-full border bg-white',
  }),
});
