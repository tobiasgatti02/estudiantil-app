import React from 'react';

// Asumiendo que days y subjects son props pasadas al componente, junto con filteredSchedules
//@ts-ignore
const Horarios = ({ filteredSchedules, days, subjects }) => {
  return (
    <table className="w-full mb-8">
      <thead>
        <tr>
          <th>Día</th>
          <th>Materia</th>
          <th>Hora entrada</th>
          <th>Hora salida</th>
          <th>Lugar</th>
          <th>Aula</th>
        </tr>
      </thead>
      <tbody>
   
        {filteredSchedules.map((schedule: { day_of_month: number; subject_id: any; start_time: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; end_time: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; location: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; classroom: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }, index: React.Key | null | undefined) => (
          <tr key={index}>
            <td>{days[(schedule.day_of_month - 1) % 7]}</td>
            <td>{subjects.find((s: { subject_id: any; }) => s.subject_id === schedule.subject_id)?.name}</td>
            <td>{schedule.start_time}</td>
            <td>{schedule.end_time}</td>
            <td>{schedule.location}</td>
            <td>{schedule.classroom}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Horarios;