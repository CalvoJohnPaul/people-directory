import {tv} from 'tailwind-variants';

export const iconButtonRecipe = tv({
  base: 'inline-flex items-center justify-center rounded-sm font-semibold outline-none disabled:opacity-50',
  variants: {
    size: {
      md: 'icon:size-5 size-11',
      lg: 'icon:size-6 size-12',
    },
    variant: {
      solid: 'bg-blue-500 text-white',
      outline: 'border bg-white text-neutral-800',
      subtle:
        'bg-neutral-100/75 ui-current:bg-blue-50 ui-open:bg-blue-50 text-neutral-700 ui-current:text-blue-600 ui-open:text-blue-600 transition-colors duration-300 hover:bg-blue-50 hover:text-blue-600',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
  },
});
