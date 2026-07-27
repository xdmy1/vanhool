"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Slot-machine style count-up for stat numbers. Animates the first integer it
 * finds in `value` from 0 to the target when the element scrolls into view,
 * keeping any prefix/suffix static ("60+" → counts to 60 then "+", "24–72h" →
 * counts the 24). SSR-safe: renders the final value first (so no-JS + crawlers
 * see the real number), then animates once on intersection.
 */
export function CountUp({
  value,
  className,
  durationMs = 1400,
}: {
  value: string;
  className?: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = value.match(/\d[\d.,]*/);
    if (!match) return; // nothing numeric to animate
    const raw = match[0].replace(/[.,]/g, "");
    const target = parseInt(raw, 10);
    if (!Number.isFinite(target)) return;
    const prefix = value.slice(0, match.index);
    const suffix = value.slice((match.index ?? 0) + match[0].length);

    // Respect reduced-motion.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start = 0;
    let done = false;

    const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / durationMs);
      const n = Math.round(easeOut(p) * target);
      setText(`${prefix}${n}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !done) {
            done = true;
            setText(`${prefix}0${suffix}`);
            raf = requestAnimationFrame(step);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
