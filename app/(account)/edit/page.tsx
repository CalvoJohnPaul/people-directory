import {Navbar} from '~/components/Navbar';
import {EditAccountForm} from './EditAccountForm';

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md p-4 py-12 lg:py-16">
        <h1 className="text-center font-bold text-2xl">Edit account</h1>
        <p className="mt-1 text-center text-neutral-600">Update your account information below.</p>
        <div className="mt-12">
          <EditAccountForm />
        </div>
      </main>
    </>
  );
}
