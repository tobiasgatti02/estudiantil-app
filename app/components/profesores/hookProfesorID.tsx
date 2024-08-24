import { useEffect, useState } from 'react';
import { getTeacherByDni } from '@/app/lib/teacherActions';
import { useSession } from 'next-auth/react';
import { useUser } from '@/app/context/UserContext';

function useProfesorId() {
  const [profesorId, setProfesorId] = useState<number | null>(null);
  const { data: session } = useSession();
  const { user } = useUser();
  const userDni = session?.user?.dni || user?.dni || '';

  useEffect(() => {
    const fetchProfesorId = async () => {
      if (userDni) {
        try {
            console.log('Fetching teacher ID for DNI:', userDni);
          const id = await getTeacherByDni(userDni);
          setProfesorId(Number(id));
        } catch (error) {
          console.error('Error fetching teacher ID:', error);
        }
      }
    };

    fetchProfesorId();
  }, [userDni]);

  return profesorId;
}

export default useProfesorId;
