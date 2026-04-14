import {numberInputAnatomy} from '@ark-ui/react/number-input';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const numberInputRecipe = tv({
  slots: anatomyToRecipeSlots(numberInputAnatomy, {
    control: [
      'h-11',
      'grid',
      'grid-cols-[1fr_32px]',
      'grid-rows-[1fr_1fr]',
      'overflow-hidden',
      'rounded-sm',
      'border',
      'bg-white',
      'ui-invalid:border-rose-400',
    ],
    input: 'row-span-2 w-full bg-transparent px-4 outline-none',
    decrementTrigger:
      'inline-flex icon:size-5 items-center justify-center border-t border-l text-neutral-500 disabled:text-neutral-300',
    incrementTrigger:
      'inline-flex icon:size-5 items-center justify-center border-l text-neutral-500 disabled:text-neutral-300',
  }),
});
