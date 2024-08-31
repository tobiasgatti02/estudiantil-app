"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCourseDetails, getSubjectsForCourse, getSubjectScheduleByMonth } from '@/app/lib/adminActions';
const Horarios = React.lazy(() => import('@/app/components/alumnos/horarios'));

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const [courseDetails, setCourseDetails] = useState(null);
  const [subjects, setSubjects] = useState<Array<any>>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const details = await getCourseDetails(parseInt(params.id.toString()));
        setCourseDetails(details);
        //@ts-ignore
        const subjectsData = await getSubjectsForCourse(parseInt(params.id));
        setSubjects(subjectsData);

        const allSchedules = await Promise.all(
          subjectsData.map(subject => getSubjectScheduleByMonth(subject.subject_id, currentMonth + 1))
        );
        setSchedules(allSchedules.flat());
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    };

    fetchCourseData();
  }, [params.id, currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
    setSelectedDate(1);
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));
    setSelectedDate(1);
  };

  const handleDateClick = (date: React.SetStateAction<number>) => {
    setSelectedDate(date);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDay();
  };

  const renderCalendar = () => {
    const year = getCurrentYear();
    const daysInMonth = getDaysInMonth(currentMonth, year);
    const firstDay = getFirstDayOfMonth(currentMonth, year);
    const calendar = [];

    for (let i = 0; i < firstDay; i++) {
      calendar.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`p-2 ${selectedDate === day ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
        >
          {day}
        </button>
      );
    }

    return calendar;
  };

  const filteredSchedules = schedules.filter(schedule => {
    return schedule.day_of_month === selectedDate && schedule.month === currentMonth + 1;
  });

  return (
    <div className="p-4">
      <button onClick={() => router.back()} className="mb-4 px-4 py-2 bg-gray-200 rounded">
        ← Atrás
      </button>
      {courseDetails && (
        <h1 className="text-2xl font-bold mb-4">
          Carrera: {(courseDetails as any).career_name } 
             - Año: {(courseDetails as any).year } 
             - Año carrera: {(courseDetails as any).career_year} 
              - División: {(courseDetails as any).division}
        </h1>
      )}

      <div className="mb-4 flex items-center justify-between">
        <button onClick={handlePrevMonth} className="px-2 py-1 bg-gray-200 rounded">←</button>
        <span className="text-xl font-bold">{months[currentMonth]}</span>
        <button onClick={handleNextMonth} className="px-2 py-1 bg-gray-200 rounded">→</button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map(day => (
          <div key={day} className="text-center font-bold">{day}</div>
        ))}
        {renderCalendar()}
      </div>

      <h2 className="text-xl font-bold mb-4">Horarios para el {selectedDate} de {months[currentMonth]}</h2>

      <Suspense fallback={<div>Cargando horarios...</div>}>
        <Horarios 
        filteredSchedules={filteredSchedules} 
        days={days} 
        subjects={subjects} />
      </Suspense>

      <h2 className="text-xl font-bold mb-4">Materias del curso</h2>
      <ul>
        {subjects.map((subject) => (
          <li
            key={subject.subject_id}
            className="mb-2 p-2 bg-gray-100 cursor-pointer hover:bg-gray-200"
            onClick={() => router.push(`/home/alumno/cursos/curso/${params.id}/materia/${subject.subject_id}`)}
          >
            {subject.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
function getCurrentYear() {
  return new Date().getFullYear();
}

