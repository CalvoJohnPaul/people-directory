import {qrCodeAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const qrCodeRecipe = tv({
  slots: anatomyToRecipeSlots(qrCodeAnatomy, {
    frame: 'block aspect-square w-full rounded-sm border',
    pattern: 'block size-full border bg-white',
  }),
});
