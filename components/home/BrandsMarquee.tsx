"use client";

import { useEffect, useRef } from "react";

const BRAND_LOGOS = [
  { name: "Knorr-Bremse", url: "https://shop.mits-automotive.be/images/thumbs/0001869_knorr-bremse_345.png" },
  { name: "Wabco", url: "https://shop.mits-automotive.be/images/thumbs/0001870_wabco_345.jpeg" },
  { name: "Haldex", url: "https://shop.mits-automotive.be/images/thumbs/0001871_haldex_345.png" },
  { name: "Wilke", url: "https://shop.mits-automotive.be/images/thumbs/0002413_wilke_345.png" },
  { name: "Van Hool", url: "https://shop.mits-automotive.be/images/thumbs/0001872_van-hool_345.png" },
  { name: "Hella", url: "https://shop.mits-automotive.be/images/thumbs/0001874_hella_345.png" },
  { name: "MANN-FILTER", url: "https://shop.mits-automotive.be/images/thumbs/0001875_mann-filter_345.png" },
  { name: "Eberspächer", url: "https://shop.mits-automotive.be/images/thumbs/0001876_eberspacher_345.png" },
  { name: "Sachs", url: "https://shop.mits-automotive.be/images/thumbs/0001881_sachs_345.png" },
  { name: "Gates", url: "https://shop.mits-automotive.be/images/thumbs/0001882_gates_345.png" },
  { name: "Knecht", url: "https://shop.mits-automotive.be/images/thumbs/0001883_knecht_345.png" },
  { name: "Van Wezel", url: "https://shop.mits-automotive.be/images/thumbs/0001885_van-wezel_345.png" },
  { name: "Monroe", url: "https://shop.mits-automotive.be/images/thumbs/0001886_monroe_345.png" },
  { name: "Dayco", url: "https://shop.mits-automotive.be/images/thumbs/0001888_dayco_345.png" },
  { name: "Iveco", url: "https://shop.mits-automotive.be/images/thumbs/0001918_iveco_345.png" },
  { name: "MAN", url: "https://shop.mits-automotive.be/images/thumbs/0001923_man_345.png" },
  { name: "Volvo", url: "https://shop.mits-automotive.be/images/thumbs/0001931_volvo_345.png" },
  { name: "Mercedes-Benz", url: "https://shop.mits-automotive.be/images/thumbs/0001933_mercedes_345.png" },
  { name: "Temsa", url: "https://shop.mits-automotive.be/images/thumbs/0001938_temsa_345.png" },
  { name: "Mitsubishi", url: "https://shop.mits-automotive.be/images/thumbs/0007558_mitsubishi_345.png" },
  { name: "Scania", url: "https://shop.mits-automotive.be/images/thumbs/0879887_scania_345.png" },
];

type Brand = { name: string; url: string };

/**
 * Two-row brand marquee with opposite scroll directions. Each row is a
 * real horizontal scroller (touch-swipe friendly) with a rAF auto-loop
 * on top. Rows pause when the user grabs them and resume after 1.5s.
 *
 * The lists feed the two rows in different orderings (first half / second
 * half + reversed) so neighbouring rows never align on the same brand.
 */
export function BrandsMarquee() {
  const half = Math.ceil(BRAND_LOGOS.length / 2);
  const topItems = [...BRAND_LOGOS.slice(0, half), ...BRAND_LOGOS.slice(half)];
  // Bottom row uses the same brands but reversed + offset so the two rows
  // visually feel different at any moment.
  const bottomItems = [...BRAND_LOGOS.slice(half), ...BRAND_LOGOS.slice(0, half)].reverse();

  return (
    <div
      className="relative w-full overflow-hidden py-4 md:py-6"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div className="flex flex-col gap-3 md:gap-4">
        <MarqueeRow items={topItems} direction={1} speedPxPerSec={28} />
        <MarqueeRow items={bottomItems} direction={-1} speedPxPerSec={32} />
      </div>
    </div>
  );
}

function MarqueeRow({
  items,
  direction,
  speedPxPerSec,
}: {
  items: Brand[];
  direction: 1 | -1;
  speedPxPerSec: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedUntilRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  // Render the list twice for the wrap-around to feel continuous.
  const tiles = [...items, ...items];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // Center the right-to-left row at the middle so the user can
      // still scroll in either direction without hitting an edge.
      if (direction === -1) el.scrollLeft = el.scrollWidth / 2;
      return;
    }

    // For the right-to-left row, start in the middle so the wrap-back math
    // never has to deal with a negative scrollLeft on first paint.
    if (direction === -1) el.scrollLeft = el.scrollWidth / 2;

    let lastTs = performance.now();
    const tick = (now: number) => {
      const dt = now - lastTs;
      lastTs = now;
      const isPaused = now < pausedUntilRef.current;
      if (!isPaused) {
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0) {
          let next = el.scrollLeft + (direction * speedPxPerSec * dt) / 1000;
          if (next >= halfWidth) next -= halfWidth;
          if (next < 0) next += halfWidth;
          el.scrollLeft = next;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const RESUME_DELAY = 1500;
    const pause = () => {
      pausedUntilRef.current = Number.POSITIVE_INFINITY;
    };
    const scheduleResume = () => {
      pausedUntilRef.current = performance.now() + RESUME_DELAY;
    };
    const onScroll = () => {
      pausedUntilRef.current = Math.max(
        pausedUntilRef.current,
        performance.now() + 600,
      );
      const halfWidth = el.scrollWidth / 2;
      if (halfWidth > 0) {
        if (el.scrollLeft >= halfWidth) el.scrollLeft -= halfWidth;
        else if (el.scrollLeft < 0) el.scrollLeft += halfWidth;
      }
    };

    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", scheduleResume);
    el.addEventListener("pointercancel", scheduleResume);
    el.addEventListener("pointerleave", scheduleResume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", scheduleResume);
    el.addEventListener("touchcancel", scheduleResume);
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", scheduleResume);
      el.removeEventListener("pointercancel", scheduleResume);
      el.removeEventListener("pointerleave", scheduleResume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", scheduleResume);
      el.removeEventListener("touchcancel", scheduleResume);
      el.removeEventListener("scroll", onScroll);
    };
  }, [direction, speedPxPerSec]);

  return (
    <div
      ref={scrollRef}
      className="brands-marquee-row flex w-full items-center gap-3 overflow-x-auto sm:gap-4 md:gap-5"
      style={{
        touchAction: "pan-x",
        scrollbarWidth: "none",
      }}
      aria-label="Mărci partenere"
    >
      {tiles.map((b, i) => (
        <div
          key={`${b.name}-${i}`}
          className="flex h-12 w-24 shrink-0 select-none items-center justify-center rounded-md bg-white px-2.5 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-black/5 sm:h-16 sm:w-32 sm:px-3 sm:py-2 md:h-20 md:w-40 md:rounded-lg md:px-5 md:py-3"
          title={b.name}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.url}
            alt={b.name}
            loading="lazy"
            draggable={false}
            className="max-h-full max-w-full select-none object-contain"
          />
        </div>
      ))}

      <style>{`
        .brands-marquee-row::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
