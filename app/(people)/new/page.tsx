import type {Metadata} from 'next';
import {AddPersonForm} from './AddPersonForm';

export const metadata: Metadata = {
  title: 'Create new person',
};

export default async function Page() {
  return (
    <main className="mx-auto max-w-md p-4 py-12 lg:py-16">
      <h1 className="text-center font-bold text-2xl">Add Person</h1>
      <p className="mt-1 text-center text-gray-600">Fill out the form below to add a new person.</p>
      <div className="mt-12">
        <AddPersonForm />
      </div>
    </main>
  );
}
