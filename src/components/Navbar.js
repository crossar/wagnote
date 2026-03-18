import Link from "next/link";

export default function Navbar() {
  const linkStyle = {
    padding: "0.65rem 1rem",
    borderRadius: "10px",
    textDecoration: "none",
    color: "#1f2937",
    fontWeight: "bold",
    fontSize: "0.95rem",
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "rgba(247, 244, 238, 0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0.9rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#111827",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          WagNote
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" style={linkStyle}>
            Home
          </Link>
          <Link href="/dogs" style={linkStyle}>
            Dogs
          </Link>
          <Link href="/dashboard" style={linkStyle}>
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
