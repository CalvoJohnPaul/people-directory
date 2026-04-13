'use client';

import Image from 'next/image';
import {type ChangeEvent, useEffect, useRef, useState} from 'react';
import {Button} from '~/components/ui/Button';
import {cropIdDocument, detectIdDocument, type IdDocumentDetection} from '~/utils/idDocument';

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<IdDocumentDetection | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const src = file ? URL.createObjectURL(file) : null;

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await detectIdDocument(file);
    setResult(result);
    if (result.found) {
      const cropped = await cropIdDocument(file);
      setFile(cropped);
    } else {
      setFile(file);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      setFile(null);
      setResult(null);
    };
  }, []);

  return (
    <div className="space-y-4 p-8">
      {src && (
        <Image
          src={src}
          alt=""
          width={400}
          height={300}
          className="block h-64 w-auto"
          unoptimized
        />
      )}

      <Button variant="outline" onClick={handleClick}>
        Upload ID Document
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {result && (
        <pre className="text-sm">
          <code>{JSON.stringify(result, null, 2)}</code>
        </pre>
      )}
    </div>
  );
}
