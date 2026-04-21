import {dialogAnatomy} from '@ark-ui/react/dialog';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '~/utils/anatomyToRecipeSlots';

const anatomy = dialogAnatomy.extendWith('header', 'body', 'footer');

export const alertDialogRecipe = tv({
  slots: anatomyToRecipeSlots(anatomy, {
    backdrop:
      'fixed inset-0 z-backdrop ui-closed:animate-backdrop-out ui-open:animate-backdrop-in bg-black/50 backdrop-blur-xs',
    positioner: 'fixed inset-0 z-dialog overflow-y-auto lg:flex lg:items-center lg:justify-center',
    content: [
      'z-dialog',
      'bg-white',
      'absolute',
      'bottom-0',
      'h-auto',
      'w-full',
      'flex',
      'flex-col',
      'lg:relative',
      'lg:max-w-120',
      'lg:min-w-120',
      'lg:mx-auto',
      'lg:rounded-sm',
      'lg:border',
      'ui-open:animate-dialog-in',
      'ui-closed:animate-dialog-out',
    ],
    header: 'relative p-6 pb-8',
    body: 'relative grow overflow-y-auto px-6 pb-8',
    footer: 'relative flex justify-end gap-3 border-t px-6 py-5',
    title: 'block font-semibold text-lg leading-normal',
    description: 'block text-neutral-600 text-sm leading-tight',
    closeTrigger:
      'absolute top-3 right-3 flex icon:size-5 items-center justify-center text-neutral-300 hover:text-neutral-500',
  }),
});
