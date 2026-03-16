"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DogsPage() {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

    setDogs(data || []);
  }

  useEffect(() => {
    fetchDogs();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("dogs").insert([
      {
        name,
        breed,
        birthdate: birthdate || null,
      },
    ]);

    if (error) {
      console.error("Error adding dog:", error);
      setMessage("Could not add dog.");
      setLoading(false);
      return;
    }

    setName("");
    setBreed("");
    setBirthdate("");
    setMessage("Dog added!");
    await fetchDogs();
    setLoading(false);
  }

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        color: "#111827",
      }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Dogs</h1>
      <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
        Add your dogs to WagNote.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "1rem",
          marginTop: "1.5rem",
          marginBottom: "2rem",
          padding: "1.25rem",
          border: "1px solid #ddd",
          borderRadius: "12px",
          backgroundColor: "#fafafa",
        }}
      >
        <input
          type="text"
          placeholder="Dog name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: "0.8rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            color: "#111827",
          }}
        />

        <input
          type="text"
          placeholder="Breed"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          style={{
            padding: "0.8rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            color: "#111827",
          }}
        />

        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          style={{
            padding: "0.8rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            color: "#111827",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.9rem 1rem",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#111827",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {loading ? "Adding..." : "Add Dog"}
        </button>

        {message && (
          <p style={{ color: "#111827", marginTop: "0.25rem" }}>{message}</p>
        )}
      </form>

      <section>
        <h2 style={{ marginBottom: "1rem" }}>Your Dogs</h2>

        {dogs.length === 0 ? (
          <p style={{ color: "#4b5563" }}>No dogs added yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
            {dogs.map((dog) => (
              <div
                key={dog.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "1rem",
                  backgroundColor: "#fff",
                  color: "#111827",
                }}
              >
                <h3 style={{ marginBottom: "0.5rem" }}>{dog.name}</h3>
                <p>Breed: {dog.breed || "Not added"}</p>
                <p>Birthdate: {dog.birthdate || "Not added"}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
