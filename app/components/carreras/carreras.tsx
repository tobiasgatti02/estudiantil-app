"use client";
import { useState } from "react";
import { createCarrera } from "@/app/lib/adminActions";

export default function CarreraForm({ onCarreraCreated }: { onCarreraCreated: () => void }) {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
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
    <div className="p-4 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Crear nueva carrera</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la carrera"
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
          Crear carrera
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}