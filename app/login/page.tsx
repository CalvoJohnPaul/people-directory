import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {getServerSession} from 'next-auth';
import {authOptions} from '~/config/auth';
import {LoginForm} from './LoginForm';

export const metadata: Metadata = {
  title: 'Login',
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (session != null) return redirect('/');

  return (
    <main>
      <LoginForm />
    </main>
  );
}
