'use client';

import { useState, useEffect } from 'react';
import { getCourseByDetails, createCourse, getCarreras } from '@/app/lib/adminActions'; // Asegúrate de tener getCarreras
import { useRouter } from 'next/navigation';

export default function CreateCourseForm() {
  const [career, setCareer] = useState<string | undefined>(undefined);
  const [year, setYear] = useState<string | undefined>(undefined);
  const [careerYear, setCareerYear] = useState<string | undefined>(undefined);
  const [division, setDivision] = useState<string | undefined>(undefined);
  const [carreraOptions, setCarreraOptions] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchCarreras() {
      try {
        const fetchedCarreras = await getCarreras();
        setCarreraOptions(fetchedCarreras.map(carrera => carrera.name));
      } catch (error) {
        console.error('Error fetching carreras:', error);
      }
    }
    fetchCarreras();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!career || !year || !careerYear || !division) {
      console.error('All fields are required');
      return;
    }

    // Mapeo de valores a equivalentes numéricos
    const careerYearMapping: { [key: string]: number } = {
      'Primer año': 1,
      'Segundo año': 2,
      'Tercer año': 3,
      'Cuarto año': 4,
      'Quinto año': 5,
      'Sexto año': 6
    };

    const divisionMapping: { [key: string]: string } = {
      'División A': 'A',
      'División B': 'B',
      'División C': 'C',
      'División D': 'D',
      'División E': 'E',
      'División F': 'F',
      'División G': 'G'
    };

    const mappedCareerYear = careerYearMapping[careerYear];
    const mappedDivision = divisionMapping[division];
    console.log(mappedCareerYear, mappedDivision);
    if (mappedCareerYear === undefined || mappedDivision === undefined) {
      console.error('Invalid career year or division');
      return;
    }

    try {
      
      const existingCourses = await getCourseByDetails(career, parseInt(year), mappedCareerYear, mappedDivision);
      if (existingCourses.length > 0) {
        console.error('Course already exists');
        return;
      }

      await createCourse(career, parseInt(year), mappedCareerYear, mappedDivision);
      router.refresh();
      setCareer(undefined);
      setYear(undefined);
      setCareerYear(undefined);
      setDivision(undefined);
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="career" className="block mb-1">Carrera:</label>
        <select
          id="career"
          value={career}
          onChange={(e) => setCareer(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        >
          <option value="" disabled>Select a career</option>
          {carreraOptions.map(carrera => (
            <option key={carrera} value={carrera}>{carrera}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="year" className="block mb-1">Año:</label>
        <select
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        >
          <option value="" disabled>Select a year</option>
          {Array.from({ length: 43 }, (_, i) => 1998 + i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="careerYear" className="block mb-1">Año de carrera:</label>
        <select
          id="careerYear"
          value={careerYear}
          onChange={(e) => setCareerYear(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        >
          <option value="" disabled>Select career year</option>
          {['Primer año', 'Segundo año', 'Tercer año', 'Cuarto año', 'Quinto año', 'Sexto año'].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="division" className="block mb-1">División:</label>
        <select
          id="division"
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        >
          <option value="" disabled>Select division</option>
          {['División A', 'División B', 'División C', 'División D', 'División E', 'División F', 'División G'].map(division => (
            <option key={division} value={division}>{division}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Crear curso
      </button>
    </form>
  );
}
