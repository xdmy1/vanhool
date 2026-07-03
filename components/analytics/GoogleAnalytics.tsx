import Script from "next/script";

/**
 * GA4 — dormant until NEXT_PUBLIC_GA_ID is set (e.g. G-XXXXXXXXXX).
 * No consent banner needed for basic config in MD; revisit if EU
 * traffic becomes significant.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
