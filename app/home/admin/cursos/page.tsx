'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CreateCourseForm from '@/app/components/adminManagement/formCurso/createCourseForm';
import { getAdminByDni } from '@/app/lib/userActions';
import ClientCourseList from '@/app/components/adminManagement/listaCurso/courseList';

export default function CoursesPage() {
  const { data: session } = useSession();
  const [canCreateCourses, setCanCreateCourses] = useState(false);

  useEffect(() => {
    async function checkPermissions() {
      try {
        if (session?.user?.dni) {
          const admin = await getAdminByDni(session.user.dni);
          if (admin?.can_create_courses) {
            setCanCreateCourses(true);
          }
        }
      } catch (error) {
        console.error("Error checking admin permissions:", error);
      }
    }
    checkPermissions();
  }, [session]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cursos</h1>
      {canCreateCourses && <CreateCourseForm />}
      <ClientCourseList />
    </div>
  );
}