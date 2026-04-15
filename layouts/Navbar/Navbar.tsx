'use client';

import {Portal} from '@ark-ui/react';
import {UserIcon} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {PeopleIcon} from '~/components/icons/PeopleIcon';
import {Avatar} from '~/components/ui/Avatar';
import {Button} from '~/components/ui/Button';
import {IconButton} from '~/components/ui/IconButton';
import {Menu} from '~/components/ui/Menu';
import {useMeQuery} from '~/hooks/useMeQuery';
import {ChangePassword} from './ChangePassword';
import {Logout} from './Logout';

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
                    <PeopleIcon />
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
