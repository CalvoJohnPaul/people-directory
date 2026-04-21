import {Portal} from '@ark-ui/react';
import {Trash2Icon} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {AlertDialog} from '~/components/ui/AlertDialog';
import {Button} from '~/components/ui/Button';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';
import {getClient} from '~/config/client';
import {toaster} from '~/config/toaster';
import {useDeleteAccountMutation} from '~/hooks/useDeleteAccountMutation';
import {useDisclosure} from '~/hooks/useDisclosure';
import {useMeQuery} from '~/hooks/useMeQuery';
import {usePersonContext} from './ProfileContext';

export function DeleteAccount() {
  const client = getClient();
  const router = useRouter();
  const person = usePersonContext();
  const disclosure = useDisclosure();
  const query = useMeQuery();
  const mutation = useDeleteAccountMutation({
    onSuccess: () => {
      router.push('/people');
      client.setQueryData(useMeQuery.getQueryKey(), null);
      toaster.success({description: 'Your account has been deleted'});
      setTimeout(() => client.clear(), 1);
    },
    onError: (error) => {
      toaster.error({
        description: error.message,
      });
    },
  });

  if (query.data?.id !== person.id) return null;

  return (
    <AlertDialog.Root
      open={disclosure.open}
      onOpenChange={(details) => disclosure.setOpen(details.open)}
    >
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <IconButton variant="outline" onClick={() => disclosure.setOpen(true)}>
            <Trash2Icon />
          </IconButton>
        </Tooltip.Trigger>
        <Portal>
          <Tooltip.Positioner>
            <Tooltip.Content>
              <Tooltip.Arrow>
                <Tooltip.ArrowTip />
              </Tooltip.Arrow>
              Delete account
            </Tooltip.Content>
          </Tooltip.Positioner>
        </Portal>
      </Tooltip.Root>
      <Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Positioner>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>Are you sure you want to delete your account?</AlertDialog.Title>
              <AlertDialog.Description>
                This action cannot be undone. All your data will be permanently deleted.
              </AlertDialog.Description>
              <AlertDialog.CloseTrigger />
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <Button variant="outline" onClick={() => disclosure.setOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={mutation.isPending}
                onClick={() => {
                  mutation.mutate(person.id);
                }}
              >
                Proceed
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Positioner>
      </Portal>
    </AlertDialog.Root>
  );
}
