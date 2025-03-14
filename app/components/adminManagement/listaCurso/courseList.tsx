'use client';

import { useState, useEffect } from 'react';
import {  useSession } from 'next-auth/react';
import { signOut } from "next-auth/react";
import { getCourses } from '@/app/lib/adminActions';
import { doLogout, getAdminByDni } from '@/app/lib/userActions';
import Link from 'next/link';
import CreateCourseForm from '../formCurso/createCourseForm';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import { log } from 'console';
import Logout from '@/app/auth/logOut/page';
export default function ClientCourseList() {
    const { user } = useUser();

  interface Course {
    course_id: string;
    career_name: string;
    year: number;
    career_year: number;
    division: number;
  }

  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canCreateCourses, setCanCreateCourses] = useState(false);
  const router = useRouter();
  useEffect(() => {
    async function fetchCourses() {
      if (user && user.permissions) {
        // @ts-ignore
        setCanCreateCourses(user.permissions.canCreateCourses);
        console.log(user);
    }
      try {
        const fetchedCourses = await getCourses();
        console.log(user);
        setCourses(fetchedCourses);

      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, [user]);

  useEffect(() => {
    async function checkPermissions() {
      try {
        if (session?.user?.dni  || user?.dni) {
          const dni = session?.user?.dni || user?.dni || '';

          console.log(user);
          const admin = await getAdminByDni(dni);
          if (admin?.can_create_courses) {
            setCanCreateCourses(true);
          } else {
            setCanCreateCourses(false); // Asegúrate de manejar el caso contrario
          }
        }
      } catch (error) {
        console.error('Error checking admin permissions:', error);
      }
    }
    checkPermissions();
  }, [session]);


  useEffect(() => {
    const checkUserExists = async () => {
        if (session?.user?.dni || user?.dni) {
            try {
                const dni = session?.user?.dni || user?.dni || '';
                const admin = await getAdminByDni(dni);
                if (!admin) {
                  

                  router.push('/auth/login');
                  doLogout();
                  console.log("no existe", session);
                  
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

  const handleCourseCreated = async () => {
    setIsLoading(true);
    try {
      const fetchedCourses = await getCourses();
      setCourses(fetchedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Crear Curso</h2>
      {canCreateCourses && (
        <CreateCourseForm onCourseCreated={handleCourseCreated} />
      )}
      <h2 className="text-xl font-semibold mt-8mb-2">Cursos Existentes</h2>
      <ul className="space-y-2 mt-4">

        {courses.map((course) => (
          <li key={course.course_id} className="bg-white p-4 rounded shadow">
            <span>{course.career_name ? 
            course.career_name : course.career_name} - {course.year} - {course.career_year}º año - División {course.division}
            </span>
            {canCreateCourses && (
            <Link href={`/home/admin/cursos/curso/${course.course_id}`} className="ml-4 text-blue-500 hover:underline">
              Ver curso
            </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
