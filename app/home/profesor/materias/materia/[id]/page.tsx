'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { getTeacherByDni, getTeacherSubjectsDetails } from '@/app/lib/teacherActions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicacionesForm from '@/app/components/profesores/PublicacionesForm';
import { doLogout, getAdminByDni } from '@/app/lib/userActions';
import { useUser } from '@/app/context/UserContext';
import Logout from '@/app/auth/logOut/page';

export default function MisMateriasPage() {
  const { data: session, status } = useSession();
  const [materias, setMaterias] = useState<any[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();
  const user = useUser();

  // Effect to check if user exists in the system
  useEffect(() => {
    if (status === "loading") return; // Don't do anything while loading

    const checkUserExists = async () => {
      //@ts-ignore
      if (session?.user?.dni || user?.dni) {
        console.log('dni de usuario:', session?.user.dni);
        try {
          //@ts-ignore
          const dni = session?.user.dni || user.dni || '';
          const teacher = await getTeacherByDni(dni);
          if (!teacher) {
            router.push('/auth/login');
            doLogout();
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
      console.log('Fetching subjects...');
      console.log('aaa',session.user.dni);
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
            className="flex justify-between items-center bg-gray-100 p-4 rounded shadow-md"
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

      <h1 className="text-2xl font-bold text-center mt-8 mb-4">
        Crea una nueva publicación para la materia
      </h1>

      <PublicacionesForm />
    </div>
  );
}
