import fs from 'node:fs';
import path from 'node:path';
import {Readable} from 'node:stream';
import {type NextRequest, NextResponse} from 'next/server';

const uploadsDir = path.join(process.cwd(), 'uploads');

export async function GET(_: NextRequest, ctx: RouteContext<'/api/uploads/[filename]'>) {
  const {filename} = await ctx.params;
  const location = path.join(uploadsDir, filename);

  try {
    const nodeStream = fs.createReadStream(location);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse(null, {status: 404});
  }
}
