import {type NextRequest, NextResponse} from 'next/server';
import {uploadFile} from '~/services/UploadedFile';
import type {HttpResponse} from '~/types/common';
import type {UploadedFile} from '~/types/UploadedFile';

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
    const data = await uploadFile(file);
    return NextResponse.json({ok: true, data});
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
