import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getClient} from '~/config/client';
import {usePersonQuery} from '~/hooks/usePersonQuery';
import {getPerson} from '~/services/Person';
import {getMe} from '~/services/Session';
import type {Person} from '~/types/Person';
import {obfuscateEmail, obfuscateMobileNumber} from '~/utils/obfuscate';
import {Profile} from './Profile';

interface Props {
  params: Promise<{id: string}>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = Number(params.id);
  const person = Number.isNaN(id) || id < 0 ? null : await getPerson(id);

  if (!person) {
    throw new Error('Person not found');
  }

  return {
    title: `${person.firstName} ${person.lastName}`,
  };
}

export default async function Page(props: Props) {
  const params = await props.params;
  const id = Number(params.id);

  if (Number.isNaN(id) || id < 0) {
    return notFound();
  }

  const client = getClient();
  const [person] = await Promise.all([
    getPerson(id),
    client.prefetchQuery({
      queryKey: usePersonQuery.getQueryKey(id),
      queryFn: async (): Promise<Person | null> => {
        const [me, person] = await Promise.all([getMe(), getPerson(id)]);

        if (!person) return null;

        return me
          ? person
          : {
              ...person,
              emailAddress: obfuscateEmail(person.emailAddress),
              mobileNumber: person.mobileNumber ? obfuscateMobileNumber(person.mobileNumber) : null,
            };
      },
    }),
  ]);

  if (!person) {
    return notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <Profile id={id} />
    </HydrationBoundary>
  );
}
