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
      outline: 'border text-gray-800',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
  },
});
