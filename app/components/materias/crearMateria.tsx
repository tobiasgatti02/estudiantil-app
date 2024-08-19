import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getTeachers, createSubject, addTeacherToSubject, createSubjectSchedule, getSubjectsForCourse } from '@/app/lib/adminActions';
import { get } from 'http';
import Link from 'next/link';

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function CreateSubject({ onSubjectCreated }: { onSubjectCreated: () => void }) {
  const { id: courseId } = useParams();
  const [subjectName, setSubjectName] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [schedules, setSchedules] = useState<{ [key: number]: any }>({});
  const [copiedSchedule, setCopiedSchedule] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function fetchTeachers() {
      const teachersList = await getTeachers();
      setTeachers(teachersList);
    }
    fetchTeachers();
  }, []);

  const handleAddTeacher = () => {
    setSelectedTeachers([...selectedTeachers, '']);
  };

  const handleRemoveTeacher = (index: number) => {
    const newTeachers = [...selectedTeachers];
    newTeachers.splice(index, 1);
    setSelectedTeachers(newTeachers);
  };

  const handleTeacherChange = (index: number, value: string) => {
    const newTeachers = [...selectedTeachers];
    newTeachers[index] = value;
    setSelectedTeachers(newTeachers);
  };

  const handleScheduleChange = (day: number, index: number, field: string, value: string) => {
    setSchedules(prevSchedules => ({
      ...prevSchedules,
      [currentMonth]: {
        ...prevSchedules[currentMonth],
        [day]: [
          ...(prevSchedules[currentMonth]?.[day] || []).slice(0, index),
          {
            ...(prevSchedules[currentMonth]?.[day]?.[index] || {}),
            [field]: value
          },
          ...(prevSchedules[currentMonth]?.[day] || []).slice(index + 1)
        ]
      }
    }));
  };

  const handleCreateSubject = async () => {
    if (!subjectName) {
      setErrorMessage('El nombre de la materia no puede estar vacío');
      return;
    }

    try {
      console.log('Creating subject:', subjectName, courseId, selectedTeachers, schedules);
      const subjectId = await createSubject(Number(courseId), subjectName);
      console.log('Subject ID:', subjectId); // Ensure this is correct

      // Check if subjectId is valid
      if (!subjectId) {
        throw new Error('Invalid subject ID');
      }

      for (const teacherId of selectedTeachers) {
        if (teacherId) {
          await addTeacherToSubject(teacherId, subjectId);
        }
      }

      for (const [month, monthSchedules] of Object.entries(schedules)) {
        for (const [day, daySchedules] of Object.entries(monthSchedules)) {
          // Explicitly type daySchedules as an array of your schedule type
          const schedulesArray = daySchedules as Array<any>;
          console.log('Schedules:', schedulesArray);
          for (const schedule of schedulesArray) {
            if (schedule.startTime && schedule.endTime) {
              await createSubjectSchedule(subjectId, {
                ...schedule,
                day: parseInt(day),
                month: parseInt(month)
              });
            }
          }
        }
      }
      await onSubjectCreated();

      setSuccessMessage('Materia creada exitosamente');
      setErrorMessage('');
    } catch (error) {
      console.error('Error creating subject:', error);
      setErrorMessage('Error al crear la materia');
      setSuccessMessage('');
    }
  };

  const renderScheduleTable = () => {
    const daysInMonth = new Date(2024, currentMonth, 0).getDate();
    return (
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Acción</th>
            <th className="border border-gray-300 p-2">Día</th>
            <th className="border border-gray-300 p-2">Hora entrada</th>
            <th className="border border-gray-300 p-2">Hora salida</th>
            <th className="border border-gray-300 p-2">Lugar</th>
            <th className="border border-gray-300 p-2">Aula</th>
            <th className="border border-gray-300 p-2">Copiar</th>
            <th className="border border-gray-300 p-2">Pegar</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(daysInMonth)].map((_, dayIndex) => {
            const day = dayIndex + 1;
            const day_of_week = new Date(2024, currentMonth - 1, day).getDay();
            const daySchedules: { startTime: string, endTime: string, location: string, classroom: string }[] = schedules[currentMonth]?.[day] || [{ startTime: '', endTime: '', location: '', classroom: '' }];

            function handleRemoveScheduleEntry(day: number, scheduleIndex: number): void {
              setSchedules(prevSchedules => ({
                ...prevSchedules,
                [currentMonth]: {
                  ...prevSchedules[currentMonth],
                  [day]: [
                    ...(prevSchedules[currentMonth]?.[day] || []).slice(0, scheduleIndex),
                    ...(prevSchedules[currentMonth]?.[day] || []).slice(scheduleIndex + 1)
                  ]
                }
              }));
            }

            function handleAddScheduleEntry(day: number): void {
              setSchedules(prevSchedules => ({
                ...prevSchedules,
                [currentMonth]: {
                  ...prevSchedules[currentMonth],
                  [day]: [
                    ...(prevSchedules[currentMonth]?.[day] || []),
                    { startTime: '', endTime: '', location: '', classroom: '' }
                  ]
                }
              }));
            }

            function handleCopySchedule(day: number, scheduleIndex: number): void {
              setCopiedSchedule(schedules[currentMonth]?.[day]?.[scheduleIndex]);
            }

            function handlePasteSchedule(day: number, scheduleIndex: number): void {
              if (copiedSchedule) {
                setSchedules(prevSchedules => ({
                  ...prevSchedules,
                  [currentMonth]: {
                    ...prevSchedules[currentMonth],
                    [day]: [
                      ...(prevSchedules[currentMonth]?.[day] || []).slice(0, scheduleIndex),
                      copiedSchedule,
                      ...(prevSchedules[currentMonth]?.[day] || []).slice(scheduleIndex)
                    ]
                  }
                }));
              }
            }

            return daySchedules.map((schedule, scheduleIndex) => (
              <tr key={`${day}-${scheduleIndex}`}>
                <td className="border border-gray-300 p-2">
                  {scheduleIndex === 0 ? (
                    <button onClick={() => handleAddScheduleEntry(day)}>+</button>
                  ) : (
                    <button onClick={() => handleRemoveScheduleEntry(day, scheduleIndex)}>X</button>
                  )}
                </td>
                <td className="border border-gray-300 p-2">{`${dayNames[day_of_week]} ${day}`}</td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="time"
                    value={schedule.startTime || ''}
                    onChange={(e) => handleScheduleChange(day, scheduleIndex, 'startTime', e.target.value)}
                    className="w-full p-1"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="time"
                    value={schedule.endTime || ''}
                    onChange={(e) => handleScheduleChange(day, scheduleIndex, 'endTime', e.target.value)}
                    className="w-full p-1"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <select
                    value={schedule.location || ''}
                    onChange={(e) => handleScheduleChange(day, scheduleIndex, 'location', e.target.value)}
                    className="w-full p-1"
                  >
                    <option value="">Seleccionar</option>
                    <option value="ESCL">ESCL</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Cancha">Cancha</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-2">
                  <select
                    value={schedule.classroom || ''}
                    onChange={(e) => handleScheduleChange(day, scheduleIndex, 'classroom', e.target.value)}
                    className="w-full p-1"
                  >
                    <option value="">Seleccionar</option>
                    {[...Array(16)].map((_, i) => (
                      <option key={i} value={`Aula ${i + 1}`}>Aula {i + 1}</option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 p-2">
                  <button onClick={() => handleCopySchedule(day, scheduleIndex)}>Copiar</button>
                </td>
                <td className="border border-gray-300 p-2">
                  <button onClick={() => handlePasteSchedule(day, scheduleIndex)}>Pegar</button>
                </td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear nueva materia</h1>

      

      <div className="mb-4">
        <label className="block mb-2">Nombre de la materia:</label>
        <input
          type="text"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Agregar profesores:</label>
        {selectedTeachers.map((teacherId, index) => (
          <div key={index} className="flex mb-2">
            <select
              value={teacherId}
              onChange={(e) => handleTeacherChange(index, e.target.value)}
              className="w-full p-2 border rounded mr-2"
            >
              <option value="">Seleccionar profesor</option>
              {teachers.map((teacher) => (
                <option key={teacher.user_id} value={teacher.user_id}>
                  {`${teacher.name} (${teacher.dni})`}
                </option>
              ))}
            </select>
            <button onClick={() => handleRemoveTeacher(index)} className="px-2 py-1 bg-red-500 text-white rounded">
              X
            </button>
          </div>
        ))}
        <button onClick={handleAddTeacher} className="px-2 py-1 bg-blue-500 text-white rounded">
          Agregar profesor
        </button>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Horarios:</label>
        <div className="flex flex-wrap mb-2">
          {monthNames.map((month, index) => (
            <button
              key={index}
              onClick={() => setCurrentMonth(index + 1)}
              className={`px-2 py-1 mr-1 mb-1 ${currentMonth === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
            >
              {month}
            </button>
          ))}
        </div>
        {renderScheduleTable()}
      </div>

      <button onClick={handleCreateSubject} className="px-4 py-2 bg-green-500 text-white rounded">
        Guardar materia
      </button>
      {errorMessage && <div className="mb-4 mt-8  p-2 bg-red-500 text-white rounded">{errorMessage}</div>}
      {successMessage && <div className="mb-4 mt-8 p-2 bg-green-500 text-white rounded">{successMessage}</div>}
      <Link href={`/home/admin/cursos/curso/${courseId}`} className="block text-blue-500 hover:underline ml-12 mb-4 inline-block">
                ← Volver a la lista de cursos
            </Link>
    </div>
  );
}