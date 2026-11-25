import { useCallback, useRef, useSyncExternalStore } from 'react';

let open = false;
const listeners = new Set<() => void>();

export function setFacilitatorOpen(value: boolean): void {
  open = value;
  listeners.forEach((l) => l());
}

export function toggleFacilitator(): void {
  setFacilitatorOpen(!open);
}

export function useFacilitatorOpen(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => open,
  );
}

/** Returns a click handler that toggles the facilitator panel after 5 quick taps. */
export function useSecretTaps(): () => void {
  const count = useRef(0);
  const last = useRef(0);
  return useCallback(() => {
    const now = Date.now();
    count.current = now - last.current < 1500 ? count.current + 1 : 1;
    last.current = now;
    if (count.current >= 5) {
      count.current = 0;
      toggleFacilitator();
    }
  }, []);
}
