import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {Readable} from 'node:stream';
import {prisma} from '~/config/prisma';
import type {UploadedFile} from '~/types/UploadedFile';

const uploadsDir = path.join(process.cwd(), 'uploads');

export async function uploadFile(file: File): Promise<UploadedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = path.extname(file.name);
  const filename = `${randomUUID().replace(/-/g, '')}${extension}`;
  const location = path.join(uploadsDir, filename);

  await fs.promises.writeFile(location, buffer);

  return await prisma.uploadedFile.create({
    data: {
      url: `${process.env.NEXT_PUBLIC_URL}/api/uploads/${filename}`,
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
}

export async function getUploadedFile(filename: string): Promise<ReadableStream | null> {
  const location = path.join(uploadsDir, filename);
  const stream = fs.createReadStream(location);
  return Readable.toWeb(stream) as ReadableStream;
}
