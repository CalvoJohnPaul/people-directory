import {useControllableState} from '@radix-ui/react-use-controllable-state';
import type {ComponentPropsWithoutRef, Dispatch, SetStateAction} from 'react';

export interface UseDisclosureProps {
  open?: boolean;
  defaultOpen?: boolean;
  onChange?: (open: boolean) => void;
}

export interface UseDisclosureReturn {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  getButtonProps: () => ComponentPropsWithoutRef<'button'>;
}

export function useDisclosure(props?: UseDisclosureProps): UseDisclosureReturn {
  const [open, setOpen] = useControllableState({
    prop: props?.open,
    onChange: props?.onChange,
    defaultProp: props?.defaultOpen ?? false,
  });

  const getButtonProps = (): ComponentPropsWithoutRef<'button'> => {
    const attrs: Record<string, string | boolean> = {
      'aria-expanded': open,
      'aria-label': 'Toggle disclosure',
      'data-state': open ? 'open' : 'closed',
    };

    return {
      type: 'button',
      onClick() {
        setOpen((prev) => !prev);
      },
      ...attrs,
    };
  };

  return {
    open,
    setOpen,
    getButtonProps,
  };
}
