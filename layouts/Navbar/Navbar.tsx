'use client';

import {Portal} from '@ark-ui/react';
import {SettingsIcon, UserIcon} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {HomeIcon} from '~/components/icons/HomeIcon';
import {UsersIcon} from '~/components/icons/UsersIcon';
import {Avatar} from '~/components/ui/Avatar';
import {Button} from '~/components/ui/Button';
import {IconButton} from '~/components/ui/IconButton';
import {Menu} from '~/components/ui/Menu';
import {useMeQuery} from '~/hooks/useMeQuery';
import {ChangePassword} from './ChangePassword';
import {Logout} from './Logout';

export function Navbar() {
  return (
    <header className="flex h-16 items-center border-b px-4 lg:px-6">
      <Link href="/" className="block" aria-label="Home">
        <Image
          src="/images/logo.svg"
          alt=""
          width={50}
          height={44}
          draggable={false}
          priority
          className="h-8 w-auto"
        />
      </Link>
      <div className="grow" />
      <Links />
    </header>
  );
}

function Links() {
  const query = useMeQuery();
  const pathname = usePathname();

  if (query.isLoading) {
    return null;
  }

  if (query.data == null) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Register</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <IconButton
        variant="subtle"
        aria-label="Home"
        data-current={pathname === '/' ? '' : undefined}
        asChild
      >
        <Link href="/">
          <HomeIcon />
        </Link>
      </IconButton>
      <IconButton
        variant="subtle"
        aria-label="People"
        data-current={pathname === '/people' ? '' : undefined}
        asChild
      >
        <Link href="/people">
          <UsersIcon />
        </Link>
      </IconButton>
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton variant="subtle" aria-label="Settings">
            <SettingsIcon />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content className="w-64 min-w-64 max-w-64">
              <div className="flex items-center gap-3 p-3">
                <Avatar.Root size="sm" className="shrink-0">
                  <Avatar.Image src={query.data.image} />
                  <Avatar.Fallback />
                </Avatar.Root>
                <div className="grow">
                  <p className="font-semibold text-sm">{query.data.fullName}</p>
                  <p className="w-40 truncate text-neutral-500 text-sm">
                    {query.data.emailAddress}
                  </p>
                </div>
              </div>
              <Menu.Separator />
              <Menu.Item value="profile" asChild>
                <Link href={`/people/${query.data.id}`}>
                  <UserIcon />
                  My profile
                </Link>
              </Menu.Item>
              <ChangePassword />
              <Logout />
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </div>
  );
}
