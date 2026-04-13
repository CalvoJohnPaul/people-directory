import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {cache} from 'react';
import {getClient} from '~/config/client';
import {prisma} from '~/config/prisma';
import {usePersonQuery} from '~/hooks/usePersonQuery';
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
      queryFn: () => getPerson(id),
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

const getPerson = cache(async (id: number) => {
  return await prisma.person.findUnique({
    where: {id},
    select: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      gender: true,
      dateOfBirth: true,
      emailAddress: true,
      emailAddressVerifiedAt: true,
      mobileNumber: true,
      mobileNumberVerifiedAt: true,
      currentAddress: true,
      permanentAddress: true,
      image: true,
      idDocument: true,
      verifiedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});
