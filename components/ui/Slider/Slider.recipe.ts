import {sliderAnatomy} from '@ark-ui/react/slider';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const sliderRecipe = tv({
  slots: anatomyToRecipeSlots(sliderAnatomy, {
    root: 'flex items-center gap-2',
    control: 'relative flex h-2 w-full grow items-center',
    track: 'h-full grow overflow-hidden rounded-full bg-neutral-200',
    range: 'h-full bg-blue-500',
    thumb: 'z-1 size-5.5 cursor-pointer rounded-full bg-white shadow-md outline-none',
    valueText: 'font-medium text-neutral-300 text-sm',
  }),
});
