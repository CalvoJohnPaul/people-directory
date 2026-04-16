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
