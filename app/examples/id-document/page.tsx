'use client';

import Image from 'next/image';
import React from 'react';
import {Button} from '~/components/ui/Button';
import {useIdDocumentCamera} from '~/hooks/useIdDocumentCamera';

export default function Page() {
  const camera = useIdDocumentCamera();
  const [photo, setPhoto] = React.useState<string | null>(null);

  return (
    <div className="p-4">
      <div
        className="aspect-4/3 w-full border lg:aspect-video lg:w-100 lg:max-w-full"
        hidden={!!camera.error}
      >
        <video {...camera.getVideoProps()} hidden={!camera.opened || !!camera.data} />

        {!!photo && (
          <Image src={photo} alt="" width={200} height={200} className="mx-auto h-auto w-80" />
        )}
      </div>

      {!!camera.error && <p>{camera.error}</p>}

      <div className="mt-4 flex gap-3">
        {!camera.data && !camera.error && (
          <>
            {!camera.opened && (
              <Button
                variant="outline"
                onClick={() => {
                  camera.open();
                }}
                disabled={camera.opening}
              >
                Open
              </Button>
            )}

            {camera.opened && (
              <>
                <Button variant="outline" onClick={() => camera.close()}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  disabled={!camera.canCapture}
                  onClick={() => {
                    camera.capture();
                  }}
                >
                  Take photo
                </Button>
              </>
            )}
          </>
        )}

        {!!camera.data && (
          <>
            <Button
              variant="outline"
              onClick={() => {
                camera.reset();
              }}
            >
              Retake
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                /* TODO: upload */

                camera.close();
              }}
            >
              Use photo
            </Button>
          </>
        )}

        {!!camera.error && (
          <Button
            variant="outline"
            onClick={() => {
              camera.open();
            }}
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
