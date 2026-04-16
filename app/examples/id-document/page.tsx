/** biome-ignore-all lint/a11y/useMediaCaption: "" */
'use client';

import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';
import {Button} from '~/components/ui/Button';
import {cropIdDocument, detectIdDocument, type IdDocumentDetectionResult} from '~/utils/idDocument';

async function fileToImageData(file: File): Promise<ImageData> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load selected file.'));
    };

    img.src = objectUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to create canvas context.');
  }

  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<IdDocumentDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setError(null);
    setIsProcessing(true);

    try {
      const imageData = await fileToImageData(selected);
      const detection = await detectIdDocument(imageData);
      setResult(detection);

      let outputFile = detection.file;

      if (detection.detected && detection.cropPoints) {
        outputFile = await cropIdDocument(detection.file, detection.cropPoints);
      }

      setFile(outputFile);
    } catch (caught) {
      setResult(null);
      setFile(null);

      if (caught instanceof Error) {
        setError(caught.message);
      } else {
        setError('Failed to process the selected file.');
      }
    } finally {
      setIsProcessing(false);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-4">
      <Button
        variant="outline"
        disabled={isProcessing}
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        {isProcessing ? 'Processing...' : 'Upload'}
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

      {result && (
        <pre className="mt-4 rounded-md border p-3 text-xs leading-relaxed">
          <code>{JSON.stringify(result, null, 2)}</code>
        </pre>
      )}

      <div>
        {previewUrl && (
          <Image
            src={previewUrl}
            alt=""
            width={250}
            height={250}
            className="mt-4 block h-auto w-40"
            unoptimized
          />
        )}
      </div>
    </div>
  );
}

// import {invariant} from 'es-toolkit';
// import Image from 'next/image';
// import {useCallback, useEffect, useRef, useState} from 'react';
// import {cx} from 'tailwind-variants';
// import {useMediaQuery} from 'usehooks-ts';
// import {Button} from '~/components/ui/Button';
// import {useRect} from '~/hooks/useRect';

// export default function Page() {
//   const wrapperRef = useRef<HTMLDivElement>(null);
//   const wrapperRect = useRect(wrapperRef.current);
//   const aspectRatio = 1.586;
//   const guideRef = useRef<HTMLDivElement>(null);
//   const guideWidth =
//     wrapperRect.width <= 0 || wrapperRect.height <= 0
//       ? 0
//       : Math.max(0, Math.min(wrapperRect.width - 24, (wrapperRect.height - 24) * aspectRatio));
//   const guideHeight = guideWidth * 0.63;

//   const desktop = useMediaQuery('(min-width: 1024px)');
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   const [hint, setHint] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [opened, setOpened] = useState(false);
//   const [opening, setOpening] = useState(false);
//   const [snapping, setSnapping] = useState(false);
//   const [validated, setValidated] = useState(false);
//   const [validating, setValidating] = useState(false);
//   const [imageSample, setImageSample] = useState<File | null>(null);

//   const openCamera = async (): Promise<void> => {
//     if (!videoRef.current) {
//       setError('Video element not found.');
//       return;
//     }

//     setOpening(true);

//     try {
//       const result = await navigator.mediaDevices.getUserMedia({
//         audio: false,
//         preferCurrentTab: true,
//         video: {
//           facingMode: desktop ? 'environment' : 'user',
//           noiseSuppression: true,
//           width: {
//             ideal: 9999,
//           },
//           height: {
//             ideal: 9999,
//           },
//           aspectRatio: {
//             exact: desktop ? 16 / 9 : 4 / 3,
//           },
//           frameRate: {
//             max: 120,
//             ideal: 90,
//           },
//         },
//       });

//       videoRef.current.srcObject = result;
//       streamRef.current = result;

//       setOpened(true);
//     } catch (e) {
//       console.warn(e);

//       if (e instanceof Error) {
//         switch (e.name) {
//           case 'NotAllowedError':
//             setError('You need to allow camera access to use this feature.');
//             return;
//           case 'NotFoundError':
//             setError('Sorry, but we could not find a camera on your device.');
//             return;
//           default:
//             break;
//         }
//       }

//       setError('Failed to open camera. Check your device settings and try again.');
//     } finally {
//       setOpening(false);
//     }
//   };

//   const closeCamera = () => {
//     setError(null);
//     setOpening(false);
//     setOpened(false);
//     setImageSample(null);
//     setValidating(false);
//     setValidated(false);

//     if (streamRef.current) {
//       for (const track of streamRef.current.getTracks()) {
//         track.stop();
//       }

//       streamRef.current = null;
//     }

//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//       videoRef.current.pause();
//     }
//   };

