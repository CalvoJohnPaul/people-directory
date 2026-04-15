import type {Metadata} from 'next';
import {People} from './People';

export const metadata: Metadata = {
  title: 'People',
};

export default async function Page() {
  return (
    <main className="mx-auto max-w-7xl p-4 lg:px-6 lg:py-12">
      <People />
    </main>
  );
}
