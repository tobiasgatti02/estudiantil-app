'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { getTeacherSubjectsDetails } from '@/app/lib/teacherActions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicacionesForm from '@/app/components/profesores/PublicacionesForm';


export default function MisMateriasPage() {
  const { data: session, status } = useSession();
  const [materias, setMaterias] = useState<any[]>([]);
  const [error, setError] = useState("");
    const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Don't do anything while loading
    if (!session) {
      signIn(); // Redirect to login if not authenticated
      return;
    }
    
    if (session.user?.dni) {
      const fetchMaterias = async () => {
        try {
          const data = await getTeacherSubjectsDetails(session.user.dni);
          setMaterias(data);
        } catch (err) {
          setError("Error al obtener las materias: " + err.message);
        }
      };
      
      fetchMaterias();
    } else {
      setError("No se pudo obtener el DNI del usuario");
    }
  }, [session, status]); // Dependencias actualizadas para verificar el estado de sesión

    function handleMateriaClick(subject_id: any): void {
        router.push(`/home/profesor/materias/${subject_id}`);
    }

  return (
    <div className="p-4">
         <Link href="/home/profesor/materias" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Volver a la lista de materias
      </Link>
      <h1 className="text-2xl font-bold mb-4">Datos de la Materia</h1>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <ul className="space-y-4 mt-4">
        {materias.map((materia) => (
          <li
            key={materia.subject_id}
            className="flex justify-between items-center bg-gray-100 p-4 rounded shadow-md cursor-pointer"
            onClick={() => handleMateriaClick(materia.subject_id)}

          >
            <div className='md:flex gap-8 text-center'>
              <span>Carrera: {materia.career_name}</span>
              <span>Año de carrera: {materia.career_year}</span>
              <span>División: {materia.division}</span>
              <span>Año de curso: {materia.course_year}</span>
              <span>Materia: {materia.subject_name}</span>
            </div>
          </li>
        ))}
      </ul>

        <h1 className="text-2xl font-bold text-center mb-4">
            Crea una nueva publicacion para la materia
        </h1>

        <PublicacionesForm />

    </div>
  );
}