//   const validatePhoto = useCallback(async (): Promise<boolean> => {
//     return true;
//   }, []);

//   useEffect(() => {
//     if (snapping) return;
//     if (validating) return;
//     if (!opened) return;

//     const video = videoRef.current;

//     if (!videoRef.current) return;

//     const interval = setInterval(async () => {
//       setValidating(true);

//       invariant(video, 'Video element not found.');

//       const canvas = document.createElement('canvas');
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const context = canvas.getContext('2d');

//       invariant(context, 'Could not get canvas context.');

//       context.drawImage(video, 0, 0, canvas.width, canvas.height);
//       const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

//       const valid = await validatePhoto();

//       setValidating(false);

//       if (valid) {
//         const url = await new Promise<Blob | null>((resolve) => {
//           canvas.toBlob(
//             (blob) => {
//               resolve(blob);
//             },
//             'image/jpeg',
//             0.925,
//           );
//         });

//         if (url) {
//           setValidated(true);
//           setImageSample(
//             new File([url], 'sample.jpg', {
//               type: 'image/jpeg',
//               endings: 'native',
//               lastModified: Date.now(),
//             }),
//           );
//         }
//       } else {
//         setValidated(false);
//         setImageSample(null);
//       }
//     }, 1000);

//     return () => {
//       clearInterval(interval);
//     };
//   }, [opened, validating, validatePhoto, snapping]);

//   const snapshot = () => {};

//   return (
//     <div className="p-8">
//       <div
//         ref={wrapperRef}
//         className="relative aspect-square w-100 bg-gray-50 lg:aspect-video"
//         style={{
//           aspectRatio,
//         }}
//       >
//         <video
//           ref={videoRef}
//           muted
//           autoPlay
//           playsInline
//           preload="none"
//           disablePictureInPicture
//           style={{
//             width: '100%',
//             height: '100%',
//             display: 'block',
//             boxSizing: 'border-box',
//             background: 'transparent',
//             pointerEvents: 'none',
//           }}
//           hidden={!opened}
//         ></video>
//         <div
//           ref={guideRef}
//           className={cx(
//             'pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 border-3 border-dashed',
//             validated ? 'border-[#12B76A]' : 'border-[#FDE272]',
//           )}
//           style={{
//             width: `${guideWidth}px`,
//             height: `${guideHeight}px`,
//           }}
//           hidden={!opened}
//         ></div>
//         <div
//           className="pointer-events-none absolute top-0 right-0 left-0 z-10 bg-black/75"
//           style={{
//             height: `${Math.max(0, (wrapperRect.height - guideHeight) / 2)}px`,
//           }}
//           hidden={!opened}
//         ></div>
//         <div
//           className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 bg-black/75"
//           style={{
//             height: `${Math.max(0, (wrapperRect.height - guideHeight) / 2)}px`,
//           }}
//           hidden={!opened}
//         ></div>
//         <div
//           className="pointer-events-none absolute left-0 z-10 bg-black/75"
//           style={{
//             top: `${Math.max(0, (wrapperRect.height - guideHeight) / 2)}px`,
//             bottom: `${Math.max(0, (wrapperRect.height - guideHeight) / 2)}px`,
//             width: `${Math.max(0, (wrapperRect.width - guideWidth) / 2)}px`,
//           }}
//           hidden={!opened}
//         ></div>
//         <div
//           className="pointer-events-none absolute right-0 z-10 bg-black/75"
//           style={{
//             top: `${Math.max(0, (wrapperRect.height - guideHeight) / 2)}px`,
//             bottom: `${Math.max(0, (wrapperRect.height - guideHeight) / 2)}px`,
//             width: `${Math.max(0, (wrapperRect.width - guideWidth) / 2)}px`,
//           }}
//           hidden={!opened}
//         ></div>
//       </div>

//       <div className="mt-4 flex gap-3">
//         {!opened && (
//           <Button variant="outline" onClick={openCamera} disabled={opening}>
//             Open
//           </Button>
//         )}

//         {opened && (
//           <>
//             <Button variant="outline" onClick={closeCamera}>
//               Close
//             </Button>
//             <Button
//               variant="outline"
//               disabled={!validated || snapping}
//               onClick={() => {
//                 snapshot();
//               }}
//             >
//               Take photo
//             </Button>
//           </>
//         )}
//       </div>

//       <div className="mt-5">
//         {imageSample && (
//           <Image
//             src={URL.createObjectURL(imageSample)}
//             alt=""
//             width={200}
//             height={200}
//             unoptimized
//             className="h-auto w-32"
//           />
//         )}
//       </div>
//     </div>
//   );
// }
