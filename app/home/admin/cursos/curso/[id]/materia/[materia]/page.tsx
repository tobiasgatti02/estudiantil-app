"use client";
import { Suspense, useDebugValue, useEffect } from 'react';
import Link from 'next/link';
import SubjectDetails from '@/app/components/materias/detallesMaterias';
import SubjectSchedule from '@/app/components/materias/horariosMaterias';
import { useParams, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { doLogout, getAdminByDni } from '@/app/lib/userActions';
import Logout from '@/app/auth/logOut/page';

export default function SubjectPage() {
  const params = useParams();
  const courseId = Number(params.id);
  const subjectId = Number(params.materia);
  const { data: session } = useSession();
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
      <Link href={`/home/admin/cursos/curso/${courseId}`} className="text-blue-500 hover:underline mb-4 inline-block">
        ← Volver a la lista de materias
      </Link>
      
      <Suspense fallback={<div>Loading subject schedule...</div>}>
        <SubjectSchedule  />
      </Suspense>
    </div>
  );
}