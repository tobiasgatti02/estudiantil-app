'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CarreraForm from '@/app/components/carreras/carreras';
import { getCarreras } from '@/app/lib/adminActions';
import { getAdminByDni } from '@/app/lib/userActions';

export default function CarrerasPage() {
  const { data: session } = useSession(); // Obtén la sesión
  const [carreras, setCarreras] = useState<any[]>([]);
  const [canCreateCareers, setCanCreateCareers] = useState(false);

  useEffect(() => {
    async function fetchCarreras() {
      try {
        const fetchedCarreras = await getCarreras();
        setCarreras(fetchedCarreras);
      } catch (error) {
        console.error("Error fetching carreras:", error);
      }
    }
    fetchCarreras();
  }, []);

  useEffect(() => {
    async function checkPermissions() {
      try {
        if (session?.user?.dni) {
          const admin = await getAdminByDni(session.user.dni);
          if (admin?.can_create_careers) {
            setCanCreateCareers(true);
          }
        }
      } catch (error) {
        console.error("Error checking admin permissions:", error);
      }
    }
    checkPermissions();
  }, [session]);

  const handleCarreraCreated = async () => {
    try {
      const updatedCarreras = await getCarreras();
      setCarreras(updatedCarreras);
    } catch (error) {
      console.error("Error fetching carreras:", error);
    }
  };

  return (
    <div>
      <h1>Carreras</h1>
      {canCreateCareers && (
        <CarreraForm onCarreraCreated={handleCarreraCreated} />
      )}
      <ul>
        {carreras.map(carrera => (
          <li key={carrera.id}>{carrera.name}</li>
        ))}
      </ul>
    </div>
  );
}
