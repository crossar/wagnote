"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./dashboard.module.css";

const EVENT_TYPES = ["pee", "poop", "meal", "walk", "medication"];

const EVENT_META = {
  pee: {
    icon: "💧",
    color: "#9a6700",
    bg: "#fff8db",
    border: "#f4d03f",
  },
  poop: {
    icon: "💩",
    color: "#8a4b14",
    bg: "#fff1e6",
    border: "#f2b880",
  },
  meal: {
    icon: "🍖",
    color: "#166534",
    bg: "#ecfdf3",
    border: "#86efac",
  },
  walk: {
    icon: "🐾",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#93c5fd",
  },
  medication: {
    icon: "💊",
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#c4b5fd",
  },
};

export default function DashboardPage() {
  const [dogs, setDogs] = useState([]);
  const [selectedDogId, setSelectedDogId] = useState("");
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingEvent, setLoadingEvent] = useState("");
  const [deletingEventId, setDeletingEventId] = useState("");
  const [collapsedDates, setCollapsedDates] = useState({});

  async function fetchDogs() {
    const { data, error } = await supabase
      .from("dogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching dogs:", error);
      setMessage("Could not load dogs.");
      return;
    }

    const dogList = data || [];
    setDogs(dogList);

    if (dogList.length > 0 && !selectedDogId) {
      setSelectedDogId(dogList[0].id);
    }
  }

  async function fetchEvents(dogId) {
    if (!dogId) {
      setEvents([]);
      return;
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("dog_id", dogId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      setMessage("Could not load events.");
      return;
    }

    setEvents(data || []);
  }

  useEffect(() => {
    fetchDogs();
  }, []);

  useEffect(() => {
    if (selectedDogId) {
      fetchEvents(selectedDogId);
    }
  }, [selectedDogId]);

  async function handleLogEvent(type) {
    if (!selectedDogId) {
      setMessage("Please add a dog first.");
      return;
    }

    setLoadingEvent(type);
    setMessage("");

    const { error } = await supabase.from("events").insert([
      {
        dog_id: selectedDogId,
        type,
      },
    ]);

    if (error) {
      console.error("Error adding event:", error);
      setMessage("Could not log event.");
      setLoadingEvent("");
      return;
    }

    setMessage(`${type} logged!`);
    await fetchEvents(selectedDogId);
    setLoadingEvent("");
  }

  async function handleDeleteEvent(eventId) {
    setDeletingEventId(eventId);
    setMessage("");

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      console.error("Error deleting event:", error);
      setMessage("Could not delete event.");
      setDeletingEventId("");
      return;
    }

    setMessage("Event deleted.");
    await fetchEvents(selectedDogId);
    setDeletingEventId("");
  }

  function formatTime(value) {
    return new Date(value).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatDisplayDate(value) {
    const eventDate = new Date(value);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay =
      eventDate.getFullYear() === today.getFullYear() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getDate() === today.getDate();

    const sameYesterday =
      eventDate.getFullYear() === yesterday.getFullYear() &&
      eventDate.getMonth() === yesterday.getMonth() &&
      eventDate.getDate() === yesterday.getDate();

    if (sameDay) return "Today";
    if (sameYesterday) return "Yesterday";

    return eventDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getDateKey(value) {
    const eventDate = new Date(value);
    const year = eventDate.getFullYear();
    const month = String(eventDate.getMonth() + 1).padStart(2, "0");
    const day = String(eventDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function isToday(dateString) {
    const eventDate = new Date(dateString);
    const today = new Date();

    return (
      eventDate.getFullYear() === today.getFullYear() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getDate() === today.getDate()
    );
  }

  function toggleDate(dateKey) {
    setCollapsedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  }

  const selectedDog = dogs.find((dog) => dog.id === selectedDogId);

  const todaySummary = useMemo(() => {
    const summary = {
      pee: 0,
      poop: 0,
      meal: 0,
      walk: 0,
      medication: 0,
    };

    events.forEach((event) => {
      if (isToday(event.created_at) && summary[event.type] !== undefined) {
        summary[event.type] += 1;
      }
    });

    return summary;
  }, [events]);

  const groupedByDay = useMemo(() => {
    const dayGroups = {};

    events.forEach((event) => {
      const dateKey = getDateKey(event.created_at);

      if (!dayGroups[dateKey]) {
        dayGroups[dateKey] = {
          dateKey,
          displayDate: formatDisplayDate(event.created_at),
          typeGroups: {},
        };
      }

      if (!dayGroups[dateKey].typeGroups[event.type]) {
        dayGroups[dateKey].typeGroups[event.type] = {
          type: event.type,
          events: [],
        };
      }

      dayGroups[dateKey].typeGroups[event.type].events.push(event);
    });

    return Object.values(dayGroups).map((dayGroup) => ({
      ...dayGroup,
      totalLogs: Object.values(dayGroup.typeGroups).reduce(
        (sum, group) => sum + group.events.length,
        0,
      ),
      typeGroups: Object.values(dayGroup.typeGroups),
    }));
  }, [events]);

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <p className={styles.heroBadge}>Daily Dog Activity Tracker</p>
        <h1 className={styles.heroTitle}>Dashboard</h1>
        <p className={styles.heroText}>
          Log your dog’s routine in seconds and keep a compact, colorful
          timeline of potty breaks, meals, walks, and medications.
        </p>
      </section>

      {/* LAYOUT */}
      <div className={styles.grid}>
        <div className={styles.sidebar}>
          {/* CARD */}
          <section className={styles.card}>
            <label htmlFor="dog-select" className={styles.label}>
              Select Dog
            </label>

            <select
              id="dog-select"
              value={selectedDogId}
              onChange={(e) => setSelectedDogId(e.target.value)}
              className={styles.select}
            >
              {dogs.length === 0 ? (
                <option value="">No dogs added yet</option>
              ) : (
                dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))
              )}
            </select>

            {selectedDog ? (
              <div className={styles.dogCard}>
                <h2 className={styles.dogName}>{selectedDog.name}</h2>
                <p className={styles.dogMeta}>
                  Breed: {selectedDog.breed || "Not added"}
                </p>
                <p className={styles.dogMeta}>
                  Birthdate: {selectedDog.birthdate || "Not added"}
                </p>
              </div>
            ) : (
              <p className={styles.emptyText}>Add a dog first to begin.</p>
            )}
          </section>

          {/* CARD */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Quick Log</h2>

            {/* BUTTON GRID */}
            <div className={styles.buttonGrid}>
              {EVENT_TYPES.map((type) => {
                const meta = EVENT_META[type];

                return (
                  <button
                    key={type}
                    onClick={() => handleLogEvent(type)}
                    disabled={loadingEvent === type || !selectedDogId}
                    className={styles.eventBtn}
                    style={{
                      backgroundColor: meta.bg,
                      borderColor: meta.border,
                      color: meta.color,
                    }}
                  >
                    {loadingEvent === type
                      ? "Logging..."
                      : `${meta.icon} ${type}`}
                  </button>
                );
              })}
            </div>

            {message && <p className={styles.message}>{message}</p>}
          </section>

          {/* CARD */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Today Summary</h2>

            {!selectedDogId ? (
              <p className={styles.emptyText}>
                Add a dog first to see today’s summary.
              </p>
            ) : (
              <div className={styles.summaryGrid}>
                {EVENT_TYPES.map((type) => {
                  const meta = EVENT_META[type];

                  return (
                    <div
                      key={type}
                      className={styles.summaryCard}
                      style={{
                        borderColor: meta.border,
                        backgroundColor: meta.bg,
                      }}
                    >
                      <div className={styles.summaryLabel}>
                        {meta.icon}{" "}
                        <span
                          className={styles.summaryLabelText}
                          style={{ color: meta.color }}
                        >
                          {type}
                        </span>
                      </div>
                      <p
                        className={styles.summaryCount}
                        style={{ color: meta.color }}
                      >
                        {todaySummary[type]}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* CARD */}
        <section className={styles.card}>
          <h2 className={styles.timelineTitle}>Timeline</h2>

          {!selectedDogId ? (
            <p className={styles.emptyText}>
              Add a dog first to start logging.
            </p>
          ) : groupedByDay.length === 0 ? (
            <p className={styles.emptyText}>No events logged yet.</p>
          ) : (
            <div className={styles.timelineList}>
              {groupedByDay.map((dayGroup) => {
                const isCollapsed = collapsedDates[dayGroup.dateKey];

                return (
                  <div key={dayGroup.dateKey} className={styles.timelineGroup}>
                    <button
                      onClick={() => toggleDate(dayGroup.dateKey)}
                      className={styles.timelineHeader}
                    >
                      <div>
                        <h3 className={styles.timelineDate}>
                          {dayGroup.displayDate}
                        </h3>
                        <p className={styles.timelineCount}>
                          {dayGroup.totalLogs} log
                          {dayGroup.totalLogs > 1 ? "s" : ""}
                        </p>
                      </div>

                      <span
                        className={`${styles.timelineArrow} ${
                          isCollapsed ? styles.timelineArrowCollapsed : ""
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                    {!isCollapsed && (
                      <div className={styles.timelineContent}>
                        {dayGroup.typeGroups.map((group) => {
                          const meta = EVENT_META[group.type];

                          return (
                            <div
                              key={`${dayGroup.dateKey}-${group.type}`}
                              className={styles.typeCard}
                              style={{
                                backgroundColor: meta.bg,
                                borderColor: meta.border,
                              }}
                            >
                              <div className={styles.typeHeader}>
                                <div
                                  className={styles.typeIcon}
                                  style={{ borderColor: meta.border }}
                                >
                                  {meta.icon}
                                </div>

                                <div>
                                  <p
                                    className={styles.typeName}
                                    style={{ color: meta.color }}
                                  >
                                    {group.type}
                                  </p>
                                  <p className={styles.typeCount}>
                                    {group.events.length} time
                                    {group.events.length > 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>

                              <div className={styles.chipWrap}>
                                {group.events.map((event) => (
                                  <div
                                    key={event.id}
                                    className={styles.timeChip}
                                    style={{ borderColor: meta.border }}
                                  >
                                    <span className={styles.timeText}>
                                      {formatTime(event.created_at)}
                                    </span>

                                    <button
                                      onClick={() =>
                                        handleDeleteEvent(event.id)
                                      }
                                      disabled={deletingEventId === event.id}
                                      className={styles.deleteChipBtn}
                                      title="Delete this log"
                                    >
                                      {deletingEventId === event.id
                                        ? "..."
                                        : "×"}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
