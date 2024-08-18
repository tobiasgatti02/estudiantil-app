import React, { useEffect, useState } from 'react';
import { getSubjectSchedule } from '../../lib/adminActions';
import { useParams } from 'next/navigation';

interface Schedule {
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
  classroom: string;
  month: number;
}

const VerHorarioMateria: React.FC = () => {
  const params= useParams();
  const subjectId = Number(params.materia);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const data = await getSubjectSchedule(subjectId);
        setSchedules(data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    }
    fetchSchedules();
  }, [subjectId]);

  return (
    <div>
      <h1>Horarios de la Materia</h1>
      {schedules.length > 0 ? (
        <ul>
          {schedules.map((schedule, index) => (
            <li key={index}>
              <p>Día: {schedule.day_of_week}</p>
              <p>Hora de inicio: {schedule.start_time}</p>
              <p>Hora de fin: {schedule.end_time}</p>
              <p>Ubicación: {schedule.location}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay horarios disponibles para esta materia.</p>
      )}
    </div>
  );
};

export default VerHorarioMateria;
