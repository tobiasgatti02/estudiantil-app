"use client"
import { Suspense } from 'react';
import Link from 'next/link';
import CourseDetails from '../../../../../components/adminManagement/listaCurso/detallesCurso';
import StudentList from '../../../../../components/adminManagement/listaCurso/listaAlumnos';
import CreateSubject from '@/app/components/materias/crearMateria';
import { useParams } from 'next/navigation';
import SubjectPage from './materia/[materia]/page';
import SubjectList from '@/app/components/materias/subjectList';

export default function CoursePage() {
  const params = useParams()
  const id = params.id

  console.log('courseId:', id);

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
        <CreateSubject  />
      </Suspense>
      <Suspense fallback={<div>Loading subjects...</div>}>
        <SubjectList />
      </Suspense>

    </div>
  );
}
