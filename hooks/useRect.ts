import {useEffect, useState} from 'react';

export function useRect(elem: HTMLElement | null): DOMRect {
  const [rect, setRect] = useState<DOMRect>({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    toJSON() {
      return {
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
      };
    },
  });

  useEffect(() => {
    if (!elem) return;

    const updateRect = () => {
      setRect(elem.getBoundingClientRect());
    };

    const observer = new ResizeObserver(updateRect);

    observer.observe(elem);
    requestAnimationFrame(updateRect);
    window.addEventListener('resize', updateRect);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateRect);
    };
  }, [elem]);

  return rect;
}
