import type {Metadata} from 'next';
import Link from 'next/link';
import {LoginForm} from './LoginForm';

export const metadata: Metadata = {
  title: 'Login',
};

export default async function Page() {
  return (
    <>
      <h1 className="text-center font-bold text-2xl">Sign in</h1>
      <p className="mt-1 text-center text-neutral-600">Enter your credentials to continue.</p>
      <div className="mt-12">
        <LoginForm />

        <p className="mt-8 text-center text-neutral-600">
          Not yet registered?{' '}
          <Link href="/register" className="text-blue-700 underline underline-offset-3">
            Click here
          </Link>
        </p>
      </div>
    </>
  );
}
