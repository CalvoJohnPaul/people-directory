import {redirect} from 'next/navigation';
import {getServerSession} from 'next-auth';
import type {PropsWithChildren} from 'react';
import {authOptions} from '~/config/auth';
import {Navbar} from './Navbar';

export default async function Layout({children}: PropsWithChildren) {
  const session = await getServerSession(authOptions);

  if (session == null) return redirect('/login');

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
