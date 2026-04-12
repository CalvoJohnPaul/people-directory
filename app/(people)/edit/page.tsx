import {EditAccountForm} from './EditAccountForm';

export default function Page() {
  return (
    <>
      <h1 className="text-center font-bold text-2xl">Edit account</h1>
      <p className="mt-1 text-center text-gray-600">Update your account information below.</p>
      <div className="mt-12">
        <EditAccountForm />
      </div>
    </>
  );
}
