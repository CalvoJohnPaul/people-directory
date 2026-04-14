import {toastAnatomy} from '@ark-ui/react/toast';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

export const toastRecipe = tv({
  slots: anatomyToRecipeSlots(toastAnatomy, {
    root: [
      'group',
      'z-(--z-index)',
      'flex',
      'h-(--height)',
      'w-[calc(100dvw-(var(--gap)*2))]',
      'lg:w-100',
      'scale-(--scale)',
      'items-center',
      'gap-2',
      'p-4',
      'opacity-(--opacity)',
      'transition-all',
      'duration-300',
      '[translate:var(--x)_var(--y)_0]',
      'rounded-md',
      'ui-type-success:bg-emerald-500',
      'ui-type-error:bg-rose-500',
      'group',
      'icon:self-start',
      'icon:size-8',
      'icon:text-white/90',
    ],
    title: 'block font-semibold text-white leading-none',
    description: 'mt-1 block text-sm text-white/90 leading-none',
    closeTrigger: [
      'absolute',
      'top-2',
      'right-2',
      'flex',
      'shrink-0',
      'items-center',
      'text-white/75',
      'icon:size-4.5!',
    ],
  }),
});
