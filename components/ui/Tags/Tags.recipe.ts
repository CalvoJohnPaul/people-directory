import {tv} from 'tailwind-variants';

export const tagsRecipe = tv({
  slots: {
    root: 'flex flex-wrap gap-1.5',
    item: 'inline-flex items-center gap-0.5 border bg-white px-2.5 py-1 font-medium text-sm',
    itemText: 'text-gray-600',
    itemCloseTrigger: 'flex icon:size-4 h-2.5 items-center justify-center pl-1 icon:text-gray-300',
  },
});
