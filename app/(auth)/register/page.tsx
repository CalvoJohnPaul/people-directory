import type {Metadata} from 'next';
import {RegisterForm} from './RegisterForm';

export const metadata: Metadata = {
  title: 'Create account',
};

export default async function Page() {
  return (
    <>
      <h1 className="text-center font-bold text-2xl">Register</h1>
      <p className="mt-1 text-center text-gray-600">
        Fill out the form below to register your account.
      </p>
      <div className="mt-12">
        <RegisterForm />
      </div>
    </>
  );
}
