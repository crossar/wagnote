"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./dogs.module.css";

export default function DogsPage() {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingDogId, setDeletingDogId] = useState("");
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

  async function handleDeleteDog(dogId, dogName) {
    const confirmed = window.confirm(
      `Delete ${dogName}? This will also delete that dog's events.`,
    );

    if (!confirmed) return;

    setDeletingDogId(dogId);
    setMessage("");

    const { error } = await supabase.from("dogs").delete().eq("id", dogId);

    if (error) {
      console.error("Error deleting dog:", error);
      setMessage("Could not delete dog.");
      setDeletingDogId("");
      return;
    }

    setMessage("Dog deleted.");
    await fetchDogs();
    setDeletingDogId("");
  }

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <p className={styles.heroBadge}>Dog Profiles</p>
        <h1 className={styles.heroTitle}>Dogs</h1>
        <p className={styles.heroText}>
          Add your dogs, keep their basic info handy, and manage the profiles
          that power your WagNote dashboard.
        </p>
      </section>

      {/* LAYOUT */}
      <div className={styles.grid}>
        {/* CARD */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Add a Dog</h2>
          <p className={styles.cardText}>
            Create a dog profile to start logging activities.
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              placeholder="Dog name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.input}
            />

            <input
              type="text"
              placeholder="Breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className={styles.input}
            />

            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className={styles.input}
            />

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? "Adding..." : "Add Dog"}
            </button>

            {message && <p className={styles.message}>{message}</p>}
          </form>
        </section>

        {/* CARD */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Your Dogs</h2>

          {dogs.length === 0 ? (
            <p className={styles.emptyText}>No dogs added yet.</p>
          ) : (
            <div className={styles.list}>
              {dogs.map((dog) => (
                <div key={dog.id} className={styles.dogCard}>
                  <div className={styles.dogRow}>
                    <div className={styles.dogInfo}>
                      <h3 className={styles.dogName}>{dog.name}</h3>
                      <p className={styles.dogMeta}>
                        Breed: {dog.breed || "Not added"}
                      </p>
                      <p className={styles.dogMeta}>
                        Birthdate: {dog.birthdate || "Not added"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteDog(dog.id, dog.name)}
                      disabled={deletingDogId === dog.id}
                      className={styles.deleteBtn}
                    >
                      {deletingDogId === dog.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
