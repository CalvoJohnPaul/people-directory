import type {PropsWithChildren} from 'react';
import {Navbar} from '~/layouts/Navbar';

export default async function Layout({children}: PropsWithChildren) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
