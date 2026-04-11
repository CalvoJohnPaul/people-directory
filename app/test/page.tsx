'use client';

import Image from 'next/image';
import {useEffect, useState} from 'react';
import {useCamera} from '~/hooks/useCamera';

export default function Page() {
  const camera = useCamera();
  const [snapshot, setSnapshot] = useState<File | null>(null);
  const src = snapshot ? URL.createObjectURL(snapshot) : null;

  useEffect(() => {
    camera.subscribe((event) => {
      if (event.type === 'SNAPSHOT') {
        setSnapshot(event.details.file);
      }
    });
  }, [camera.subscribe]);

  return (
    <div className="p-4">
      <div className="aspect-square w-64">
        <video {...camera.videoProps} />
      </div>
      <div className="mt-5 flex gap-1">
        <button
          type="button"
          onClick={() => {
            camera.open();
          }}
          disabled={camera.opened}
        >
          Open
        </button>
        <button
          type="button"
          onClick={() => {
            camera.close();
          }}
          disabled={!camera.opened}
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => {
            camera.snap();
          }}
          disabled={!camera.opened || camera.snapping}
        >
          Snap
        </button>
      </div>

      {src && (
        <Image
          src={src}
          alt=""
          width={300}
          height={300}
          unoptimized
          className="mt-5 block aspect-square w-32"
        />
      )}
    </div>
  );
}
