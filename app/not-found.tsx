import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="ro">
      <body style={{ background: "#ece9e2", color: "#2a2622", minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#c0392b", fontSize: 14, fontWeight: 600 }}>404</p>
          <h1 style={{ fontSize: 40, margin: "8px 0 4px" }}>Not found</h1>
          <Link href="/ro" style={{ color: "#c0392b" }}>← Acasă</Link>
        </div>
      </body>
    </html>
  );
}
