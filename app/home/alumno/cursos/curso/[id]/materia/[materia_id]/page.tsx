"use client";
import React, { useEffect, useState } from 'react';
import { getTeacherSubjectsDetails, getPublicationsForSubject, getTeachersAssociatedWithSubject } from '@/app/lib/teacherActions';
import { useParams } from 'next/navigation';

type Publication = {
  publication_id: number;
  title: string;
  content: string;
  files: Array<{ file_id: number; file_name: string; file_path: string }>;
  teacher_id: number;  // ID del profesor que creó la publicación
};

type Teacher = {
  user_id: number;
  name: string;
};

const TeacherSubjectPage: React.FC = () => {
  const params = useParams();
  const subjectId = parseInt(params.materia_id as string);
  const [subjectDetails, setSubjectDetails] = useState<any>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [teacherNames, setTeacherNames] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener detalles de la materia
        const details = await getTeacherSubjectsDetails(subjectId);
        setSubjectDetails(details);
        
        // Obtener publicaciones de la materia
        const pubs = await getPublicationsForSubject(subjectId);
        setPublications(pubs);
        
        // Obtener nombres de profesores asociados
        const teachers = await getTeachersAssociatedWithSubject(subjectId);
        console.log(teachers);
        const teacherMap = new Map<number, string>();
        teachers.forEach((teacher: Teacher) => {
          teacherMap.set(teacher.teacher_id, teacher.name);
        });
        setTeacherNames(teacherMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [subjectId]);

  if (!subjectDetails) {
    return <p>Cargando...</p>;
  }

  // Función para obtener el nombre del profesor que creó la publicación
  const getTeacherName = (teacherId: number) => {
    return teacherNames.get(teacherId) || 'Desconocido';
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Materia: {subjectDetails.name}</h1>
      <h2 className="text-xl font-semibold mb-2">Profesores Asociados:</h2>
      <ul className="list-disc list-inside mb-4">
        {Array.from(teacherNames.values()).map((name, index) => (
          <li key={index} className="text-lg">{name}</li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mb-2">Publicaciones:</h2>
      {publications.length > 0 ? (
        <ul className="space-y-4">
          {publications.map((publication) => (
            <li key={publication.publication_id} className="border p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">{publication.title}</h3>
              <p className="mb-2">{publication.content}</p>
              {publication.files.length > 0 && (
                <div className="mb-2">
                  <h4 className="text-md font-medium mb-1">Archivos:</h4>
                  <ul className="list-disc list-inside">
                    {publication.files.map((file) => (
                      <li key={file.file_id}>
                        <a href={file.file_path} className="text-blue-600 hover:underline">{file.file_name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Mostrar el nombre del profesor que creó la publicación */}
              <p className="text-sm text-gray-600">Publicado por: {getTeacherName(publication.teacher_id)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay publicaciones para esta materia.</p>
      )}
    </div>
  );
};

export default TeacherSubjectPage;
