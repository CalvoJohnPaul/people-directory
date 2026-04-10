import type {PropsWithChildren} from 'react';
import {Navbar} from './Navbar';

export default async function Layout({children}: PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
