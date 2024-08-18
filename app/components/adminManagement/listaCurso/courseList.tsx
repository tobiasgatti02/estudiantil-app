import { getCourses } from '@/app/lib/adminActions';
import Link from 'next/link';

export default async function CourseList() {
  const courses = await getCourses();

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Cursos existentes</h2>
      <ul className="space-y-2">
        {courses.map((course) => (
          <li key={course.course_id} className="bg-white p-4 rounded shadow">
            <span>{course.career_name} - {course.year} - {course.career_year}º año - División {course.division}</span>
            <Link href={`cursos/curso/${course.course_id}`} className="ml-4 text-blue-500 hover:underline">
              Ver curso
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}