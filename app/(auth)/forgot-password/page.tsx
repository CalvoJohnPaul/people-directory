import type {Metadata} from 'next';
import Link from 'next/link';
import {ForgotPasswordForm} from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password',
};

export default async function ForgotPassword() {
  return (
    <>
      <h1 className="text-center font-bold text-2xl">Reset Password</h1>
      <p className="mt-1 text-center text-neutral-600">Fill out the form to reset your password.</p>
      <div className="mt-12">
        <ForgotPasswordForm />

        <p className="mt-8 text-center text-neutral-600">
          Remembered your password?{' '}
          <Link href="/login" className="text-blue-700 underline underline-offset-3">
            Click here
          </Link>
        </p>
      </div>
    </>
  );
}
