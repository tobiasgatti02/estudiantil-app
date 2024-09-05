"use client"
import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import CourseDetails from '../../../../../components/adminManagement/listaCurso/detallesCurso';
import StudentList from '../../../../../components/adminManagement/listaCurso/listaAlumnos';
import { useParams, useRouter } from 'next/navigation';
import SubjectList from '@/app/components/materias/subjectList';
import { signOut, useSession } from 'next-auth/react';
import { doLogout, getAdminByDni } from '@/app/lib/userActions';

export default function CoursePage() {
  const params = useParams()
  const id = params.id
  const { data: session} = useSession();
  const router = useRouter();
  useEffect(() => {
    const checkUserExists = async () => {
        if (session?.user?.dni) {
            try {
                const admin = await getAdminByDni(session.user.dni);
                if (!admin) {
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
}, [session]);


  return (
    <div className="container mx-auto p-4">
      <Link href="/home/admin/cursos" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Volver a la lista de cursos
      </Link>
      <Suspense fallback={<div>Loading course details...</div>}>
        <CourseDetails courseId={Number(id)} />
      </Suspense>
      <Suspense fallback={<div>Loading students...</div>}>
        <StudentList courseId={Number(id)}/>
      </Suspense>
     
      <Suspense fallback={<div>Loading subjects...</div>}>
        <SubjectList />
      </Suspense>

    </div>
  );
}
