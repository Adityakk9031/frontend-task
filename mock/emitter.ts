import { useCallback, useRef } from 'react';
import type { RunEvent } from '../src/types/events';

export function useMockEmitter(onEvent: (event: RunEvent) => void) {
  const timeoutRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const play = useCallback((events: RunEvent[]) => {
    stop();
    let index = 0;

    const next = () => {
      if (index >= events.length) return;

      const event = events[index];
      onEvent(event);
      index++;

      if (index < events.length) {
        // Calculate delay based on timestamp differences, but with a minimum and maximum for realism
        const currentTs = events[index - 1].timestamp;
        const nextTs = events[index].timestamp;
        const delay = Math.min(Math.max(nextTs - currentTs, 500), 3000);

        timeoutRef.current = window.setTimeout(next, delay);
      }
    };

    next();
  }, [onEvent, stop]);

  return { play, stop };
}
