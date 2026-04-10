import {clamp, noop} from 'es-toolkit';
import {useCallback, useEffect, useState} from 'react';

interface UseCooldownOptions {
  min?: number;
  max?: number;
  duration?: number;
  autoplay?: boolean;
  allowPause?: boolean;
  onCooldown?: () => void;
}

interface UseCooldownReturn {
  start: () => void;
  restart: () => void;
  stop: () => void;
  countdown: number;
  cooling: boolean;
  paused: boolean;
}

/**
 * @example
 * ```ts
 * const cooldown = useCooldown({
 *   max: 60,
 *   duration: 1000 * 60,
 *   autoplay: false,
 *   allowPause: false,
 * });
 *
 */
export function useCooldown(opts?: UseCooldownOptions): UseCooldownReturn {
  'use no memo';

  const min = opts?.min ?? 0;
  const max = opts?.max ?? 10;
  const duration = opts?.duration ?? 10000;
  const autoplay = opts?.autoplay ?? false;
  const allowPause = opts?.allowPause ?? false;
  const onCooldown = opts?.onCooldown ?? noop;

  const [paused, setPaused] = useState(false);
  const [cooling, setCooling] = useState(false);
  const [countdown, setCountdown] = useState(min);
  const [autoPlayed, setAutoplayed] = useState(false);

  const start = useCallback(() => {
    /* is it paused? */
    if (paused) {
      setPaused(false);
      return;
    }

    /* is it still cooling down? */
    if (cooling) {
      /* do we allow pause? */
      if (allowPause) {
        setPaused(true);
      }

      return;
    }

    setCooling(true);
    setCountdown(max - 1);
  }, [allowPause, cooling, max, paused]);

  function stop() {
    setPaused(false);
    setCooling(false);
    setCountdown(min);
  }

  function restart() {
    stop();
    start();
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (cooling && !paused) {
      timer = setInterval(() => {
        setCountdown(round(clamp(countdown - 1, min, max)));

        if (countdown <= min) {
          clearInterval(timer);
          setCountdown(min);
          setCooling(false);
          onCooldown();
        }
      }, duration / max);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  });

  useEffect(() => {
    if (cooling) return;
    if (autoPlayed) return;
    if (!autoplay) return;
    start();
    setAutoplayed(true);
  }, [autoPlayed, autoplay, cooling, start]);

  useEffect(() => {
    return () => {
      setCooling(false);
      setPaused(false);
      setCountdown(min);
      setAutoplayed(false);
    };
  }, [min]);

  return {
    start,
    restart,
    stop,
    paused,
    cooling,
    countdown,
  };
}

function round(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
