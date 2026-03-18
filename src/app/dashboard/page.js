"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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
    <main
      style={{
        padding: "2rem 1rem 3rem",
        maxWidth: "1100px",
        margin: "0 auto",
        color: "#18212f",
      }}
    >
      <section
        style={{
          marginBottom: "1.5rem",
          padding: "1.5rem",
          borderRadius: "24px",
          background:
            "linear-gradient(135deg, #fffdf8 0%, #f7f4ee 55%, #f1efe8 100%)",
          border: "1px solid #e9e2d7",
          boxShadow: "0 10px 30px rgba(24, 33, 47, 0.06)",
        }}
      >
        <p
          style={{
            display: "inline-block",
            marginBottom: "0.9rem",
            padding: "0.35rem 0.7rem",
            borderRadius: "999px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            color: "#6b7280",
            fontSize: "0.85rem",
            fontWeight: "bold",
          }}
        >
          Daily Dog Activity Tracker
        </p>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            marginBottom: "0.4rem",
            lineHeight: 1.05,
          }}
        >
          Dashboard
        </h1>

        <p
          style={{
            color: "#5b6472",
            fontSize: "1rem",
            maxWidth: "680px",
            lineHeight: 1.65,
          }}
        >
          Log your dog’s routine in seconds and keep a compact, colorful
          timeline of potty breaks, meals, walks, and medications.
        </p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 340px) minmax(0, 1fr)",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <section
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              padding: "1.25rem",
              boxShadow: "0 10px 30px rgba(24, 33, 47, 0.05)",
            }}
          >
            <label
              htmlFor="dog-select"
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "0.75rem",
                color: "#243041",
              }}
            >
              Select Dog
            </label>

            <select
              id="dog-select"
              value={selectedDogId}
              onChange={(e) => setSelectedDogId(e.target.value)}
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: "14px",
                border: "1px solid #d1d5db",
                backgroundColor: "#fff",
                color: "#111827",
                marginBottom: "1rem",
              }}
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
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "18px",
                  background:
                    "linear-gradient(180deg, #faf8f4 0%, #f5f1ea 100%)",
                  border: "1px solid #e7ddd0",
                }}
              >
                <h2
                  style={{
                    marginBottom: "0.4rem",
                    fontSize: "1.2rem",
                    color: "#18212f",
                  }}
                >
                  {selectedDog.name}
                </h2>
                <p style={{ color: "#5b6472", marginBottom: "0.2rem" }}>
                  Breed: {selectedDog.breed || "Not added"}
                </p>
                <p style={{ color: "#5b6472" }}>
                  Birthdate: {selectedDog.birthdate || "Not added"}
                </p>
              </div>
            ) : (
              <p style={{ color: "#6b7280" }}>Add a dog first to begin.</p>
            )}
          </section>

          <section
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              padding: "1.25rem",
              boxShadow: "0 10px 30px rgba(24, 33, 47, 0.05)",
            }}
          >
            <h2
              style={{
                fontSize: "1.1rem",
                marginBottom: "1rem",
                color: "#18212f",
              }}
            >
              Quick Log
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {EVENT_TYPES.map((type) => {
                const meta = EVENT_META[type];

                return (
                  <button
                    key={type}
                    onClick={() => handleLogEvent(type)}
                    disabled={loadingEvent === type || !selectedDogId}
                    style={{
                      padding: "0.95rem 1rem",
                      borderRadius: "16px",
                      border: `1px solid ${meta.border}`,
                      backgroundColor: meta.bg,
                      color: meta.color,
                      cursor: "pointer",
                      fontWeight: "bold",
                      textTransform: "capitalize",
                      boxShadow: "0 4px 12px rgba(17, 24, 39, 0.04)",
                    }}
                  >
                    {loadingEvent === type
                      ? "Logging..."
                      : `${meta.icon} ${type}`}
                  </button>
                );
              })}
            </div>

            {message && (
              <p
                style={{
                  marginTop: "1rem",
                  color: "#243041",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  padding: "0.75rem 0.9rem",
                  borderRadius: "12px",
                }}
              >
                {message}
              </p>
            )}
          </section>

          <section
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              padding: "1.25rem",
              boxShadow: "0 10px 30px rgba(24, 33, 47, 0.05)",
            }}
          >
            <h2
              style={{
                marginBottom: "1rem",
                fontSize: "1.1rem",
                color: "#18212f",
              }}
            >
              Today Summary
            </h2>

            {!selectedDogId ? (
              <p style={{ color: "#6b7280" }}>
                Add a dog first to see today’s summary.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {EVENT_TYPES.map((type) => {
                  const meta = EVENT_META[type];

                  return (
                    <div
                      key={type}
                      style={{
                        border: `1px solid ${meta.border}`,
                        borderRadius: "18px",
                        padding: "0.9rem",
                        backgroundColor: meta.bg,
                      }}
                    >
                      <div
                        style={{ fontSize: "1rem", marginBottom: "0.35rem" }}
                      >
                        {meta.icon}{" "}
                        <span
                          style={{
                            color: meta.color,
                            textTransform: "capitalize",
                            fontWeight: "bold",
                          }}
                        >
                          {type}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                          color: meta.color,
                        }}
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

        <section
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "24px",
            padding: "1.25rem",
            boxShadow: "0 10px 30px rgba(24, 33, 47, 0.05)",
          }}
        >
          <h2
            style={{
              marginBottom: "1rem",
              fontSize: "1.2rem",
              color: "#18212f",
            }}
          >
            Timeline
          </h2>

          {!selectedDogId ? (
            <p style={{ color: "#6b7280" }}>
              Add a dog first to start logging.
            </p>
          ) : groupedByDay.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No events logged yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {groupedByDay.map((dayGroup) => {
                const isCollapsed = collapsedDates[dayGroup.dateKey];

                return (
                  <div
                    key={dayGroup.dateKey}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "20px",
                      overflow: "hidden",
                      background:
                        "linear-gradient(180deg, #fff 0%, #fbfbfa 100%)",
                    }}
                  >
                    <button
                      onClick={() => toggleDate(dayGroup.dateKey)}
                      style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        padding: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                        textAlign: "left",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: "1rem",
                            color: "#243041",
                            marginBottom: "0.2rem",
                          }}
                        >
                          {dayGroup.displayDate}
                        </h3>
                        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                          {dayGroup.totalLogs} log
                          {dayGroup.totalLogs > 1 ? "s" : ""}
                        </p>
                      </div>

                      <span
                        style={{
                          fontSize: "1.1rem",
                          color: "#6b7280",
                          transform: isCollapsed
                            ? "rotate(-90deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        ▾
                      </span>
                    </button>

                    {!isCollapsed && (
                      <div
                        style={{
                          padding: "0 1rem 1rem",
                          display: "grid",
                          gap: "0.75rem",
                        }}
                      >
                        {dayGroup.typeGroups.map((group) => {
                          const meta = EVENT_META[group.type];

                          return (
                            <div
                              key={`${dayGroup.dateKey}-${group.type}`}
                              style={{
                                padding: "0.9rem",
                                borderRadius: "18px",
                                backgroundColor: meta.bg,
                                border: `1px solid ${meta.border}`,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.75rem",
                                  marginBottom: "0.7rem",
                                }}
                              >
                                <div
                                  style={{
                                    width: "38px",
                                    height: "38px",
                                    borderRadius: "999px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#fff",
                                    border: `1px solid ${meta.border}`,
                                    fontSize: "1rem",
                                    flexShrink: 0,
                                  }}
                                >
                                  {meta.icon}
                                </div>

                                <div>
                                  <p
                                    style={{
                                      fontWeight: "bold",
                                      color: meta.color,
                                      textTransform: "capitalize",
                                      marginBottom: "0.1rem",
                                    }}
                                  >
                                    {group.type}
                                  </p>
                                  <p
                                    style={{
                                      color: "#5b6472",
                                      fontSize: "0.9rem",
                                    }}
                                  >
                                    {group.events.length} time
                                    {group.events.length > 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "0.55rem",
                                }}
                              >
                                {group.events.map((event) => (
                                  <div
                                    key={event.id}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.45rem",
                                      padding: "0.5rem 0.75rem",
                                      borderRadius: "999px",
                                      backgroundColor: "#fff",
                                      border: `1px solid ${meta.border}`,
                                      boxShadow:
                                        "0 2px 6px rgba(17, 24, 39, 0.03)",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "0.9rem",
                                        color: "#374151",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {formatTime(event.created_at)}
                                    </span>

                                    <button
                                      onClick={() =>
                                        handleDeleteEvent(event.id)
                                      }
                                      disabled={deletingEventId === event.id}
                                      style={{
                                        border: "none",
                                        background: "transparent",
                                        color: "#6b7280",
                                        cursor: "pointer",
                                        width: "auto",
                                        minWidth: "auto",
                                        minHeight: "auto",
                                        padding: 0,
                                        fontSize: "0.95rem",
                                        lineHeight: 1,
                                      }}
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
