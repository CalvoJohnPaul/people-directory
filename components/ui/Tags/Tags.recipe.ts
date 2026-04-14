import {tv} from 'tailwind-variants';

export const tagsRecipe = tv({
  slots: {
    root: 'flex flex-wrap gap-1.5',
    item: 'inline-flex items-center gap-1 rounded-sm border bg-white px-1.5 py-1 text-xs leading-none',
    itemText: 'text-neutral-700',
    itemCloseTrigger:
      'flex icon:size-3 items-center justify-center text-neutral-400 hover:text-neutral-500',
  },
});
