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
    <main className="mx-auto max-w-md p-4 py-12 lg:py-16">
      <h1 className="text-center font-bold text-2xl">Sign In</h1>
      <p className="mt-1 text-center text-gray-600">Enter your email to continue.</p>
      <div className="mt-12">
        <LoginForm />
      </div>
    </main>
  );
}
