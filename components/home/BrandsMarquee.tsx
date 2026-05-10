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

/**
 * Infinite supplier-logo strip. The container is a real horizontal scroller
 * (so users can swipe / drag / scroll-wheel), and a tiny rAF loop nudges
 * scrollLeft forward each frame to create the auto-marquee effect. When the
 * user touches the strip we pause the auto-scroll for a moment and let
 * native scrolling take over; releasing resumes the auto-loop.
 *
 * Looping is done via the "duplicate-and-wrap" trick: the list is rendered
 * twice in a row; when scrollLeft crosses half the scrollWidth, we subtract
 * half — visually identical, perfectly seamless.
 */
export function BrandsMarquee() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedUntilRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  // Render the list twice for the wrap-around to look continuous.
  const items = [...BRAND_LOGOS, ...BRAND_LOGOS];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // skip auto-animation entirely
    }

    // Pixels per second. ~25 → calm, readable rhythm.
    const SPEED_PX_PER_SEC = 30;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTs;
      lastTs = now;
      const isPaused = now < pausedUntilRef.current;
      if (!isPaused) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          let next = el.scrollLeft + (SPEED_PX_PER_SEC * dt) / 1000;
          if (next >= half) next -= half;
          if (next < 0) next += half;
          el.scrollLeft = next;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // Pause auto-scroll while the user interacts; resume 1.5s after release
    // so a tap or short swipe lets them finish reading before motion kicks
    // back in.
    const RESUME_DELAY = 1500;
    const pause = () => {
      pausedUntilRef.current = Number.POSITIVE_INFINITY;
    };
    const scheduleResume = () => {
      pausedUntilRef.current = performance.now() + RESUME_DELAY;
    };
    // Any manual scroll (wheel / arrow keys / programmatic) also defers
    // the auto-scroll briefly so it doesn't jitter against the user's input.
    const onScroll = () => {
      pausedUntilRef.current = Math.max(
        pausedUntilRef.current,
        performance.now() + 600,
      );
      // Wrap-around must work whether we drove the scroll or the user did.
      const half = el.scrollWidth / 2;
      if (half > 0) {
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        else if (el.scrollLeft < 0) el.scrollLeft += half;
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
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden py-6 md:py-8"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div
        ref={scrollRef}
        className="brands-marquee-track flex w-full items-center gap-5 overflow-x-auto md:gap-7"
        style={{
          // Allow horizontal swipe; vertical gestures still scroll the page.
          touchAction: "pan-x",
          scrollbarWidth: "none",
          // Snap-stop turned off — feels too rigid for free-flow scrolling.
        }}
        aria-label="Mărci partenere"
      >
        {items.map((b, i) => (
          <div
            key={`${b.name}-${i}`}
            className="flex h-20 w-40 shrink-0 select-none items-center justify-center rounded-lg bg-white px-5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-black/5 sm:h-24 sm:w-48 md:h-28 md:w-52"
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
      </div>

      <style>{`
        .brands-marquee-track::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
