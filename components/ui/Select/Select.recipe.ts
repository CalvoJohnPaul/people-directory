import {selectAnatomy} from '@ark-ui/react/select';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const selectRecipe = tv({
  slots: anatomyToRecipeSlots(selectAnatomy, {
    control: 'flex gap-2',
    trigger:
      'flex grow items-center border ui-invalid:border-red-400 bg-white ui-placeholder-shown:text-gray-500',
    valueText: 'grow text-left',
    indicator:
      'ui-closed:rotate-0 ui-open:rotate-180 text-gray-500 transition-transform duration-300',
    positioner: 'z-dropdown',
    content: [
      'z-dropdown',
      'max-h-(--available-height)',
      'overflow-y-auto',
      'border',
      'bg-white',
      'p-1',

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
    item: 'flex icon:size-4 w-full cursor-pointer ui-disabled:cursor-not-allowed items-center gap-2 ui-highlighted:bg-gray-50 px-3 py-2 icon:text-gray-500 text-gray-700 ui-disabled:opacity-65 transition-colors duration-200',
    itemText: 'grow',
    itemIndicator: 'flex size-5 text-green-600!',
  }),
  variants: {
    size: {
      md: {
        trigger: 'h-11 px-4',
        indicator: 'size-5',
      },
      lg: {
        trigger: 'h-12 px-4.5',
        indicator: 'size-6',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
