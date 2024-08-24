'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { getTeacherSubjectsDetails } from '@/app/lib/teacherActions';
import { useRouter } from 'next/navigation';
import { getAdminByDni } from '@/app/lib/userActions';

export default function MisMateriasPage() {
  const { data: session, status } = useSession();
  const [materias, setMaterias] = useState<any[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  // Effect to check if user exists in the system
  useEffect(() => {
    if (status === "loading") return; // Don't do anything while loading

    const checkUserExists = async () => {
      if (session?.user?.dni) {
        try {
          const admin = await getAdminByDni(session.user.dni);
          if (!admin) {
            // User doesn't exist anymore, sign out
            await signOut({ redirect: true, callbackUrl: '/auth/login' });
          }
        } catch (error) {
          console.error('Error checking user existence:', error);
        }
      }
    };

    // Check immediately and then every 90 seconds
    checkUserExists();
    const intervalId = setInterval(checkUserExists, 90000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [session, status]);

  // Effect to fetch subjects
  useEffect(() => {
    if (status === "loading") return; // Don't do anything while loading

    if (session?.user?.dni) {
      const fetchMaterias = async () => {
        try {
          const data = await getTeacherSubjectsDetails(session.user.dni);
          setMaterias(data);
        } catch (err) {
          //@ts-ignore
          setError("Error al obtener las materias: " + err.message);
        }
      };
      
      fetchMaterias();
    } else {
      setError("No se pudo obtener el DNI del usuario");
    }
  }, [session, status]);

  function handleMateriaClick(subject_id: any): void {
    router.push(`/home/profesor/materias/materia/${subject_id}`);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mis Materias</h1>

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
    </div>
  );
}
