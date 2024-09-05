"use client"
import { useState, useEffect, use } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { getTeacherByDni, getTeacherSubjectsDetails } from '@/app/lib/teacherActions';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import { doLogout, getAdminByDni } from '@/app/lib/userActions';
import Logout from '@/app/auth/logOut/page';

export default function MisMateriasPage() {
  const { data: session, status } = useSession();
  const [materias, setMaterias] = useState<any[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useUser();


  useEffect(() => {
    if (status === "loading") return; // Don't do anything while loading

    const checkUserExists = async () => {
      if (session?.user?.dni || user?.dni) {
        console.log('Checking user existence...');
        try {
          const dni =  session?.user?.dni || user?.dni || '';
          const teacher = await getTeacherByDni(dni);
          if (!teacher) {
            // User doesn't exist anymore, sign out
            router.push('/auth/login');
            doLogout();
          }
          const subjects = await getTeacherSubjectsDetails(dni);
          setMaterias(subjects);
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
  }, [session, status]);// Dependencias actualizadas para verificar el estado de sesión

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