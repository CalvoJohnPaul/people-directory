import type {Metadata} from 'next';
import Link from 'next/link';
import {RegisterForm} from './RegisterForm';

export const metadata: Metadata = {
  title: 'Create account',
};

export default async function Page() {
  return (
    <>
      <h1 className="text-center font-bold text-2xl">Create account</h1>
      <p className="mt-1 text-center text-gray-600">Fill out the form to create your account.</p>
      <div className="mt-12">
        <RegisterForm />

        <p className="mt-8 text-center text-gray-600">
          Already registered?{' '}
          <Link href="/login" className="text-blue-700 underline underline-offset-3">
            Log in
          </Link>
        </p>
      </div>
    </>
  );
}
