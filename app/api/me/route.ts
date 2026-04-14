import {NextResponse} from 'next/server';
import {getMe} from '~/services/Session';
import type {HttpResponse} from '~/types/common';
import type {Person} from '~/types/Person';

export async function GET(): Promise<NextResponse<HttpResponse<Person | null>>> {
  const data = await getMe();

  return NextResponse.json({
    ok: true,
    data,
  });
}
