import { useEffect, useRef, useState } from 'react';

/**
 * AnimatedNumber — smoothly tweens from old value to new value.
 *
 * Usage:
 *   const display = useAnimatedNumber(value);
 *   <span>{display}</span>
 *
 * The tween uses an ease-out curve and runs for ~800ms.
 * Returns the same value as input on first render (no animation from 0).
 */
export function useAnimatedNumber(value: number, durationMs = 800): number {
  const [display, setDisplay] = useState<number>(value);
  const fromRef = useRef<number>(value);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // No animation on first mount
    if (fromRef.current === value) return;
    fromRef.current = display;
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return display;
}

/**
 * Formats a tweened number to a fixed decimal place.
 *   useAnimatedNumber(123.456) → 123 (rounded)
 *   useAnimatedNumber(4.7231, 800) → "4.72" (formatted)
 */
export function useAnimatedNumberFormatted(
  value: number,
  decimals = 0,
  durationMs = 800,
): string {
  const n = useAnimatedNumber(value, durationMs);
  return n.toFixed(decimals);
}
