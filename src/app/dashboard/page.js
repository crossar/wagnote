"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const EVENT_TYPES = ["pee", "poop", "meal", "walk", "medication"];

export default function DashboardPage() {
  const [dogs, setDogs] = useState([]);
  const [selectedDogId, setSelectedDogId] = useState("");
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingEvent, setLoadingEvent] = useState("");

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

  function formatDateTime(value) {
    return new Date(value).toLocaleString();
  }

  const selectedDog = dogs.find((dog) => dog.id === selectedDogId);

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        maxWidth: "900px",
        margin: "0 auto",
        color: "#111827",
      }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Dashboard</h1>
      <p style={{ color: "#4b5563", marginBottom: "1.5rem" }}>
        Quickly log your dog’s daily activities.
      </p>

      <section
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "16px",
          padding: "1.25rem",
          marginBottom: "2rem",
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
            <h2 style={{ marginBottom: "0.5rem" }}>{selectedDog.name}</h2>
            <p>Breed: {selectedDog.breed || "Not added"}</p>
            <p>Birthdate: {selectedDog.birthdate || "Not added"}</p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleLogEvent(type)}
              disabled={loadingEvent === type || !selectedDogId}
              style={{
                padding: "0.95rem 1rem",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "#111827",
                color: "#fff",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {loadingEvent === type ? "Logging..." : type}
            </button>
          ))}
        </div>

        {message && (
          <p style={{ marginTop: "1rem", color: "#111827" }}>{message}</p>
        )}
      </section>

      <section>
        <h2 style={{ marginBottom: "1rem" }}>Recent Events</h2>

        {!selectedDogId ? (
          <p style={{ color: "#4b5563" }}>Add a dog first to start logging.</p>
        ) : events.length === 0 ? (
          <p style={{ color: "#4b5563" }}>No events logged yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "1rem",
                  backgroundColor: "#fff",
                  color: "#111827",
                }}
              >
                <h3
                  style={{
                    marginBottom: "0.4rem",
                    textTransform: "capitalize",
                  }}
                >
                  {event.type}
                </h3>
                <p style={{ color: "#4b5563" }}>
                  {formatDateTime(event.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
