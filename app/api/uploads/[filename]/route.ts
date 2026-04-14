import {type NextRequest, NextResponse} from 'next/server';
import {getUploadedFile} from '~/services/UploadedFile';

export async function GET(_: NextRequest, ctx: RouteContext<'/api/uploads/[filename]'>) {
  const {filename} = await ctx.params;

  try {
    const data = await getUploadedFile(filename);

    return new NextResponse(data, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse(null, {status: 404});
  }
}
