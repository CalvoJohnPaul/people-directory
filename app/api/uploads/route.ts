import {randomUUID} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {type NextRequest, NextResponse} from 'next/server';
import {prisma} from '~/config/prisma';
import type {HttpResponse} from '~/types/common';
import type {UploadedFile} from '~/types/UploadedFile';

const uploadsDir = path.join(process.cwd(), 'uploads');

export async function PUT(req: NextRequest): Promise<NextResponse<HttpResponse<UploadedFile>>> {
  const form = await req.formData();
  const file = form.get('file');

  if (
    file instanceof File &&
    file.size < 10 * 1024 * 1024 /* 10MB */ &&
    (file.type === 'image/jpg' ||
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/webp')
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extension = path.extname(file.name);
    const filename = `${randomUUID().replace(/-/g, '')}${extension}`;
    const location = path.join(uploadsDir, filename);

    await fs.writeFile(location, buffer);

    const data = await prisma.uploadedFile.create({
      data: {
        url: `${req.nextUrl.origin}/api/uploads/${filename}`,
        name: filename,
        type: file.type,
        size: file.size,
      },
      select: {
        id: true,
        url: true,
        name: true,
        type: true,
        size: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data,
    });
  }

  return NextResponse.json(
    {
      ok: false,
      error: {
        name: 'ValidationError',
        message: 'Missing or unsupported file',
      },
    },
    {status: 400},
  );
}
