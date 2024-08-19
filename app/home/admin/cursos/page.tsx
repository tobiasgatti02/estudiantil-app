"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CreateCourseForm from '@/app/components/adminManagement/formCurso/createCourseForm';
import ClientCourseList from '@/app/components/adminManagement/listaCurso/courseList';

export default function Page() {
  const { data: session } = useSession();
  const [canCreateCourses, setCanCreateCourses] = useState(false);

  useEffect(() => {
    async function checkPermissions() {
      if (session) {
        // Lógica para verificar permisos
        setCanCreateCourses(true); // Actualiza esto según la lógica de permisos
      }
    }
    checkPermissions();
  }, [session]);

  const handleCourseCreated = async () => {
    // Lógica para actualizar la lista de cursos
    // Por ejemplo, podrías llamar a una función para volver a cargar los cursos
    console.log('Course created');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cursos</h1>
      {canCreateCourses && <ClientCourseList />}
      
    </div>
  );
}