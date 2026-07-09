import Script from "next/script";

/**
 * GA4 for inter-bus.md. Measurement ID is public (it ships in the client
 * gtag anyway), so it's hardcoded as the default; NEXT_PUBLIC_GA_ID can still
 * override it. No consent banner for basic config in MD; revisit if EU traffic
 * becomes significant.
 */
const DEFAULT_GA_ID = "G-63CKTXGHXK";

export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID || DEFAULT_GA_ID;
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
