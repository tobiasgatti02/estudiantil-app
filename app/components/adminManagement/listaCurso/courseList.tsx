'use client';

import { useState, useEffect } from 'react';
import { getCourses } from '@/app/lib/adminActions';
import Link from 'next/link';

export default function ClientCourseList() {
  interface Course {
    course_id: string;
    career_name: string;
    year: number;
    career_year: number;
    division: number;
  }
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const fetchedCourses = await getCourses();
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, []);

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Cursos existentes</h2>
      <ul className="space-y-2">
        {courses.map((course) => (
          <li key={course.course_id} className="bg-white p-4 rounded shadow">
            <span>{course.career_name} - {course.year} - {course.career_year}º año - División {course.division}</span>
            <Link href={`/home/admin/cursos/curso/${course.course_id}`} className="ml-4 text-blue-500 hover:underline">
              Ver curso
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}