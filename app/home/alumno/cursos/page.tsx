"use client"
import { useState, useEffect, use } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { getStudentByDni, getStudentCourses } from '@/app/lib/studentActions';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';

export default function MisMateriasPage() {
  const { data: session, status } = useSession();
  const [cursos, setCursos] = useState<any[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useUser();


  useEffect(() => {
    if (status === "loading") return; // Don't do anything while loading

    const checkUserExists = async () => {
      if (session?.user?.dni || user?.dni) {
        console.log('Checking user existence...');
        console.log(user?.dni);
        try {
          const dni = session?.user?.dni || user?.dni || '';
          const student = await getStudentByDni(Number(dni));
          if (!student) {
            // User doesn't exist anymore, sign out
            await signOut({ redirect: true, callbackUrl: '/auth/login' });
          }
          const cursos = await getStudentCourses(Number(dni));
          console.log(cursos);
          setCursos(cursos);
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

    function handleCursoClick(cursoID: any): void {
        router.push(`/home/alumno/cursos/curso/${cursoID}`);
    }




  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mis Cursos</h1>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <ul className="space-y-4 mt-4">
        {cursos.map((curso) => (
          <li
            key={curso.subject_id}
            className="flex justify-between items-center bg-gray-100 p-4 rounded shadow-md cursor-pointer"

          >
            <div className='md:flex gap-8 text-center'>
              <span>Carrera: {curso.career_name}</span>
              <span>Año de carrera: {curso.career_year}</span>
              <span>División: {curso.division}</span>
              <span>Año de curso: {curso.year}</span>
            </div>
            <button onClick={() => handleCursoClick(curso.course_id)}
            className="px-4 py-2 bg-blue-500 text-white 
            rounded hover:bg-blue-600">Ver curso
            </button>
          </li>

        ))}
      </ul>
    </div>
  );
}