import {LogOutIcon} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {Menu} from '~/components/ui/Menu';
import {getClient} from '~/config/client';
import {useDestroySessionMutation} from '~/hooks/useDestroySessionMutation';
import {useMeQuery} from '~/hooks/useMeQuery';

export function Logout() {
  const client = getClient();
  const router = useRouter();
  const mutation = useDestroySessionMutation({
    onSuccess() {
      router.push('/people');
      client.invalidateQueries({queryKey: useMeQuery.getQueryKey()});
      setTimeout(() => client.clear(), 1);
    },
  });

  return (
    <Menu.Item
      value="logout"
      onSelect={() => {
        mutation.mutate();
      }}
      disabled={mutation.isPending}
    >
      <LogOutIcon />
      Sign out
    </Menu.Item>
  );
}
