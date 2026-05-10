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
 * Infinite horizontal marquee of supplier brand logos. Uses plain <img>
 * (the source is already a CDN thumbnail) so we don't fight next/image's
 * intrinsic-size handling. Each logo lives in a generously sized white
 * tile so the white-on-white artwork doesn't bleed into the page surface.
 */
export function BrandsMarquee() {
  // Duplicate the list once. The CSS animation translates the inner row
  // by exactly -50%, landing the second copy where the first started.
  const items = [...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <div
      className="relative w-full overflow-hidden py-6 md:py-8"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      <div className="brands-marquee-track flex w-max items-center gap-5 md:gap-7">
        {items.map((b, i) => (
          <div
            key={`${b.name}-${i}`}
            className="flex h-20 w-40 shrink-0 items-center justify-center rounded-lg bg-white px-5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition-transform hover:scale-105 sm:h-24 sm:w-48 md:h-28 md:w-52"
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
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .brands-marquee-track {
          animation: brands-marquee-scroll 60s linear infinite;
          will-change: transform;
        }
        .brands-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .brands-marquee-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
