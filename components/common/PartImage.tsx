import { cn } from "@/lib/utils/cn";

type Variant =
  | "brake"
  | "engine"
  | "chassis"
  | "electro"
  | "air"
  | "body"
  | "clutch"
  | "steering"
  | "cooling"
  | "interior"
  | "hoses"
  | "couplings"
  | "filter"
  | "sensor"
  | "pump";

// Renders the real product photo if `imageUrl` is provided, otherwise falls
// back to a category-themed SVG illustration.
export function PartImage({
  variant,
  imageUrl,
  alt,
  className,
}: {
  variant: Variant;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
}) {
  const trimmed = imageUrl?.trim();
  if (trimmed) {
    return (
      <div
        className={cn(
          "relative h-full w-full overflow-hidden bg-surface",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trimmed}
          alt={alt ?? ""}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative grid h-full w-full place-items-center bg-surface",
        "overflow-hidden",
        className,
      )}
    >
      <svg
        viewBox="0 0 120 120"
        className="h-3/5 w-3/5 text-muted"
        fill="none"
        strokeWidth="2.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {renderPath(variant)}
      </svg>
    </div>
  );
}

function renderPath(variant: Variant) {
  switch (variant) {
    case "brake":
      return (
        <>
          <circle cx="60" cy="60" r="38" />
          <circle cx="60" cy="60" r="22" />
          <circle cx="60" cy="60" r="6" fill="currentColor" />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI) / 4;
            const x1 = 60 + Math.cos(angle) * 24;
            const y1 = 60 + Math.sin(angle) * 24;
            const x2 = 60 + Math.cos(angle) * 36;
            const y2 = 60 + Math.sin(angle) * 36;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </>
      );
    case "engine":
      return (
        <>
          <rect x="20" y="34" width="80" height="52" rx="4" />
          <line x1="36" y1="34" x2="36" y2="22" />
          <line x1="50" y1="34" x2="50" y2="22" />
          <line x1="64" y1="34" x2="64" y2="22" />
          <line x1="78" y1="34" x2="78" y2="22" />
          <rect x="30" y="24" width="54" height="10" rx="1" />
          <line x1="24" y1="50" x2="96" y2="50" />
          <line x1="24" y1="70" x2="96" y2="70" />
          <circle cx="36" cy="60" r="3" fill="currentColor" />
          <circle cx="84" cy="60" r="3" fill="currentColor" />
        </>
      );
    case "chassis":
    case "steering":
      return (
        <>
          <circle cx="32" cy="84" r="14" />
          <circle cx="32" cy="84" r="5" fill="currentColor" />
          <circle cx="88" cy="84" r="14" />
          <circle cx="88" cy="84" r="5" fill="currentColor" />
          <line x1="32" y1="84" x2="88" y2="84" />
          <path d="M20 60 L42 60 L60 30 L78 60 L100 60" />
        </>
      );
    case "electro":
      return (
        <>
          <rect x="28" y="30" width="64" height="50" rx="4" />
          <line x1="40" y1="30" x2="40" y2="20" />
          <line x1="80" y1="30" x2="80" y2="20" />
          <rect x="36" y="24" width="10" height="6" />
          <rect x="74" y="24" width="10" height="6" />
          <path d="M44 55 L54 45 L54 60 L66 50 L66 65 L76 55" stroke="currentColor" />
          <line x1="30" y1="96" x2="90" y2="96" />
        </>
      );
    case "air":
    case "couplings":
      return (
        <>
          <circle cx="60" cy="60" r="28" />
          <line x1="60" y1="32" x2="60" y2="18" />
          <line x1="60" y1="88" x2="60" y2="102" />
          <line x1="32" y1="60" x2="18" y2="60" />
          <line x1="88" y1="60" x2="102" y2="60" />
          <circle cx="60" cy="60" r="10" />
          <circle cx="60" cy="60" r="3" fill="currentColor" />
        </>
      );
    case "body":
      return (
        <>
          <path d="M14 72 L14 42 L26 24 L94 24 L106 42 L106 72 Z" />
          <line x1="14" y1="52" x2="106" y2="52" />
          <rect x="30" y="30" width="14" height="18" />
          <rect x="52" y="30" width="14" height="18" />
          <rect x="74" y="30" width="14" height="18" />
          <circle cx="32" cy="82" r="10" />
          <circle cx="88" cy="82" r="10" />
        </>
      );
    case "clutch":
      return (
        <>
          <circle cx="60" cy="60" r="34" />
          <circle cx="60" cy="60" r="18" />
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * Math.PI) / 3;
            const x = 60 + Math.cos(angle) * 26;
            const y = 60 + Math.sin(angle) * 26;
            return <circle key={i} cx={x} cy={y} r="3" fill="currentColor" />;
          })}
        </>
      );
    case "cooling":
      return (
        <>
          <rect x="22" y="26" width="76" height="68" rx="3" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={28 + i * 8} y1="30" x2={28 + i * 8} y2="90" />
          ))}
          <line x1="22" y1="44" x2="98" y2="44" />
          <line x1="22" y1="76" x2="98" y2="76" />
        </>
      );
    case "interior":
      return (
        <>
          <path d="M30 90 L30 50 Q30 34 46 34 L74 34 Q90 34 90 50 L90 90" />
          <rect x="26" y="90" width="68" height="10" rx="2" />
          <line x1="40" y1="50" x2="80" y2="50" />
        </>
      );
    case "hoses":
      return (
        <>
          <path d="M20 40 Q40 20 60 40 T100 40" />
          <path d="M20 60 Q40 40 60 60 T100 60" />
          <path d="M20 80 Q40 60 60 80 T100 80" />
        </>
      );
    case "filter":
      return (
        <>
          <ellipse cx="60" cy="32" rx="22" ry="7" />
          <path d="M38 32 L38 92 Q38 98 60 98 Q82 98 82 92 L82 32" />
          <line x1="44" y1="50" x2="76" y2="50" />
          <line x1="44" y1="66" x2="76" y2="66" />
          <line x1="44" y1="82" x2="76" y2="82" />
        </>
      );
    case "sensor":
      return (
        <>
          <rect x="40" y="22" width="40" height="70" rx="6" />
          <line x1="60" y1="92" x2="60" y2="104" />
          <circle cx="60" cy="40" r="7" fill="currentColor" />
          <line x1="50" y1="60" x2="70" y2="60" />
          <line x1="50" y1="72" x2="70" y2="72" />
        </>
      );
    case "pump":
      return (
        <>
          <circle cx="60" cy="60" r="30" />
          <circle cx="60" cy="60" r="14" />
          <line x1="60" y1="30" x2="60" y2="14" />
          <line x1="60" y1="90" x2="60" y2="106" />
          <path d="M60 46 L70 60 L60 74 L50 60 Z" fill="currentColor" />
        </>
      );
  }
}
