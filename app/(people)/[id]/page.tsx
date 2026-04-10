import {map} from 'es-toolkit/compat';
import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {twJoin} from 'tailwind-merge';
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

  const details = {
    'Last name': 'Doe',
    'First name': 'John',
    'Middle name': null,
    Gender: 'Male',
    'Date of birth': 'October 12, 1992',
    Age: '31 years old',
    Email: 'calvojp92@gmail.com',
    'Mobile number': '+63 919 0000 000',
    'Date registered': 'October 12, 1992 at 3:30 PM',
  };

  return (
    <>
      <section className="gap-3 lg:flex">
        <div className="aspect-square w-56 shrink-0 bg-gray-50">
          <Image
            src={`https://i.pravatar.cc/600?u=${id}`}
            alt="Avatar"
            width={600}
            height={600}
            priority
            draggable={false}
            className="size-full object-cover"
          />
        </div>
        <div className="hidden grow lg:block"></div>
        <div className="mt-4 flex gap-3 self-start lg:mt-0">
          <ViewQrCode />
          <CopyProfileLink />
          <EditProfile />
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-3 md:mt-6 lg:mt-8 lg:grid-cols-3">
        {map(details, (value, key) => {
          return (
            <div key={key}>
              <div className="text-gray-500 text-sm">{key}</div>
              <div className={twJoin(value == null && 'font-mono text-gray-600')}>
                {value || '[NA]'}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
