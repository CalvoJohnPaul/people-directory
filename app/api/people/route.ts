import {addDays} from 'date-fns';
import {cookies} from 'next/headers';
import {type NextRequest, NextResponse} from 'next/server';
import {createPerson, getPeople} from '~/services/Person';
import {getMe} from '~/services/Session';
import type {HttpResponse} from '~/types/common';
import {CreatePersonInputDefinition, PeopleInputDefinition, type Person} from '~/types/Person';
import {obfuscateEmail, obfuscateMobileNumber} from '~/utils/obfuscate';

export async function GET(req: NextRequest): Promise<NextResponse<HttpResponse<Person[]>>> {
  const input = PeopleInputDefinition.parse({
    q: req.nextUrl.searchParams.get('q'),
    id: req.nextUrl.searchParams.getAll('id'),
    gender: req.nextUrl.searchParams.getAll('gender'),
    emailAddress: req.nextUrl.searchParams.get('emailAddress'),
    mobileNumber: req.nextUrl.searchParams.get('mobileNumber'),
    dateOfBirth__from: req.nextUrl.searchParams.get('dateOfBirth__from'),
    dateOfBirth__to: req.nextUrl.searchParams.get('dateOfBirth__to'),
    createdAt__from: req.nextUrl.searchParams.get('createdAt__from'),
    createdAt__to: req.nextUrl.searchParams.get('createdAt__to'),
    limit: req.nextUrl.searchParams.get('limit'),
  });

  const [me, people] = await Promise.all([getMe(), getPeople(input)]);

  const data = me
    ? people
    : people.map((person) => ({
        ...person,
        emailAddress: obfuscateEmail(person.emailAddress),
        mobileNumber: person.mobileNumber ? obfuscateMobileNumber(person.mobileNumber) : null,
      }));

  return NextResponse.json({ok: true, data});
}

export async function POST(req: NextRequest): Promise<NextResponse<HttpResponse<Person>>> {
  const body = await req.json();
  const result = CreatePersonInputDefinition.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          name: 'BadRequest',
          message: result.error.issues[0].message,
        },
      },
      {status: 400},
    );
  }

  const data = await createPerson(result.data);
  const store = await cookies();

  store.set('user', data.id.toString(), {
    httpOnly: true,
    expires: addDays(new Date(), 30),
    sameSite: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return NextResponse.json({ok: true, data}, {status: 201});
}
