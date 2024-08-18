"use client";
import { Suspense } from 'react';
import Link from 'next/link';
import SubjectDetails from '@/app/components/materias/detallesMaterias';
import SubjectSchedule from '@/app/components/materias/horariosMaterias';
import { useParams } from 'next/navigation';


export default function SubjectPage() {
  const params = useParams();
  const courseId = Number(params.id);
  const subjectId = Number(params.materia);



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