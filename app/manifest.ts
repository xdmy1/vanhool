import type { MetadataRoute } from "next";

/**
 * Web App Manifest — read by Android Chrome / Edge / Firefox when a visitor
 * picks "Add to Home Screen". The icons here back the launcher shortcut;
 * `display: standalone` makes the app open without browser chrome, the way
 * native apps do.
 *
 * Icons are served by the convention-based routes in app/icon.tsx (256px)
 * and app/apple-icon.tsx (180px). We also reference the original SVG as a
 * scalable fallback so devtools / chrome://flags previews look crisp.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Inter Bus — Piese auto pentru autobuze",
    short_name: "Inter Bus",
    description:
      "Piese auto pentru autobuze, microbuze, camioane. Stoc propriu în Chișinău.",
    start_url: "/",
    display: "standalone",
    background_color: "#ece9e2",
    theme_color: "#ece9e2",
    icons: [
      {
        src: "/icon",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
