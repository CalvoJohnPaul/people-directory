import {map} from 'es-toolkit/compat';
import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {prisma} from '~/config/prisma';
import {CopyProfileLink} from './CopyProfileLink';
import {EditProfile} from './EditProfile';
import {ViewQrCode} from './ViewQrCode';

interface Props {
  params: Promise<{id: string}>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  try {
    const params = await props.params;
    const id = Number(params.id);

    if (Number.isNaN(id) || id < 0) {
      throw new Error('Invalid id');
    }

    const {firstName, lastName} = await prisma.person.findUniqueOrThrow({
      where: {id},
      select: {
        firstName: true,
        lastName: true,
      },
    });

    return {
      title: `${firstName} ${lastName}`,
    };
  } catch {
    return {
      title: 'Person not found',
    };
  }
}

export default async function Page(props: Props) {
  const params = await props.params;
  const id = Number(params.id);

  if (Number.isNaN(id) || id < 0) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-6xl lg:py-12">
      <section className="gap-3 lg:flex">
        <div className="aspect-square w-56 shrink-0 bg-gray-50">
          <Image
            src={`https://i.pravatar.cc/600?u=${id}`}
            alt="Avatar"
            width={600}
            height={600}
            draggable={false}
            className="size-full object-cover"
          />
        </div>
        <div className="hidden grow lg:block"></div>
        <div className="mt-4 flex gap-2 self-start lg:mt-0">
          <ViewQrCode />
          <CopyProfileLink />
          <EditProfile />
        </div>
      </section>

      <section className="mt-4 space-y-1 md:mt-6 lg:mt-8 lg:border lg:p-6">
        {map(details, (value, key) => (
          <div key={key} className="flex">
            <div className="w-32">{key}</div>
            <div className="text-gray-300">:</div>
            <div className="ml-6">{value}</div>
          </div>
        ))}
      </section>

      <section className="mt-4 text-gray-500 text-sm md:mt-6 lg:mt-8">
        Created by calvojp92@gmail.com — Oct 12, 1992, 3:30 PM
      </section>
    </div>
  );
}

const details = {
  'First name': 'John',
  'Last name': 'Doe',
  'Middle name': 'Smith',
  'Date of birth': 'October 12, 1992',
  Age: '31 years old',
  Gender: 'Male',
};
