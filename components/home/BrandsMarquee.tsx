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
 * Two-row brand marquee. Pure CSS transform animation — GPU-accelerated,
 * 60fps on mobile. Each row uses a duplicated track translated by -50%
 * (or 0 → -50% reversed) so the loop is seamless without JS.
 *
 * No touch-scroll interaction in this version: writing `scrollLeft` per
 * frame on two rows brought mobile rendering to a crawl. The trade-off
 * is acceptable since each logo passes through the visible area within
 * a few seconds anyway.
 */
export function BrandsMarquee() {
  const half = Math.ceil(BRAND_LOGOS.length / 2);
  const topItems = [...BRAND_LOGOS.slice(0, half), ...BRAND_LOGOS.slice(half)];
  // Same brands but reversed + offset so the two rows don't align.
  const bottomItems = [
    ...BRAND_LOGOS.slice(half),
    ...BRAND_LOGOS.slice(0, half),
  ].reverse();

  return (
    <div
      className="relative w-full overflow-hidden py-4 md:py-6"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      <div className="flex flex-col gap-3 md:gap-4">
        <MarqueeRow items={topItems} reverse={false} duration={55} />
        <MarqueeRow items={bottomItems} reverse={true} duration={48} />
      </div>
    </div>
  );
}

function MarqueeRow({
  items,
  reverse,
  duration,
}: {
  items: Brand[];
  reverse: boolean;
  duration: number;
}) {
  // Render the list twice so the wrap-around at -50% is seamless.
  const tiles = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div
        className="brands-marquee-track flex w-max items-center gap-3 sm:gap-4 md:gap-5"
        style={{
          animation: `brands-marquee-scroll ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
          willChange: "transform",
        }}
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
      </div>

      <style>{`
        @keyframes brands-marquee-scroll {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .brands-marquee-track { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
