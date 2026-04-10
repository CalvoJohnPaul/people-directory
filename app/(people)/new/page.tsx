import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {getServerSession} from 'next-auth';
import {authOptions} from '~/config/auth';

export const metadata: Metadata = {
  title: 'Create new person',
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (session == null) return redirect('/login');

  return null;
}
