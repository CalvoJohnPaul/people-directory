import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {prisma} from '~/config/prisma';

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

  return null;
}
