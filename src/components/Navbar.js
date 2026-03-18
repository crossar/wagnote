"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dogs", label: "Dogs" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkScreen() {
      setIsMobile(window.innerWidth <= 768);
    }

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function isActive(href) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function getLinkStyle(href, mobile = false) {
    const active = isActive(href);

    return {
      display: "block",
      width: mobile ? "100%" : "auto",
      padding: "0.75rem 1rem",
      borderRadius: "10px",
      textDecoration: "none",
      fontWeight: "bold",
      fontSize: "0.95rem",
      transition: "all 0.2s ease",
      backgroundColor: active ? "#111827" : "transparent",
      color: active ? "#ffffff" : "#1f2937",
      border: active ? "1px solid #111827" : "1px solid transparent",
      textAlign: mobile ? "left" : "center",
    };
  }

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
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
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

          {isMobile ? (
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              style={{
                border: "1px solid #d1d5db",
                backgroundColor: "#fff",
                color: "#111827",
                borderRadius: "10px",
                width: "44px",
                minWidth: "44px",
                height: "44px",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          ) : (
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={getLinkStyle(item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {isMobile && menuOpen && (
          <nav
            style={{
              display: "grid",
              gap: "0.5rem",
              marginTop: "1rem",
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={getLinkStyle(item.href, true)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
