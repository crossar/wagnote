import Link from "next/link";
import styles from "./home.module.css";

const features = [
  {
    title: "Potty Logs",
    text: "Track pee and poop events quickly so you can spot daily patterns without endless scrolling.",
    icon: "💧",
    bg: "#fff8db",
    border: "#f4d03f",
  },
  {
    title: "Meal Tracking",
    text: "Keep a simple record of feeding times and daily routines for puppies, adults, or seniors.",
    icon: "🍖",
    bg: "#ecfdf3",
    border: "#86efac",
  },
  {
    title: "Walks & Meds",
    text: "Log walks, medications, and care tasks in one compact dashboard built for dog owners.",
    icon: "🐾",
    bg: "#eff6ff",
    border: "#93c5fd",
  },
];

const previewEvents = [
  {
    type: "Pee",
    time: "8:12 AM",
    icon: "💧",
    bg: "#fff8db",
    border: "#f4d03f",
    color: "#9a6700",
  },
  {
    type: "Meal",
    time: "9:00 AM",
    icon: "🍖",
    bg: "#ecfdf3",
    border: "#86efac",
    color: "#166534",
  },
  {
    type: "Walk",
    time: "12:30 PM",
    icon: "🐾",
    bg: "#eff6ff",
    border: "#93c5fd",
    color: "#1d4ed8",
  },
  {
    type: "Medication",
    time: "6:45 PM",
    icon: "💊",
    bg: "#f5f3ff",
    border: "#c4b5fd",
    color: "#6d28d9",
  },
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <p className={styles.heroBadge}>
          🐶 Simple daily tracking for dog owners
        </p>

        <h1 className={styles.heroTitle}>WagNote</h1>

        <p className={styles.heroText}>
          Track potty breaks, meals, walks, and medications in one simple place.
          Built for busy dog owners who want a clean, useful daily log.
        </p>

        <div className={styles.heroActions}>
          <Link href="/dogs" className={styles.primaryBtn}>
            Get Started
          </Link>

          <Link href="/dashboard" className={styles.secondaryBtn}>
            Open Dashboard
          </Link>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className={styles.featureGrid}>
        {features.map((feature) => (
          <div key={feature.title} className={styles.featureCard}>
            <div
              className={styles.featureIcon}
              style={{
                backgroundColor: feature.bg,
                border: `1px solid ${feature.border}`,
              }}
            >
              {feature.icon}
            </div>

            <h2 className={styles.featureTitle}>{feature.title}</h2>
            <p className={styles.featureText}>{feature.text}</p>
          </div>
        ))}
      </section>

      {/* PREVIEW */}
      <section className={styles.previewCard}>
        <div className={styles.previewHeader}>
          <div>
            <h2 className={styles.previewTitle}>
              A cleaner dog routine dashboard
            </h2>
            <p className={styles.previewSubtext}>
              Compact logs, quick actions, and a timeline you can actually read.
            </p>
          </div>
        </div>

        <div className={styles.previewGrid}>
          <div className={styles.previewPanel}>
            <h3 className={styles.previewDogName}>Mochi</h3>
            <p className={styles.previewDogMeta}>Breed: Dachshund</p>
            <p className={styles.previewDogMeta}>Birthdate: 2026-03-01</p>

            <div className={styles.previewQuickGrid}>
              <div className={styles.previewQuickCard}>
                <p className={styles.previewQuickLabel}>Today’s Pee</p>
                <p className={styles.previewQuickValue}>3 logs</p>
              </div>
              <div className={styles.previewQuickCard}>
                <p className={styles.previewQuickLabel}>Meals</p>
                <p className={styles.previewQuickValue}>2 logs</p>
              </div>
              <div className={styles.previewQuickCard}>
                <p className={styles.previewQuickLabel}>Walks</p>
                <p className={styles.previewQuickValue}>1 log</p>
              </div>
              <div className={styles.previewQuickCard}>
                <p className={styles.previewQuickLabel}>Meds</p>
                <p className={styles.previewQuickValue}>1 log</p>
              </div>
            </div>
          </div>

          <div className={styles.timelineWrap}>
            {previewEvents.map((event) => (
              <div
                key={`${event.type}-${event.time}`}
                className={styles.timelineRow}
                style={{
                  backgroundColor: event.bg,
                  borderColor: event.border,
                }}
              >
                <div className={styles.timelineLeft}>
                  <div
                    className={styles.timelineIcon}
                    style={{ border: `1px solid ${event.border}` }}
                  >
                    {event.icon}
                  </div>

                  <div>
                    <p
                      className={styles.timelineLabel}
                      style={{ color: event.color }}
                    >
                      {event.type}
                    </p>
                    <p className={styles.timelineMeta}>Logged in WagNote</p>
                  </div>
                </div>

                <p className={styles.timelineTime}>{event.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
