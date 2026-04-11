import {loadOpenCV, type OpenCV} from '@opencvjs/web';

let $opencv: typeof OpenCV | null = null;

async function getOpenCV() {
  if (!$opencv) {
    $opencv = await loadOpenCV();
  }

  return $opencv;
}

async function $loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };

    image.src = url;
  });
}

export async function enhancePhoto(file: File): Promise<File> {
  const cv = await getOpenCV();
  const imgEl = await $loadImage(file);

  // Read image into OpenCV Mat
  const src = cv.imread(imgEl);
  const dst = new cv.Mat();

  // 1. Convert to LAB color space (better for contrast control)
  const lab = new cv.Mat();
  cv.cvtColor(src, lab, cv.COLOR_RGBA2RGB);
  cv.cvtColor(lab, lab, cv.COLOR_RGB2Lab);

  // Split channels
  const channels = new cv.MatVector();
  cv.split(lab, channels);

  // 2. Apply CLAHE (adaptive contrast) on L channel
  const clahe = new cv.CLAHE(3.0, new cv.Size(8, 8));
  const l = channels.get(0);
  const cl = new cv.Mat();
  clahe.apply(l, cl);

  channels.set(0, cl);
  cv.merge(channels, lab);

  // Convert back to RGB
  cv.cvtColor(lab, dst, cv.COLOR_Lab2RGB);

  // 3. Sharpening kernel
  const kernel = cv.matFromArray(3, 3, cv.CV_32F, [0, -1, 0, -1, 5, -1, 0, -1, 0]);

  const sharpened = new cv.Mat();
  cv.filter2D(dst, sharpened, cv.CV_8U, kernel);

  // 4. Optional: reduce glare (basic highlight suppression)
  const gray = new cv.Mat();
  cv.cvtColor(sharpened, gray, cv.COLOR_RGB2GRAY);

  const mask = new cv.Mat();
  cv.threshold(gray, mask, 220, 255, cv.THRESH_BINARY); // bright spots

  const inpainted = new cv.Mat();
  cv.inpaint(sharpened, mask, inpainted, 3, cv.INPAINT_TELEA);

  // Output to canvas
  const canvas = document.createElement('canvas');
  cv.imshow(canvas, inpainted);

  // Cleanup
  src.delete();
  dst.delete();
  lab.delete();
  channels.delete();
  l.delete();
  cl.delete();
  kernel.delete();
  sharpened.delete();
  gray.delete();
  mask.delete();
  inpainted.delete();

  const url = canvas.toDataURL('image/jpeg', 0.9);

  return new File([url], `photo-${crypto.randomUUID()}.jpg`, {
    type: 'image/jpeg',
    endings: 'native',
    lastModified: Date.now(),
  });
}
