export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "3rem 1.5rem",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f7f4ee",
        color: "#1f2937",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p
          style={{
            display: "inline-block",
            marginBottom: "1rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "999px",
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            fontSize: "0.9rem",
          }}
        >
          🐶 Simple daily tracking for dog owners
        </p>

        <h1
          style={{
            fontSize: "3rem",
            lineHeight: "1.1",
            marginBottom: "1rem",
          }}
        >
          WagNote
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            lineHeight: "1.7",
            maxWidth: "650px",
            margin: "0 auto 2rem",
            color: "#4b5563",
          }}
        >
          Track potty breaks, meals, walks, and medications in one simple place.
          Built for busy dog owners who just want a clear daily log.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "3rem",
          }}
        >
          <button
            style={{
              padding: "0.9rem 1.4rem",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#111827",
              color: "#fff",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Get Started
          </button>

          <button
            style={{
              padding: "0.9rem 1.4rem",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              backgroundColor: "#fff",
              color: "#111827",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            See How It Works
          </button>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            textAlign: "left",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "1.25rem",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2 style={{ marginBottom: "0.5rem" }}>Potty Logs</h2>
            <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
              Log pee and poop events quickly so you can spot daily patterns.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              padding: "1.25rem",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2 style={{ marginBottom: "0.5rem" }}>Meal Tracking</h2>
            <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
              Keep a simple record of feeding times and notes.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              padding: "1.25rem",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2 style={{ marginBottom: "0.5rem" }}>Walks & Meds</h2>
            <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
              Track walks, medications, and daily care without spreadsheet
              goblins.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
