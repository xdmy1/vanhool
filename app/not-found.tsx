import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="ro">
      <body style={{ background: "#0a0a0a", color: "#fafafa", minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#d04941", letterSpacing: "0.3em", fontSize: 11, textTransform: "uppercase" }}>404</p>
          <h1 style={{ fontSize: 40, margin: "8px 0 4px" }}>Not found</h1>
          <Link href="/ro" style={{ color: "#d04941" }}>← Acasă</Link>
        </div>
      </body>
    </html>
  );
}
