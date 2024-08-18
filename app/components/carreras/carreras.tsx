"use client";
import { useState } from "react";
import { createCarrera } from "@/app/lib/adminActions";

export default function CarreraForm({ onCarreraCreated }) {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre de la carrera no puede estar vacío.");
      return;
    }

    try {
      await createCarrera(nombre);
      onCarreraCreated(); 
      setNombre(""); 
      setError(""); 
    } catch (error) {
      console.error("Error creating carrera:", error);
    }
  };

  return (
    <div>
      <h2>Crear nueva carrera</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la carrera"
          required
        />
        <button type="submit">Crear carrera</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
