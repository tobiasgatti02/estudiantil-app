'use client';

import { useState, useEffect } from 'react';
import { getStudentsForCourse, getAllStudents, addStudentToCourse, removeStudentFromCourse } from '@/app/lib/adminActions';

export default function StudentList({ courseId }: { courseId: number }) {
  const [students, setStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStudents() {
      // Fetch all students to populate the dropdown
      const studentsList = await getAllStudents();
      setAllStudents(studentsList);

      // Fetch students for the current course
      const studentsForCourse = await getStudentsForCourse(courseId);
      setStudents(studentsForCourse);
    }
    fetchStudents();
  }, [courseId]);

  const handleAddStudent = async () => {
    if (selectedStudent) {
      await addStudentToCourse(selectedStudent, courseId);
      // Refresh the students list for the course
      const studentsForCourse = await getStudentsForCourse(courseId);
      setStudents(studentsForCourse);
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    await removeStudentFromCourse(studentId, courseId);
    // Refresh the students list for the course
    const studentsForCourse = await getStudentsForCourse(courseId);
    setStudents(studentsForCourse);
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Alumnos en el curso</h2>
      <div className="mb-4">
        <select
          onChange={(e) => setSelectedStudent(Number(e.target.value))}
          className="px-3 py-2 border rounded"
        >
          <option value="">Seleccionar alumno</option>
          {allStudents.map((student) => (
            <option key={student.user_id} value={student.user_id}>
              {student.name} - {student.dni}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddStudent}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
        >
          Agregar alumno
        </button>
      </div>
      <ul className="space-y-2">
        {students.map((student) => (
          <li key={student.user_id} className="bg-white p-4 rounded shadow">
            <span>{student.name} - {student.dni}</span>
            <button
              onClick={() => handleRemoveStudent(student.user_id)}
              className="text-red-500 hover:underline ml-4"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
