import { useState, useEffect, useMemo, SetStateAction } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSubjectsForCourse, getTeachers, deleteSubjectAndTeacherFromSubject } from '@/app/lib/adminActions';
import CreateSubject from './crearMateria';
import { Input, Button } from '@/app/components/ui/buttonAndInput'; 

export default function SubjectList() {
  const params = useParams();
  const courseId = Number(params.id);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const subjectsPerPage = 9;

  useEffect(() => {
    async function fetchData() {
      const subjectsForCourse = await getSubjectsForCourse(courseId);
      setSubjects(subjectsForCourse);
      const teachersList = await getTeachers();
      setTeachers(teachersList);
    }
    fetchData();
  }, [courseId]);

  const handleSubjectsUpdate = async () => {
    const updatedSubjects = await getSubjectsForCourse(courseId);
    setSubjects(updatedSubjects);
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await deleteSubjectAndTeacherFromSubject(subjectId);
      const subjectsForCourse = await getSubjectsForCourse(courseId);
      setSubjects(subjectsForCourse);
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subjects, searchTerm]);

  const totalPages = Math.ceil(filteredSubjects.length / subjectsPerPage);

  const currentSubjects = useMemo(() => {
    const indexOfLastSubject = currentPage * subjectsPerPage;
    const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage;
    return filteredSubjects.slice(indexOfFirstSubject, indexOfLastSubject);
  }, [filteredSubjects, currentPage]);

  const handleSearch = (e: { target: { value: SetStateAction<string>; }; }) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);  // Reset to first page when searching
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(Math.min(Math.max(1, pageNumber), totalPages));
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Materias en el curso</h2>
      
      <Input
        className='mb-4'
        type='search'
        placeholder='Buscar materia'
        value={searchTerm}
        onChange={handleSearch}
      />

      <ul className="space-y-2">
        {currentSubjects.map((subject) => (
          <li key={subject.subject_id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <span>{subject.name}</span>
            <div>
              <Link 
                href={`/home/admin/cursos/curso/${courseId}/materia/${subject.subject_id}`}
                className="ml-4 text-blue-500 hover:underline"
              >
                Ver materia
              </Link>
              <Button 
                onClick={() => handleDeleteSubject(subject.subject_id)}
                variant="outline"
                className="ml-4 text-red-500 hover:bg-red-100"
              >
                Borrar
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {filteredSubjects.length > subjectsPerPage && (
        <div className="flex justify-center mt-4 space-x-2">
          <Button onClick={async () => paginate(currentPage - 1)}>
            Anterior
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              onClick={async () => paginate(i + 1)}
              variant={currentPage === i + 1 ? "default" : "outline"}
            >
              {i + 1}
            </Button>
          ))}
          <Button onClick={async () => paginate(currentPage + 1)}>
            Siguiente
          </Button>
        </div>
      )}

<Link href={`/home/admin/cursos/curso/${courseId}/materia/crear`}
          className="block bg-[#4a90e2] text-white py-3 
          rounded-lg font-semibold 
          mx-4 sm:mx-8 md:mx-16 lg:mx-32 xl:mx-64 text-center mt-8
          transition duration-300 ease-in-out 
          hover:bg-[#357ABD] focus:outline-none 
          focus:ring-2 focus:ring-[#357ABD] w-full sm:w-auto">
              Crear Nueva Materia
          </Link>
    </div>
  );
}