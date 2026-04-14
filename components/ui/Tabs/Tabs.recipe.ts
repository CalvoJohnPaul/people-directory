import {tabsAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const tabsRecipe = tv({
  slots: anatomyToRecipeSlots(tabsAnatomy, {
    list: 'relative flex w-full gap-3 rounded-sm bg-neutral-50 p-1.5',
    trigger:
      'relative z-1 block h-11 w-full font-medium text-neutral-500 ui-selected:text-neutral-800',
    indicator: 'h-(--height) w-(--width) rounded-sm border border-neutral-200 bg-white',
    content: 'mt-8',
  }),
});
