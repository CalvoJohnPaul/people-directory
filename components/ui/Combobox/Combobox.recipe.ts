import {comboboxAnatomy} from '@ark-ui/react/combobox';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const comboboxRecipe = tv({
  slots: anatomyToRecipeSlots(comboboxAnatomy, {
    control: 'flex gap-2',
    input: 'block w-full rounded-sm border ui-invalid:border-rose-400 bg-white outline-none',
    trigger:
      'flex shrink-0 ui-closed:icon:rotate-0 ui-open:icon:rotate-180 items-center justify-center rounded-sm border bg-white icon:text-neutral-500 outline-none icon:transition-transform icon:duration-300',
    clearTrigger:
      'flex shrink-0 items-center justify-center rounded-sm border bg-white icon:text-neutral-500 outline-none',
    positioner: 'z-dropdown',
    content: [
      'z-dropdown',
      'max-h-(--available-height)',
      'overflow-y-auto',
      'border',
      'bg-white',
      'p-1',
      'rounded-sm',

      'ui-placement-bottom:ui-open:animate-popover-in-bottom',
      'ui-placement-bottom-start:ui-open:animate-popover-in-bottom',
      'ui-placement-bottom-end:ui-open:animate-popover-in-bottom',
      'ui-placement-bottom:ui-closed:animate-popover-out-bottom',
      'ui-placement-bottom-start:ui-closed:animate-popover-out-bottom',
      'ui-placement-bottom-end:ui-closed:animate-popover-out-bottom',

      'ui-placement-top:ui-open:animate-popover-in-top',
      'ui-placement-top-start:ui-open:animate-popover-in-top',
      'ui-placement-top-end:ui-open:animate-popover-in-top',
      'ui-placement-top:ui-closed:animate-popover-out-top',
      'ui-placement-top-start:ui-closed:animate-popover-out-top',
      'ui-placement-top-end:ui-closed:animate-popover-out-top',

      'ui-placement-left:ui-open:animate-popover-in-left',
      'ui-placement-left-start:ui-open:animate-popover-in-left',
      'ui-placement-left-end:ui-open:animate-popover-in-left',
      'ui-placement-left:ui-closed:animate-popover-out-left',
      'ui-placement-left-start:ui-closed:animate-popover-out-left',
      'ui-placement-left-end:ui-closed:animate-popover-out-left',

      'ui-placement-right:ui-open:animate-popover-in-right',
      'ui-placement-right-start:ui-open:animate-popover-in-right',
      'ui-placement-right-end:ui-open:animate-popover-in-right',
      'ui-placement-right:ui-closed:animate-popover-out-right',
      'ui-placement-right-start:ui-closed:animate-popover-out-right',
      'ui-placement-right-end:ui-closed:animate-popover-out-right',
    ],
    item: 'flex icon:size-4 w-full cursor-pointer ui-disabled:cursor-not-allowed items-center gap-2 rounded-xs ui-highlighted:bg-neutral-50 px-3 py-2 icon:text-neutral-500 text-neutral-700 ui-disabled:opacity-65 transition-colors duration-200',
    itemText: 'grow',
    itemIndicator: 'flex size-5 text-emerald-600!',
  }),
  variants: {
    size: {
      md: {
        input: 'h-11 px-4',
        trigger: 'icon:size-5 size-11',
        clearTrigger: 'icon:size-5 size-11',
      },
      lg: {
        input: 'h-12 px-4.5',
        trigger: 'icon:size-6 size-12',
        clearTrigger: 'icon:size-6 size-12',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
