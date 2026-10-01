import { useMemo } from 'react';

/** Returns `[0, 1, ... n-1]` — handy for `Array.from`-style key generation. */
export function useRange(n: number): number[] {
  return useMemo(() => Array.from({ length: n }, (_, i) => i), [n]);
}