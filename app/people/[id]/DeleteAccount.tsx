import {Portal} from '@ark-ui/react';
import {Trash2Icon} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';
import {getClient} from '~/config/client';
import {toaster} from '~/config/toaster';
import {useDeleteAccountMutation} from '~/hooks/useDeleteAccountMutation';
import {useMeQuery} from '~/hooks/useMeQuery';
import {usePersonContext} from './ProfileContext';

export function DeleteAccount() {
  const client = getClient();
  const router = useRouter();
  const person = usePersonContext();
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
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <IconButton
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => {
            mutation.mutate(person.id);
          }}
        >
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
  );
}
