'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import CarreraForm from '@/app/components/carreras/carreras';
import { getCarreras, deleteCarrera } from '@/app/lib/adminActions';
import { getAdminByDni } from '@/app/lib/userActions';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';

export default function CarrerasPage() {
  const { data: session } = useSession(); // Obtén la sesión
  const [carreras, setCarreras] = useState<any[]>([]);
  const [canCreateCareers, setCanCreateCareers] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const checkUserExists = async () => {
        if (session?.user?.dni || user?.dni) {
            try {
                const dni = session?.user?.dni || user?.dni || '';
                const admin = await getAdminByDni(dni);
                if (!admin) {
                    await signOut({ redirect: true, callbackUrl: '/auth/login' });
                }
            } catch (error) {
                console.error('Error checking user existence:', error);
            }
        }
    };

    // Check immediately and then every 30 seconds
    checkUserExists();
    const intervalId = setInterval(checkUserExists, 30000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
}, [session]);

  useEffect(() => {
    
    if (user && user.permissions) {
      // @ts-ignore
      setCanCreateCareers(user.permissions.canCreateCareers);
  }
    async function fetchCarreras() {
      try {
        const fetchedCarreras = await getCarreras();
        setCarreras(fetchedCarreras);
      } catch (error) {
        console.error("Error fetching carreras:", error);
      }
    }
    fetchCarreras();
  }, [user]);

  useEffect(() => {
    async function checkPermissions() {
      try {
        if (session?.user?.dni) {
          const admin = await getAdminByDni(session.user.dni);
          if (admin?.can_create_careers) {
            setCanCreateCareers(true);
            router.refresh();

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

  const handleCarreraDeleted = async (id: number) => {
    try {
      await deleteCarrera(id);
      const updatedCarreras = await getCarreras();
      setCarreras(updatedCarreras);
    } catch (error) {
      console.error("Error deleting carrera:", error);
      setError("Error al eliminar carrera");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Carreras</h1>
      {canCreateCareers && (
        <CarreraForm onCarreraCreated={handleCarreraCreated} />
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <ul className="space-y-4 mt-4">
        {canCreateCareers && carreras.map(carrera => (
          <li key={carrera.career_id} className="flex justify-between items-center bg-gray-100 p-4 rounded shadow-md">
            <div className='md:flex text-center'>
            <span className=' '>{carrera.name}</span>
            <button
              onClick={() => handleCarreraDeleted(carrera.career_id)}
              className="md:flex md:left-8 bg-red-500 text-white px-4 py-2 rounded"
            >
              Eliminar
            </button>
            </div>
          </li>
        ))}
        
      </ul>
    </div>
  );
}