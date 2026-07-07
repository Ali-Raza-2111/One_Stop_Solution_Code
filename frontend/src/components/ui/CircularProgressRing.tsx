/**
 * CircularProgressRing — an SVG ring whose stroke-dashoffset animates
 * from full to target percentage when it scrolls into view.
 *
 * Used by RecordSection to wrap each stat counter.
 */
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface CircularProgressRingProps {
  /** 0..1 — fraction of the ring that should be filled */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** CSS color or gradient id */
  color?: string;
  trackColor?: string;
  children?: ReactNode;
  durationMs?: number;
}

export default function CircularProgressRing({
  value,
  size = 96,
  strokeWidth = 6,
  color = 'url(#ringGradient)',
  trackColor = 'rgba(15, 23, 42, 0.07)',
  children,
  durationMs = 1400,
}: CircularProgressRingProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);

  // Trigger animation when in view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setProgress(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, durationMs]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * progress;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
