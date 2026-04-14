import {datePickerAnatomy} from '@ark-ui/react/date-picker';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const datePickerRecipe = tv({
  slots: anatomyToRecipeSlots(datePickerAnatomy, {
    control: 'flex gap-2',
    trigger:
      'flex w-full items-center justify-center rounded-sm border ui-invalid:border-rose-400 ui-open:ui-invalid:border-rose-400 bg-white text-left icon:text-neutral-500 ui-placeholder-shown:text-neutral-500',
    clearTrigger:
      'flex shrink-0 items-center justify-center rounded-sm border bg-white icon:text-neutral-500 outline-none',
    positioner: 'z-dropdown',
    content: [
      'z-dropdown',
      'max-h-(--available-height)',
      'overflow-y-auto',
      'border',
      'bg-white',
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
    table: 'border-separate border-spacing-0.5',
    tableCellTrigger: [
      'relative',
      'flex',
      'items-center',
      'justify-center',
      'text-sm',
      'text-neutral-700',
      'rounded-sm',

      'ui-view-day:size-10',
      'ui-view-month:h-9',
      'ui-view-month:w-17.5',
      'ui-view-year:h-9',
      'ui-view-year:w-17.5',

      'ui-disabled:text-neutral-400',

      'ui-selected:ui-not-disabled:font-medium',
      'ui-selected:ui-not-disabled:bg-neutral-800',
      'ui-selected:ui-not-disabled:text-white',

      'ui-today:after:absolute',
      'ui-today:after:bottom-[8%]',
      'ui-today:after:left-1/2',
      'ui-today:after:size-1',
      'ui-today:after:rounded-full',
      'ui-today:after:-translate-x-1/2',
      'ui-today:after:bg-blue-400',

      'ui-in-range:ui-not-disabled:font-medium',
      'ui-in-range:ui-not-disabled:bg-blue-50',
      'ui-in-range:ui-not-disabled:text-blue-500',

      'ui-range-start:ui-not-disabled:font-medium',
      'ui-range-start:ui-not-disabled:bg-blue-500',
      'ui-range-start:ui-not-disabled:text-white',

      'ui-range-end:ui-not-disabled:font-medium',
      'ui-range-end:ui-not-disabled:bg-blue-500',
      'ui-range-end:ui-not-disabled:text-white',
    ],
    tableHeader: 'py-3 font-medium text-neutral-600 text-sm',
    view: 'p-4',
    viewControl: 'flex items-center justify-between py-2',
    prevTrigger:
      'flex icon:size-5 size-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-50',
    nextTrigger:
      'flex icon:size-5 size-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-50',
    rangeText: 'px-1.5 py-0.5 font-semibold text-neutral-600 text-sm hover:bg-neutral-50',
  }),
  variants: {
    size: {
      md: {
        trigger: 'icon:size-5 h-11 px-4',
        clearTrigger: 'icon:size-5 size-11',
      },
      lg: {
        trigger: 'icon:size-6 h-12 px-4.5',
        clearTrigger: 'icon:size-6 size-12',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
