'use client';

import {FolderOpenIcon, LogOutIcon, UserIcon} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Button} from '~/components/ui/Button';
import {Menu} from '~/components/ui/Menu';

const authenticated = true;

export function Navbar() {
  const router = useRouter();

  return (
    <header className="flex items-start p-4 lg:p-6">
      <Link href="/" draggable={false} className="block">
        <FolderOpenIcon className="size-6 text-gray-700" />
      </Link>
      <div className="grow"></div>
      <div className="flex gap-3">
        {!authenticated ? (
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
                src="https://i.pravatar.cc/300"
                alt=""
                width={250}
                height={250}
                className="size-11 object-cover"
              />
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="profile" asChild>
                  <Link href="/1">
                    <UserIcon />
                    My profile
                  </Link>
                </Menu.Item>
                <Menu.Item
                  value="logout"
                  onSelect={async () => {
                    router.push('/');
                  }}
                >
                  <LogOutIcon />
                  Log out
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        )}
      </div>
    </header>
  );
}
