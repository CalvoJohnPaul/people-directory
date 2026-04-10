import {createToaster} from '@ark-ui/react';

export const toaster = createToaster({
  max: 5,
  duration: Infinity,
  placement: 'top',
  overlap: true,
});
