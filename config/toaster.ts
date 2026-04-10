import {createToaster} from '@ark-ui/react';

export const toaster = createToaster({
  max: 5,
  duration: 5000,
  placement: 'top',
  overlap: true,
});
