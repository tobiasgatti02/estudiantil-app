import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getTeachers, addTeacherToSubject, createSubjectSchedule, getSubjectSchedule, addSubjectSchedule, updateSubjectSchedule, deleteSubjectSchedule, getTeachersForSubject, deleteTeacherFromSubject } from '@/app/lib/adminActions';

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function SubjectSchedule() {
  const params = useParams();
  const subjectId = Number(params.materia);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    day_of_month: 0,
    start_time: '',
    end_time: '',
    location: '',
    classroom: '',
    month: 0
  });
  const [editSchedule, setEditSchedule] = useState<any | null>(null);
  
  const [subjectTeachers, setSubjectTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedTeachers, setSelectedTeachers] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [monthSchedules, setMonthSchedules] = useState<{ [key: number]: any }>({});
  const [copiedSchedule, setCopiedSchedule] = useState(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [teachers, schedulesForSubject, subjectTeachers] = await Promise.all([
          getTeachers(),
          getSubjectSchedule(subjectId),
          getTeachersForSubject(subjectId)
        ]);
        setTeachers(teachers);
        setSchedules(schedulesForSubject);
        setSubjectTeachers(subjectTeachers);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, [subjectId]);

  const isValidSchedule = (schedule: any) => {
    return (
      schedule.day_of_month >= 0 &&
      schedule.month >= 0 &&
      schedule.start_time &&
      schedule.end_time &&
      schedule.location.trim() !== '' &&
      schedule.classroom.trim() !== ''
    );
  };

  const handleAddSchedule = async () => {
    try {
      if (newSchedule.day_of_month === null || newSchedule.day_of_month === undefined) {
        throw new Error('day_of_month is required');
      }
      
      const scheduleId = await addSubjectSchedule(
        subjectId,
        newSchedule.day_of_month,
        newSchedule.start_time,
        newSchedule.end_time,
        newSchedule.location,
        newSchedule.classroom,
        newSchedule.month
      );
      
      setSchedules(prevSchedules => [...prevSchedules, { ...newSchedule, schedule_id: scheduleId }]);
      setNewSchedule({
        day_of_month: 0,
        start_time: '',
        end_time: '',
        location: '',
        classroom: '',
        month: 0
      });
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };
  

  const handleUpdateSchedule = async (scheduleId: number, updatedSchedule: any) => {
    if (!isValidSchedule(updatedSchedule) || updatedSchedule.day_of_month === null || updatedSchedule.day_of_month === undefined) {
      console.error('Invalid schedule data');
      return;
    }
  
    try {
      await updateSubjectSchedule(
        scheduleId,
        updatedSchedule.day_of_month,
        updatedSchedule.start_time,
        updatedSchedule.end_time,
        updatedSchedule.location,
        updatedSchedule.classroom,
        updatedSchedule.month
      );
      setSchedules(prevSchedules => prevSchedules.map(schedule => schedule.schedule_id === scheduleId ? updatedSchedule : schedule));
      setEditSchedule(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };
  
  const handleSaveTeachers = async () => {
    const teachersToAdd = selectedTeachers.filter(id => id !== '');
    if (teachersToAdd.length === 0) {
      setMessage('Por favor, seleccione al menos un profesor para agregar.');
      return;
    }

    try {
      for (const teacherId of teachersToAdd) {
        await addTeacherToSubject(teacherId, subjectId);
      }
      const updatedSubjectTeachers = await getTeachersForSubject(subjectId);
      setSubjectTeachers(updatedSubjectTeachers);
      setSelectedTeachers(['']);
      setMessage('Profesores agregados correctamente.');
    } catch (error) {
      console.error('Error adding teachers:', error);
      setMessage('Error al agregar profesores. Por favor, intente de nuevo.');
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      await deleteSubjectSchedule(scheduleId);
      setSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.schedule_id !== scheduleId));
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  

  const handleRemoveTeacher = async (teacherId: number) => {
    try {
      console.log('Removing teacher:', teacherId);
      await deleteTeacherFromSubject(subjectId, teacherId);
      const updatedSubjectTeachers = await getTeachersForSubject(subjectId);
      setSubjectTeachers(updatedSubjectTeachers);
      setMessage('Profesor eliminado correctamente.');
    } catch (error) {
      console.error('Error removing teacher:', error);
      setMessage('Error al eliminar el profesor. Por favor, intente de nuevo.');
    }
  };

  const handleTeacherChange = (index: number, value: string) => {
    const newTeachers = [...selectedTeachers];
    newTeachers[index] = value;
    setSelectedTeachers(newTeachers);
  };

  const handleScheduleChange = (day: number, index: number, field: string, value: string) => {
    setMonthSchedules(prevSchedules => ({
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

  const handleAddScheduleEntry = (day: number) => {
    setMonthSchedules(prevSchedules => ({
      ...prevSchedules,
      [currentMonth]: {
        ...prevSchedules[currentMonth],
        [day]: [
          ...(prevSchedules[currentMonth]?.[day] || []),
          { startTime: '', endTime: '', location: '', classroom: '' }
        ]
      }
    }));
  };

  const handleRemoveScheduleEntry = (day: number, index: number) => {
    setMonthSchedules(prevSchedules => ({
      ...prevSchedules,
      [currentMonth]: {
        ...prevSchedules[currentMonth],
        [day]: [
          ...(prevSchedules[currentMonth]?.[day] || []).slice(0, index),
          ...(prevSchedules[currentMonth]?.[day] || []).slice(index + 1)
        ]
      }
    }));
  };

  const handleUpdateSchedules = async () => {
    try {
      for (const [month, monthData] of Object.entries(monthSchedules)) {
        for (const [day, daySchedules] of Object.entries(monthData)) {
          const schedulesArray = daySchedules as Array<any>;
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
      alert('Horarios actualizados exitosamente');
      // Refresh schedules after update
      const updatedSchedules = await getSubjectSchedule(subjectId);
      setSchedules(updatedSchedules);
    } catch (error) {
      console.error('Error updating schedules:', error);
      alert('Error al actualizar los horarios');
    }
  };

  const handleAddTeacherSelect = () => {
    setSelectedTeachers([...selectedTeachers, '']); // Agrega un nuevo selector vacío
  };
  const handleCopySchedule = (day: number, index: string | number) => {
    setCopiedSchedule(monthSchedules[currentMonth]?.[day]?.[index]);
  };

  const handleRemoveTeacherSelect = (index: number) => {
    const newTeachers = selectedTeachers.filter((_, i) => i !== index);
    setSelectedTeachers(newTeachers);
  };

  const handlePasteSchedule = (day: number, index: number) => {
    if (copiedSchedule) {
      const schedule = copiedSchedule as any; // Type assertion
      handleScheduleChange(day, index, 'startTime', schedule.startTime);
      handleScheduleChange(day, index, 'endTime', schedule.endTime);
      handleScheduleChange(day, index, 'location', schedule.location);
      handleScheduleChange(day, index, 'classroom', schedule.classroom);
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
            const day_of_month = new Date(2024, currentMonth - 1, day).getDay();
            const daySchedules = monthSchedules[currentMonth]?.[day] || [{ startTime: '', endTime: '', location: '', classroom: '' }];

            return daySchedules.map((schedule: { startTime: any; endTime: any; location: any; classroom: any; }, scheduleIndex: number) => (
              <tr key={`${day}-${scheduleIndex}`}>
                <td className="border border-gray-300 p-2">
                  {scheduleIndex === 0 ? (
                    <button onClick={() => handleAddScheduleEntry(day)}>+</button>
                  ) : (
                    <button onClick={() => handleRemoveScheduleEntry(day, scheduleIndex)}>X</button>
                  )}
                </td>
                <td className="border border-gray-300 p-2">{`${dayNames[day_of_month]} ${day}`}</td>
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
    <div className="mt-4 px-4">
      <h2 className="text-xl font-semibold mb-4">Horarios de la materia</h2>
      
      <ul className="space-y-4">
        {schedules.map((schedule) => (
          <li key={schedule.schedule_id} className="bg-white p-4 rounded shadow-md overflow-x-auto">
            <div className="flex flex-wrap gap-2">
              {editSchedule?.schedule_id === schedule.schedule_id ? (
                <>
                  <input
                    type="number"
                    value={editSchedule.day_of_month}
                    onChange={(e) => setEditSchedule({ ...editSchedule, day_of_month: parseInt(e.target.value) })}
                    className="px-3 py-2 border rounded flex-1 min-w-[120px]"
                    placeholder="Día de la semana"
                  />
                  
                  <input
                    type="time"
                    value={editSchedule.start_time}
                    onChange={(e) => setEditSchedule({ ...editSchedule, start_time: e.target.value })}
                    className="px-3 py-2 border rounded flex-1 min-w-[120px]"
                    placeholder="Hora de entrada"
                  />
                  <input
                    type="time"
                    value={editSchedule.end_time}
                    onChange={(e) => setEditSchedule({ ...editSchedule, end_time: e.target.value })}
                    className="px-3 py-2 border rounded flex-1 min-w-[120px]"
                    placeholder="Hora de salida"
                  />
                  <input
                    type="text"
                    value={editSchedule.location}
                    onChange={(e) => setEditSchedule({ ...editSchedule, location: e.target.value })}
                    className="px-3 py-2 border rounded flex-1 min-w-[120px]"
                    placeholder="Lugar"
                  />
                  <input
                    type="text"
                    value={editSchedule.classroom}
                    onChange={(e) => setEditSchedule({ ...editSchedule, classroom: e.target.value })}
                    className="px-3 py-2 border rounded flex-1 min-w-[120px]"
                    placeholder="Aula"
                  />
                  <input
                    type="number"
                    value={editSchedule.month}
                    onChange={(e) => setEditSchedule({ ...editSchedule, month: parseInt(e.target.value) })}
                    className="px-3 py-2 border rounded flex-1 min-w-[120px]"
                    placeholder="Mes"
                  />
                  <button
                    onClick={() => handleUpdateSchedule(schedule.schedule_id, editSchedule)}
                    className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${!isValidSchedule(editSchedule) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!isValidSchedule(editSchedule)}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditSchedule(null)}
                    className="ml-2 text-gray-500 hover:underline"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                <div className='flex gap-2'>
                  <span className="block mb-1">Día: {schedule.day_of_month}</span>
                  <span className="block mb-1">Entrada: {schedule.start_time}</span>
                  <span className="block mb-1">Salida: {schedule.end_time}</span>
                  <span className="block mb-1">Lugar: {schedule.location}</span>
                  <span className="block mb-1">Aula: {schedule.classroom}</span>
                  <span className="block mb-1">Mes: {schedule.month}</span>
                  <div className="space-x-2 ">
                    <button
                      onClick={() => setEditSchedule(schedule)}
                      className="text-blue-500 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.schedule_id)}
                      className="text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      
     

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Horarios por mes</h3>
        <div className="flex mb-2">
          {monthNames.map((month, index) => (
            <button
              key={index}
              onClick={() => setCurrentMonth(index + 1)}
              className={`px-2 py-1 mr-1 ${currentMonth === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
            >
              {month}
            </button>
          ))}
        </div>
        {renderScheduleTable()}
      </div>

      <div className="mt-8">
      {message && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}
        <h3 className="text-lg font-semibold mb-2">Profesores de la materia</h3>
        <ul className="space-y-2">
          {subjectTeachers.map((teacher) => (
            <li key={teacher.teacher_id} className="flex justify-between items-center">
              <span>{`${teacher.name} (${teacher.dni})`}</span>
              <button 
                onClick={() => handleRemoveTeacher(teacher.teacher_id)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8">
        
        <h3 className="text-lg font-semibold mb-2">Agregar profesores</h3>
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
            <button onClick={() => handleRemoveTeacherSelect(index)} className="px-2 py-1 bg-red-500 text-white rounded">
              X
            </button>
          </div>
        ))}
        <button onClick={handleAddTeacherSelect} className="px-2 py-1 bg-blue-500 text-white rounded">
          Agregar profesor
        </button>
      </div>

      <div className="mt-8">
        <button 
          onClick={handleSaveTeachers}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Guardar cambios de profesores
        </button>
      </div>
      <div className="mt-8">
        <button 
          onClick={handleUpdateSchedules}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Actualizar Horarios
        </button>
      </div>
    </div>
    

    
  );
}