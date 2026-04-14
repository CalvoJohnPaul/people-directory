import type {Metadata} from 'next';
import {People} from './People';

export const metadata: Metadata = {
  title: 'People',
};

export default async function Page() {
  return <People />;
}
