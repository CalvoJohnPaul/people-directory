'use client';

import {Portal} from '@ark-ui/react';
import {LogOutIcon, UserIcon} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {PasscodeLockIcon} from '~/components/icons/PasscodeLockIcon';
import {Avatar} from '~/components/ui/Avatar';
import {Button} from '~/components/ui/Button';
import {IconButton} from '~/components/ui/IconButton';
import {Menu} from '~/components/ui/Menu';
import {getClient} from '~/config/client';
import {useDestroySessionMutation} from '~/hooks/useDestroySessionMutation';
import {useMeQuery} from '~/hooks/useMeQuery';

export function Navbar() {
  const query = useMeQuery();
  const pathname = usePathname();
  const index = pathname === '/';

  return (
    <header className="flex items-center border-b p-4 lg:px-6 lg:py-4">
      <Link href={index ? '/' : '/people'} className="block" draggable={false}>
        <Image
          src="/images/logo.svg"
          alt=""
          width={50}
          height={44}
          className="h-8 w-auto"
          priority
        />
      </Link>
      <div className="grow"></div>
      <div className="flex gap-3">
        {index ? (
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/people">Get started</Link>
            </Button>
          </div>
        ) : (
          <>
            {query.isLoading ? (
              <div className="size-11 animate-pulse bg-neutral-100" />
            ) : query.data == null ? (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            ) : (
              <>
                <IconButton variant="subtle" className="icon:size-7" asChild>
                  <Link href="/people">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="15" cy="6" r="3" fill="currentColor" opacity=".4" />
                      <ellipse cx="16" cy="17" fill="currentColor" opacity=".4" rx="5" ry="3" />
                      <circle cx="9.001" cy="6" r="4" fill="currentColor" />
                      <ellipse cx="9.001" cy="17.001" fill="currentColor" rx="7" ry="4" />
                    </svg>
                  </Link>
                </IconButton>

                <Menu.Root>
                  <Menu.Trigger>
                    <Avatar.Root>
                      <Avatar.Image src={query.data.image} />
                      <Avatar.Fallback />
                    </Avatar.Root>
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
                        <ChangePassword />
                        <Menu.Separator />
                        <Logout />
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              </>
            )}
          </>
        )}
      </div>
    </header>
  );
}

function ChangePassword() {
  return (
    <Menu.Item value="change-password">
      <PasscodeLockIcon />
      Change password
    </Menu.Item>
  );
}

function Logout() {
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
