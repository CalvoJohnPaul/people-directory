import {tabsAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const tabsRecipe = tv({
  slots: anatomyToRecipeSlots(tabsAnatomy, {
    list: 'relative flex w-full gap-3 p-1',
    trigger: 'relative z-1 block h-12 w-full font-medium text-gray-500 ui-selected:text-gray-800',
    indicator: 'h-(--height) w-(--width) border border-gray-200 bg-white',
    content: 'mt-8',
  }),
});
