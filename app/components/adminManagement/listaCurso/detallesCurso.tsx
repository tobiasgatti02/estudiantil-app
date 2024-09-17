import { getCourses } from "@/app/lib/adminActions";
import CourseDetailsClient from "./CourseDetailsClient";

export default async function CourseDetails({ courseId }: { courseId: number }) {
  const courses = await getCourses();
  const course = courses.find(c => c.course_id === courseId);

  if (!course) {
    return <div>Course not found</div>;
  }

  return <CourseDetailsClient course={course} />;
}
