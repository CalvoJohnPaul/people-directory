'use client';

import {FolderOpenIcon, LogOutIcon} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {signOut, useSession} from 'next-auth/react';
import {Button} from '~/components/ui/Button';
import {Menu} from '~/components/ui/Menu';
import {EditAccount} from './EditAccount';

export function Navbar() {
  const session = useSession();
  const router = useRouter();

  return (
    <header className="flex items-start p-4 lg:p-6">
      <Link href="/" draggable={false} className="block">
        <FolderOpenIcon className="size-6 text-gray-700" />
      </Link>
      <div className="grow"></div>
      <div className="flex gap-2">
        {session.status === 'loading' ? null : session.status === 'authenticated' ? (
          <Button variant="outline" asChild>
            <Link href="/login">Login</Link>
          </Button>
        ) : (
          <Menu.Root open>
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
                <EditAccount />
                <Menu.Item
                  value="logout"
                  onSelect={async () => {
                    await signOut({redirect: false});
                    router.push('/');
                  }}
                >
                  <LogOutIcon />
                  Sign out
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        )}
      </div>
    </header>
  );
}
