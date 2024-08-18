// components/ScheduleManager.js
import React, { useState } from 'react';

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const ScheduleManager = ({ schedules, setSchedules, currentMonth, setCurrentMonth }) => {
  const [copiedSchedule, setCopiedSchedule] = useState(null);

  const handleScheduleChange = (day, index, field, value) => {
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

  const handleAddScheduleEntry = (day) => {
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
  };

  const handleRemoveScheduleEntry = (day, index) => {
    setSchedules(prevSchedules => ({
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

  const handleCopySchedule = (day, index) => {
    setCopiedSchedule(schedules[currentMonth]?.[day]?.[index]);
  };

  const handlePasteSchedule = (day, index) => {
    if (copiedSchedule) {
      handleScheduleChange(day, index, 'startTime', copiedSchedule.startTime);
      handleScheduleChange(day, index, 'endTime', copiedSchedule.endTime);
      handleScheduleChange(day, index, 'location', copiedSchedule.location);
      handleScheduleChange(day, index, 'classroom', copiedSchedule.classroom);
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
            const daySchedules = schedules[currentMonth]?.[day] || [{ startTime: '', endTime: '', location: '', classroom: '' }];

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
    <div>
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
  );
};

export default ScheduleManager;
