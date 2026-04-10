import type {PropsWithChildren} from 'react';
import {Navbar} from './Navbar';

export default async function Layout({children}: PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl p-4 lg:px-6 lg:py-12">{children}</main>
    </>
  );
}
