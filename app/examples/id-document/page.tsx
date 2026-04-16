/** biome-ignore-all lint/a11y/useMediaCaption: "" */
'use client';

import Image from 'next/image';
import {useRef, useState} from 'react';
import {Button} from '~/components/ui/Button';
import {cropIdDocument, detectIdDocument, explainIdDocumentDetection} from '~/utils/idDocument';

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.clear();

    const file = event.target.files?.[0];

    if (!file) return;

    setData(null);
    setError(null);
    setLoading(true);

    try {
      const detection = await detectIdDocument(file);
      const result = explainIdDocumentDetection(detection);

      console.log(detection);

      if (!result.ok) {
        setData(URL.createObjectURL(file));
        setError(result.error.message);
        return;
      }

      const cropped = result.data.cropPoints
        ? await cropIdDocument(result.data.file, result.data.cropPoints)
        : result.data.file;

      setData(URL.createObjectURL(cropped));
    } catch (error) {
      console.warn(error);
      setError('Failed to process the selected file.');
    } finally {
      setLoading(false);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-4">
      <Button
        variant="outline"
        disabled={loading}
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        {loading ? 'Processing...' : 'Upload'}
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      {data && (
        <div className="mt-4 w-fit border">
          <Image
            src={data}
            alt=""
            width={250}
            height={250}
            className="block h-auto w-40"
            unoptimized
          />
        </div>
      )}
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
