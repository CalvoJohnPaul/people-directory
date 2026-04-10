import {tv} from 'tailwind-variants';

export const buttonRecipe = tv({
  base: 'inline-flex items-center justify-center font-semibold disabled:opacity-50',
  variants: {
    size: {
      md: 'h-11 gap-1.5 px-4 text-base',
      lg: 'h-12 gap-2 px-4.5 text-base',
    },
    variant: {
      solid: 'bg-gray-900 text-white',
      outline: 'border text-gray-800',
    },
    fullWidth: {
      true: 'flex w-full',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
  },
});
