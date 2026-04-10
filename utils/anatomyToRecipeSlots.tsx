import type {AnatomyInstance} from '@ark-ui/react/anatomy';

export function anatomyToRecipeSlots<T extends string>(
  anatomy: AnatomyInstance<T>,
  baseStyles: Partial<Record<T, string | string[]>> = {},
) {
  const styles = anatomy.keys().reduce<Partial<Record<T, string | string[]>>>((acc, key) => {
    acc[key] = baseStyles[key] ?? '';
    return acc;
  }, {});

  return styles as Record<T, string | string[]>;
}
