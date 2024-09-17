"use client";

interface Course {
  career_name: string;
  year: number;
  career_year: number;
  division: string;
  course_id: number;
}

export default function CourseDetailsClient({ course }: { course: Course }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">
        {course.career_name} - {course.year} - {course.career_year}º año - División {course.division}
      </h1>
    </div>
  );
}