"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const EVENT_TYPES = ["pee", "poop", "meal", "walk", "medication"];

const EVENT_META = {
  pee: {
    icon: "💧",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fcd34d",
  },
  poop: {
    icon: "💩",
    color: "#92400e",
    bg: "#fef3c7",
    border: "#fbbf24",
  },
  meal: {
    icon: "🍖",
    color: "#166534",
    bg: "#ecfdf5",
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
    color: "#7c3aed",
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
    const groups = {};

    events.forEach((event) => {
      const dateKey = getDateKey(event.created_at);

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateKey,
          displayDate: formatDisplayDate(event.created_at),
          events: [],
        };
      }

      groups[dateKey].events.push(event);
    });

    return Object.values(groups);
  }, [events]);

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "900px",
        margin: "0 auto",
        color: "#111827",
      }}
    >
      <h1 style={{ marginBottom: "0.5rem", fontSize: "2rem" }}>Dashboard</h1>
      <p style={{ color: "#4b5563", marginBottom: "1.5rem" }}>
        Quickly log your dog’s daily activities.
      </p>

      <section
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "16px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <label
          htmlFor="dog-select"
          style={{
            display: "block",
            fontWeight: "bold",
            marginBottom: "0.75rem",
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
            padding: "0.85rem",
            borderRadius: "10px",
            border: "1px solid #ccc",
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

        {selectedDog && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "12px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ marginBottom: "0.35rem", fontSize: "1.2rem" }}>
              {selectedDog.name}
            </h2>
            <p style={{ color: "#4b5563" }}>
              Breed: {selectedDog.breed || "Not added"}
            </p>
            <p style={{ color: "#4b5563" }}>
              Birthdate: {selectedDog.birthdate || "Not added"}
            </p>
          </div>
        )}

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
                  borderRadius: "12px",
                  border: `1px solid ${meta.border}`,
                  backgroundColor: meta.bg,
                  color: meta.color,
                  cursor: "pointer",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                }}
              >
                {loadingEvent === type ? "Logging..." : `${meta.icon} ${type}`}
              </button>
            );
          })}
        </div>

        {message && (
          <p style={{ marginTop: "1rem", color: "#111827" }}>{message}</p>
        )}
      </section>

      <section
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "16px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
          Today Summary
        </h2>

        {!selectedDogId ? (
          <p style={{ color: "#4b5563" }}>
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
                    borderRadius: "12px",
                    padding: "0.9rem",
                    backgroundColor: meta.bg,
                  }}
                >
                  <div style={{ fontSize: "1rem", marginBottom: "0.3rem" }}>
                    {meta.icon}{" "}
                    <span
                      style={{ color: meta.color, textTransform: "capitalize" }}
                    >
                      {type}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "1.4rem",
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

      <section>
        <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Timeline</h2>

        {!selectedDogId ? (
          <p style={{ color: "#4b5563" }}>Add a dog first to start logging.</p>
        ) : groupedByDay.length === 0 ? (
          <p style={{ color: "#4b5563" }}>No events logged yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {groupedByDay.map((dayGroup) => (
              <div
                key={dayGroup.dateKey}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "16px",
                  padding: "1rem",
                }}
              >
                <h3
                  style={{
                    marginBottom: "0.85rem",
                    fontSize: "1rem",
                    color: "#4b5563",
                  }}
                >
                  {dayGroup.displayDate}
                </h3>

                <div style={{ display: "grid", gap: "0.6rem" }}>
                  {dayGroup.events.map((event) => {
                    const meta = EVENT_META[event.type];

                    return (
                      <div
                        key={event.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.75rem",
                          padding: "0.8rem 0.9rem",
                          borderRadius: "12px",
                          backgroundColor: meta.bg,
                          border: `1px solid ${meta.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
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

                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                fontWeight: "bold",
                                color: meta.color,
                                textTransform: "capitalize",
                                marginBottom: "0.1rem",
                              }}
                            >
                              {event.type}
                            </p>
                            <p
                              style={{ color: "#4b5563", fontSize: "0.95rem" }}
                            >
                              {formatTime(event.created_at)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={deletingEventId === event.id}
                          style={{
                            border: "none",
                            backgroundColor: "#fff",
                            color: "#6b7280",
                            cursor: "pointer",
                            width: "40px",
                            minWidth: "40px",
                            minHeight: "40px",
                            borderRadius: "10px",
                            fontSize: "1rem",
                            flexShrink: 0,
                          }}
                          title="Delete this log"
                        >
                          {deletingEventId === event.id ? "..." : "✕"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
