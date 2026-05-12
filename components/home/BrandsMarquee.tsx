const BRAND_LOGOS = [
  { name: "Knorr-Bremse", url: "https://shop.mits-automotive.be/images/thumbs/0001869_knorr-bremse_345.png" },
  { name: "Wabco", url: "https://shop.mits-automotive.be/images/thumbs/0001870_wabco_345.jpeg" },
  { name: "Haldex", url: "https://shop.mits-automotive.be/images/thumbs/0001871_haldex_345.png" },
  { name: "Wilke", url: "https://shop.mits-automotive.be/images/thumbs/0002413_wilke_345.png" },
  { name: "Van Hool", url: "https://shop.mits-automotive.be/images/thumbs/0001872_van-hool_345.png" },
  { name: "Bosch", url: "https://shop.mits-automotive.be/images/thumbs/0001873_bosch_345.jpeg" },
  { name: "Hella", url: "https://shop.mits-automotive.be/images/thumbs/0001874_hella_345.png" },
  { name: "Mann-Filter", url: "https://shop.mits-automotive.be/images/thumbs/0001875_mann-filter_345.png" },
  { name: "Eberspächer", url: "https://shop.mits-automotive.be/images/thumbs/0001876_eberspacher_345.png" },
  { name: "Koni", url: "https://shop.mits-automotive.be/images/thumbs/0001877_koni_345.png" },
  { name: "Varta", url: "https://shop.mits-automotive.be/images/thumbs/0001878_varta_345.png" },
  { name: "SWF", url: "https://shop.mits-automotive.be/images/thumbs/0001880_swf_345.png" },
  { name: "ContiTech", url: "https://shop.mits-automotive.be/images/thumbs/0001879_contitech_345.png" },
  { name: "Sachs", url: "https://shop.mits-automotive.be/images/thumbs/0001881_sachs_345.png" },
  { name: "Gates", url: "https://shop.mits-automotive.be/images/thumbs/0001882_gates_345.png" },
  { name: "Knecht", url: "https://shop.mits-automotive.be/images/thumbs/0001883_knecht_345.png" },
  { name: "Van Wezel", url: "https://shop.mits-automotive.be/images/thumbs/0001885_van-wezel_345.png" },
  { name: "Monroe", url: "https://shop.mits-automotive.be/images/thumbs/0001886_monroe_345.png" },
  { name: "Textar", url: "https://shop.mits-automotive.be/images/thumbs/0001887_textar_345.png" },
  { name: "Dayco", url: "https://shop.mits-automotive.be/images/thumbs/0001888_dayco_345.png" },
  { name: "Jurid", url: "https://shop.mits-automotive.be/images/thumbs/0001889_jurid_345.png" },
  { name: "SKF", url: "https://shop.mits-automotive.be/images/thumbs/0001890_skf_345.png" },
  { name: "Behr", url: "https://shop.mits-automotive.be/images/thumbs/0001891_behr_345.png" },
  { name: "Herth+Buss Elparts", url: "https://shop.mits-automotive.be/images/thumbs/0001892_herthbuss-elparts_345.png" },
  { name: "Ferodo", url: "https://shop.mits-automotive.be/images/thumbs/0001893_ferodo_345.png" },
  { name: "PE Automotive", url: "https://shop.mits-automotive.be/images/thumbs/0001894_pe-automotive_345.png" },
  { name: "Optibelt", url: "https://shop.mits-automotive.be/images/thumbs/0001895_optibelt_345.png" },
  { name: "Brembo", url: "https://shop.mits-automotive.be/images/thumbs/0001896_brembo_345.png" },
  { name: "Osram", url: "https://shop.mits-automotive.be/images/thumbs/0001897_osram_345.png" },
  { name: "ZF", url: "https://shop.mits-automotive.be/images/thumbs/0001898_zf_345.png" },
  { name: "Mintex", url: "https://shop.mits-automotive.be/images/thumbs/0001899_mintex_345.png" },
  { name: "Hengst", url: "https://shop.mits-automotive.be/images/thumbs/0001900_hengst_345.png" },
  { name: "VDO", url: "https://shop.mits-automotive.be/images/thumbs/0001901_vdo_345.png" },
  { name: "AL-KO", url: "https://shop.mits-automotive.be/images/thumbs/0001902_alko_345.png" },
  { name: "Febi Bilstein", url: "https://shop.mits-automotive.be/images/thumbs/0001903_febi-bilstein_345.png" },
  { name: "Delco Remy", url: "https://shop.mits-automotive.be/images/thumbs/0001904_delco-remy_345.png" },
  { name: "Stabilus", url: "https://shop.mits-automotive.be/images/thumbs/0001905_stabilus_345.png" },
  { name: "Moog", url: "https://shop.mits-automotive.be/images/thumbs/0001906_moog_345.png" },
  { name: "Goodyear", url: "https://shop.mits-automotive.be/images/thumbs/0001907_goodyear_345.png" },
  { name: "FAG", url: "https://shop.mits-automotive.be/images/thumbs/0001908_fag_345.png" },
  { name: "INA", url: "https://shop.mits-automotive.be/images/thumbs/0001909_ina_345.png" },
  { name: "Timken", url: "https://shop.mits-automotive.be/images/thumbs/0001910_timken_345.png" },
  { name: "BorgWarner", url: "https://shop.mits-automotive.be/images/thumbs/0001912_borgwarner_345.png" },
  { name: "Meritor", url: "https://shop.mits-automotive.be/images/thumbs/0001913_meritor_345.png" },
  { name: "DT Spare Parts", url: "https://shop.mits-automotive.be/images/thumbs/0001914_dt_345.png" },
  { name: "Webasto", url: "https://shop.mits-automotive.be/images/thumbs/0001915_webasto_345.png" },
  { name: "Spheros", url: "https://shop.mits-automotive.be/images/thumbs/0001916_spheros_345.png" },
  { name: "Hispacold", url: "https://shop.mits-automotive.be/images/thumbs/0001917_hispacold_345.png" },
  { name: "Iveco", url: "https://shop.mits-automotive.be/images/thumbs/0001918_iveco_345.png" },
  { name: "Weweler", url: "https://shop.mits-automotive.be/images/thumbs/0001919_weweler_345.png" },
  { name: "Kongsberg", url: "https://shop.mits-automotive.be/images/thumbs/0001920_kongsberg_345.png" },
  { name: "Sesaly", url: "https://shop.mits-automotive.be/images/thumbs/0001921_sesaly_345.png" },
  { name: "Linnig", url: "https://shop.mits-automotive.be/images/thumbs/0001922_linnig_345.png" },
  { name: "MAN", url: "https://shop.mits-automotive.be/images/thumbs/0001923_man_345.png" },
  { name: "Holset", url: "https://shop.mits-automotive.be/images/thumbs/0001924_holset_345.png" },
  { name: "Mekra", url: "https://shop.mits-automotive.be/images/thumbs/0001925_mekra_345.png" },
  { name: "Arcol", url: "https://shop.mits-automotive.be/images/thumbs/0001926_arcol_345.png" },
  { name: "Dana", url: "https://shop.mits-automotive.be/images/thumbs/0001927_dana_345.png" },
  { name: "Garrett", url: "https://shop.mits-automotive.be/images/thumbs/0001929_garrett_345.png" },
  { name: "DAF", url: "https://shop.mits-automotive.be/images/thumbs/0001930_daf_345.png" },
  { name: "Volvo", url: "https://shop.mits-automotive.be/images/thumbs/0001931_volvo_345.png" },
  { name: "Matador", url: "https://shop.mits-automotive.be/images/thumbs/0001932_matador_345.png" },
  { name: "Mercedes-Benz", url: "https://shop.mits-automotive.be/images/thumbs/0001933_mercedes_345.png" },
  { name: "Intertruck", url: "https://shop.mits-automotive.be/images/thumbs/0001934_intertruck_345.png" },
  { name: "Voith", url: "https://shop.mits-automotive.be/images/thumbs/0001935_voith_345.png" },
  { name: "Knott", url: "https://shop.mits-automotive.be/images/thumbs/0001936_knott_345.png" },
  { name: "MGM", url: "https://shop.mits-automotive.be/images/thumbs/0001937_mgm_345.png" },
  { name: "Temsa", url: "https://shop.mits-automotive.be/images/thumbs/0001938_temsa_345.png" },
  { name: "Heavac", url: "https://shop.mits-automotive.be/images/thumbs/0001939_heavac_345.png" },
  { name: "TRP", url: "https://shop.mits-automotive.be/images/thumbs/0002351_trp_345.png" },
  { name: "VDL", url: "https://shop.mits-automotive.be/images/thumbs/0002409_vdl_345.png" },
  { name: "Dieseltech", url: "https://shop.mits-automotive.be/images/thumbs/0879301_dieseltech_345.jpeg" },
  { name: "DON", url: "https://shop.mits-automotive.be/images/thumbs/0007556_don_345.jpeg" },
  { name: "Phoenix", url: "https://shop.mits-automotive.be/images/thumbs/0007557_phoenix_345.jpeg" },
  { name: "Mitsubishi", url: "https://shop.mits-automotive.be/images/thumbs/0007558_mitsubishi_345.png" },
  { name: "Airtech", url: "https://shop.mits-automotive.be/images/thumbs/0007559_airtech_345.jpeg" },
  { name: "Valeo", url: "https://shop.mits-automotive.be/images/thumbs/0007561_valeo_345.jpeg" },
  { name: "Prestolite", url: "https://shop.mits-automotive.be/images/thumbs/0007562_prestolite_345.png" },
  { name: "Everkraft", url: "https://shop.mits-automotive.be/images/thumbs/0007564_everkraft_345.png" },
  { name: "ATE", url: "https://shop.mits-automotive.be/images/thumbs/0007565_ate_345.png" },
  { name: "Cummins", url: "https://shop.mits-automotive.be/images/thumbs/0007566_cummins_345.png" },
  { name: "Grantex", url: "https://shop.mits-automotive.be/images/thumbs/0007567_grantex_345.jpeg" },
  { name: "Firestone", url: "https://shop.mits-automotive.be/images/thumbs/0007568_firestone_345.png" },
  { name: "Samrev", url: "https://shop.mits-automotive.be/images/thumbs/0007569_samrev_345.jpeg" },
  { name: "Fras-le", url: "https://shop.mits-automotive.be/images/thumbs/0007570_frasle_345.png" },
  { name: "Kawe", url: "https://shop.mits-automotive.be/images/thumbs/0007571_kawe_345.jpeg" },
  { name: "BTT", url: "https://shop.mits-automotive.be/images/thumbs/0007572_btt_345.png" },
  { name: "Heyd", url: "https://shop.mits-automotive.be/images/thumbs/0007574_heyd_345.png" },
  { name: "Essantra", url: "https://shop.mits-automotive.be/images/thumbs/0007573_essantra_345.png" },
  { name: "Raufoss", url: "https://shop.mits-automotive.be/images/thumbs/0007653_raufoss_345.jpeg" },
  { name: "Eaton", url: "https://shop.mits-automotive.be/images/thumbs/0007655_eaton_345.png" },
  { name: "Mahle", url: "https://shop.mits-automotive.be/images/thumbs/0007964_mahle_345.png" },
  { name: "Lemförder", url: "https://shop.mits-automotive.be/images/thumbs/0007965_lemforder_345.png" },
  { name: "Jokon", url: "https://shop.mits-automotive.be/images/thumbs/0010319_jokon_345.png" },
  { name: "Thermo King", url: "https://shop.mits-automotive.be/images/thumbs/0008640_thermoking_345.png" },
  { name: "Bürkert", url: "https://shop.mits-automotive.be/images/thumbs/0008804_burkert_345.png" },
  { name: "Ruspa", url: "https://shop.mits-automotive.be/images/thumbs/0009033_ruspa_345.png" },
  { name: "Fleetguard", url: "https://shop.mits-automotive.be/images/thumbs/0010181_fleetguard_345.jpeg" },
  { name: "Teknoware", url: "https://shop.mits-automotive.be/images/thumbs/0010318_teknoware_345.jpeg" },
  { name: "TRW", url: "https://shop.mits-automotive.be/images/thumbs/0879300_trw_345.png" },
  { name: "Norgren", url: "https://shop.mits-automotive.be/images/thumbs/0012016_norgren_345.png" },
  { name: "NRF", url: "https://shop.mits-automotive.be/images/thumbs/0871007_nrf_345.png" },
  { name: "Legris", url: "https://shop.mits-automotive.be/images/thumbs/0871784_legris_345.jpeg" },
  { name: "Lema", url: "https://shop.mits-automotive.be/images/thumbs/0879276_lema_345.png" },
  { name: "Purro", url: "https://shop.mits-automotive.be/images/thumbs/0879279_purro_345.jpeg" },
  { name: "Reinhoch", url: "https://shop.mits-automotive.be/images/thumbs/0879283_reinhoch_345.jpeg" },
  { name: "Dinex", url: "https://shop.mits-automotive.be/images/thumbs/0879296_dinex_345.jpeg" },
  { name: "OMP", url: "https://shop.mits-automotive.be/images/thumbs/0879620_omp_345.jpeg" },
  { name: "Herth+Buss", url: "https://shop.mits-automotive.be/images/thumbs/0879758_herthbuss_345.png" },
  { name: "Solaris", url: "https://shop.mits-automotive.be/images/thumbs/0879759_solaris_345.png" },
  { name: "Vitesco", url: "https://shop.mits-automotive.be/images/thumbs/0879769_vitesco_345.png" },
  { name: "Turck", url: "https://shop.mits-automotive.be/images/thumbs/0879771_turck_345.png" },
  { name: "Rosero", url: "https://shop.mits-automotive.be/images/thumbs/0879819_rosero_345.png" },
  { name: "Separ Filter", url: "https://shop.mits-automotive.be/images/thumbs/0879847_separ-filter_345.png" },
  { name: "Aurora", url: "https://shop.mits-automotive.be/images/thumbs/0879851_aurora_345.jpeg" },
  { name: "Scania", url: "https://shop.mits-automotive.be/images/thumbs/0879887_scania_345.png" },
  { name: "Siemens", url: "https://shop.mits-automotive.be/images/thumbs/0879944_siemens_345.png" },
  { name: "Kormas", url: "https://shop.mits-automotive.be/images/thumbs/0880298_kormas_345.png" },
  { name: "Kiel", url: "https://shop.mits-automotive.be/images/thumbs/0880335_kiel_345.png" },
  { name: "CEI", url: "https://shop.mits-automotive.be/images/thumbs/0880481_cei_345.png" },
  { name: "Safe Wheel", url: "https://shop.mits-automotive.be/images/thumbs/0880547_safe-wheel_345.jpeg" },
  { name: "Sanden", url: "https://shop.mits-automotive.be/images/thumbs/0880548_sanden_345.png" },
  { name: "TruckLight", url: "https://shop.mits-automotive.be/images/thumbs/0880562_trucklight_345.png" },
  { name: "TitanX", url: "https://shop.mits-automotive.be/images/thumbs/0880586_titanx_345.jpeg" },
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
  // Split brands disjointly between the two rows — no brand appears in both
  // rows, so the eye never catches the same logo passing twice on screen.
  const half = Math.ceil(BRAND_LOGOS.length / 2);
  const topItems = BRAND_LOGOS.slice(0, half);
  const bottomItems = BRAND_LOGOS.slice(half).reverse();

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
