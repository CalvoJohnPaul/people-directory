import {useState} from 'react';
import {useTimeout} from 'usehooks-ts';

export interface UseClipboardReturn {
  copy: () => Promise<void>;
  copied: boolean;
}

export function useClipboard(text: string | null | undefined): UseClipboardReturn {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    setCopied(false);
    await navigator.clipboard.writeText(text || '').catch(console.error);
    setCopied(true);
  };

  useTimeout(() => setCopied(false), copied ? 2500 : null);

  return {
    copy,
    copied,
  };
}
