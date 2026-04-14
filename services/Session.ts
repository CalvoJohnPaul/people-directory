import {compare} from 'bcrypt';
import {addDays, isAfter} from 'date-fns';
import {cookies} from 'next/headers';
import {prisma} from '~/config/prisma';
import type {Person} from '~/types/Person';
import type {CreateSessionInput} from '~/types/Session';
import {getPerson} from './Person';

export async function getMe(): Promise<Person | null> {
  const store = await cookies();
  const id = parseInt(store.get('user')?.value ?? '', 10);
  if (Number.isNaN(id)) return null;
  return await getPerson(id);
}

export async function createSession(data: CreateSessionInput): Promise<boolean> {
  if ('otpCode' in data) {
    const {emailAddress, otpCode} = data;

    const now = new Date();
    const otp = await prisma.otp.findUnique({
      where: {emailAddress},
      select: {
        code: true,
        expiresAt: true,
      },
    });

    if (!otp || isAfter(now, otp.expiresAt) || otpCode !== otp.code) {
      return false;
    }

    await prisma.otp.deleteMany({where: {emailAddress}});

    const person = await prisma.person.findUnique({
      where: {emailAddress},
      select: {id: true},
    });

    if (person == null) {
      return false;
    }

    const store = await cookies();

    store.set('user', person.id.toString(), {
      httpOnly: true,
      expires: addDays(new Date(), 30),
      sameSite: true,
      secure: process.env.NODE_ENV === 'production',
    });
  } else {
    const {emailAddress, password} = data;

    const person = await prisma.person.findUnique({
      where: {emailAddress},
      select: {
        id: true,
        password: true,
      },
    });

    if (person == null || !(await compare(password, person.password))) {
      return false;
    }

    const store = await cookies();

    store.set('user', person.id.toString(), {
      httpOnly: true,
      expires: addDays(new Date(), 30),
      sameSite: true,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return true;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete('user');
}
