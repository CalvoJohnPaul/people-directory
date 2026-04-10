'use client';

import {FolderOpenIcon, SettingsIcon} from 'lucide-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {signOut, useSession} from 'next-auth/react';
import {Button} from '~/components/ui/Button';
import {IconButton} from '~/components/ui/IconButton';

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
        {session.status === 'unauthenticated' && (
          <Button variant="outline" asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}

        {session.status === 'authenticated' && (
          <IconButton
            variant="outline"
            onClick={async () => {
              signOut({redirect: false});
              router.push('/');
            }}
          >
            <SettingsIcon />
          </IconButton>
        )}
      </div>
    </header>
  );
}
