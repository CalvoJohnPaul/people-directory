import {People} from './People';
import {Toolbar} from './Toolbar';

export default async function Page() {
  return (
    <div className="mx-auto max-w-6xl lg:py-12">
      <Toolbar />
      <People />
    </div>
  );
}
