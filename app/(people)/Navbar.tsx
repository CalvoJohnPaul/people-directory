'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {signOut, useSession} from 'next-auth/react';
import {Button} from '~/components/ui/Button';

export function Navbar() {
  const session = useSession();
  const router = useRouter();

  return (
    <header>
      {session.status === 'unauthenticated' && <Link href="/login">Login</Link>}
      {session.status === 'authenticated' && (
        <Button
          onClick={async () => {
            signOut({redirect: false});
            router.push('/');
          }}
        >
          Sign out
        </Button>
      )}
    </header>
  );
}
