'use client';

import {Portal} from '@ark-ui/react';
import {FolderOpenIcon, LogOutIcon, UserIcon} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Button} from '~/components/ui/Button';
import {Menu} from '~/components/ui/Menu';
import {getClient} from '~/config/client';
import {useDestroySessionMutation} from '~/hooks/useDestroySessionMutation';
import {useMeQuery} from '~/hooks/useMeQuery';

export function Navbar() {
  const query = useMeQuery();

  return (
    <header className="flex items-start p-4 lg:p-6">
      <Link href="/" draggable={false} className="block">
        <FolderOpenIcon className="size-6 text-gray-700" />
      </Link>
      <div className="grow"></div>
      <div className="flex gap-3">
        {query.isLoading ? (
          <div className="size-11 animate-pulse bg-gray-100" />
        ) : query.data == null ? (
          <>
            <Button variant="outline" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </>
        ) : (
          <Menu.Root>
            <Menu.Trigger>
              <Image
                src={query.data.image}
                alt=""
                width={250}
                height={250}
                unoptimized
                className="size-11 object-cover"
              />
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item value="profile" asChild>
                    <Link href={`/people/${query.data.id}`}>
                      <UserIcon />
                      My profile
                    </Link>
                  </Menu.Item>
                  <Logout />
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        )}
      </div>
    </header>
  );
}

function Logout() {
  const client = getClient();
  const router = useRouter();
  const mutation = useDestroySessionMutation({
    onSuccess() {
      router.push('/');
      client.invalidateQueries({
        queryKey: useMeQuery.getQueryKey(),
        refetchType: 'all',
        exact: true,
      });
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
      Log out
    </Menu.Item>
  );
}
