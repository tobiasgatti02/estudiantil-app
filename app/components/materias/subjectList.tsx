'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSubjectsForCourse, getTeachers, deleteSubjectAndTeacherFromSubject } from '@/app/lib/adminActions';
import { useParams } from 'next/navigation';
export default function SubjectList() {
  const params = useParams();
  const courseId = Number(params.id);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const subjectsForCourse = await getSubjectsForCourse(courseId);
      setSubjects(subjectsForCourse);
      const teachersList = await getTeachers();
      setTeachers(teachersList);
    }
    fetchData();
  }, [courseId]);

  const handleSubjectsUpdate = (updatedSubjects: any[]) => {
    setSubjects(updatedSubjects);
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await deleteSubjectAndTeacherFromSubject(subjectId);

      const subjectsForCourse = await getSubjectsForCourse(courseId);
      setSubjects(subjectsForCourse);
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Materias en el curso</h2>
      <ul className="space-y-2">
        {subjects.map((subject) => (
          <li key={subject.subject_id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <span>{subject.name}</span>
            <div>
              <Link 
                href={`/home/admin/cursos/curso/${courseId}/materia/${subject.subject_id}`}
                className="ml-4 text-blue-500 hover:underline"
              >
                Ver materia
              </Link>
              <button 
                onClick={() => handleDeleteSubject(subject.subject_id)}
                className="ml-4 text-red-500 hover:underline"
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
      
    </div>
  );
}