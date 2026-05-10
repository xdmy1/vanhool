import Image from "next/image";

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
 * Infinite horizontal marquee showing supplier brand logos.
 *
 * Implementation notes:
 *  - Logos are duplicated once and translated by -50% via CSS animation,
 *    creating a seamless loop without JavaScript.
 *  - Each logo sits inside a white pill so the white-background
 *    artwork from the source CDN doesn't clash with the surface color.
 *  - Edge gradients (mask-image) fade the strip in and out so it reads
 *    as one continuous flow, not a clipped band.
 *  - Pauses on hover for accessibility / read-the-name moments.
 */
export function BrandsMarquee() {
  // Duplicate the list once. The CSS animation translates the inner row
  // by exactly -50%, landing the second copy where the first started.
  const items = [...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      <div className="brands-marquee-track flex w-max items-center gap-4 py-4 md:gap-6 md:py-6">
        {items.map((b, i) => (
          <div
            key={`${b.name}-${i}`}
            className="grid h-12 w-28 shrink-0 place-items-center rounded-md border border-white/15 bg-white/95 px-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform hover:scale-[1.04] sm:h-14 sm:w-32 md:h-16 md:w-36"
            title={b.name}
          >
            <Image
              src={b.url}
              alt={b.name}
              width={144}
              height={64}
              className="h-full w-full object-contain p-1.5"
              loading="lazy"
              unoptimized
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
          animation: brands-marquee-scroll 50s linear infinite;
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
