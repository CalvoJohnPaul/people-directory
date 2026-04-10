import type {PropsWithChildren} from 'react';

export default async function Layout({children}: PropsWithChildren) {
  return <main className="mx-auto max-w-md p-4 py-12 lg:py-16">{children}</main>;
}
