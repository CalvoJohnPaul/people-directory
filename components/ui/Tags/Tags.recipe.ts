import {tv} from 'tailwind-variants';

export const tagsRecipe = tv({
  slots: {
    root: 'flex flex-wrap gap-1.5',
    item: 'inline-flex items-center gap-1 rounded-sm border bg-white px-2.5 py-1 text-sm',
    itemText: 'text-neutral-700',
    itemCloseTrigger:
      'flex icon:size-4 items-center justify-center text-neutral-300 hover:text-neutral-400',
  },
});
