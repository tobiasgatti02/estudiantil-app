"use client";
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import SubjectSchedule from '@/app/components/materias/horariosMaterias';
import { useParams, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { doLogout, getAdminByDni } from '@/app/lib/userActions';
import { getSubjectName, updateSubject } from '@/app/lib/adminActions';

export default function SubjectPage() {
  const params = useParams();
  const courseId = Number(params.id);
  const subjectId = Number(params.materia);
  const { data: session } = useSession();
  const router = useRouter();
  const [newSubjectName, setNewSubjectName] = useState<string>('');

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
  }, [session, router]);

  useEffect(() => {
    const fetchSubjectName = async () => {
      try {
        const response = await getSubjectName(courseId, subjectId);
        
        setNewSubjectName(response);
      } catch (error) {
        console.error('Error fetching subject name:', error);
      }
    };

    fetchSubjectName();
  }, [courseId, subjectId]);

  const handleUpdateSubjectName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSubject(subjectId, newSubjectName);
      alert('Nombre de la materia cambiado exitosamente');
      setNewSubjectName('');
    } catch (error) {
      console.error('Error updating subject name:', error);
      alert('Failed to update subject name');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Link href={`/home/admin/cursos/curso/${courseId}`} className="text-blue-500 hover:underline mb-4 inline-block">
        ← Volver a la lista de materias
      </Link>

      <form onSubmit={handleUpdateSubjectName} className="mb-4">
        <label htmlFor="newSubjectName" className="block mb-2">Nuevo nombre de la materia:</label>
        <input
          type="text"
          id="newSubjectName"
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Actualizar nombre
        </button>
      </form>

      <Suspense fallback={<div>Loading subject schedule...</div>}>
        <SubjectSchedule />
      </Suspense>
    </div>
  );
}
