import {invariant} from 'es-toolkit';
import jsQR from 'jsqr';

export async function parseQrCode(file: File): Promise<string | null> {
  try {
    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    invariant(context, 'Failed to get canvas context');

    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    context.drawImage(imageBitmap, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    return code?.data ?? null;
  } catch {
    return null;
  }
}
