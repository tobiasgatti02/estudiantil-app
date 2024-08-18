import { getCourses } from "@/app/lib/adminActions";

export default async function CourseDetails({ courseId }: { courseId: number }) {
  const courses = await getCourses();
  console.log(courseId);
  const course = courses.find(c => c.course_id === courseId);

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">
        {course.career_name} - {course.year} - {course.career_year}º año - División {course.division}
      </h1>
    </div>
  );
}