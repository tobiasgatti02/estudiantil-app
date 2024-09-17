'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getTeacherByDni, updateUserPassword } from '@/app/lib/teacherActions';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import Logout from '@/app/auth/logOut/page';
import { doLogout } from '@/app/lib/userActions';

export default function CuentaPage() {
  const { data: session, status } = useSession();
  interface TeacherData {
    password: string;
    user_id: string;
    name: string;
    // Add other properties as needed
  }
  
  const [datos, setDatos] = useState<TeacherData | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Estado para mensaje de éxito
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const router = useRouter();
  const user = useUser();

  const [oldPassword, setOldPassword] = useState('');

  useEffect(() => {
    if (status === "loading") return; 

    if (session?.user?.dni) {
      const fetchDatos = async () => {
        try {
          // @ts-ignore
            const userDni = session?.user?.dni || user?.dni || '';
          const data = await getTeacherByDni(userDni);
          setDatos(data);
          setOldPassword(data.password);
        } catch (err) {
          setError("Error al obtener las materias: " + (err as Error).message);
        }
      };
      
      fetchDatos();
    } else {
      setError("No se pudo obtener el DNI del usuario");
    }
  }, [session, status]);

  const handleChangePassword = async () => {
    await validateAndChangePassword(oldPassword, newPassword, confirmNewPassword);
  };


  useEffect(() => {
    if (status === "loading") return; // Don't do anything while loading

    const checkUserExists = async () => {
        //@ts-ignore
      if (session?.user?.dni || user?.dni) {
        console.log('dni de usuario:', session?.user.dni);
        try {
            //@ts-ignore
          const dni = session?.user.dni || user.dni || '';
          const teacher = await getTeacherByDni(dni);
          if (!teacher) {
            // User doesn't exist anymore, sign out
            router.push('/auth/login');
            doLogout();

          
          
          }
        } catch (error) {
          console.error('Error checking user existence:', error);
        }
      }
    };

    // Check immediately and then every 90 seconds
    checkUserExists();
    const intervalId = setInterval(checkUserExists, 90000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [session, status]);



  async function validateAndChangePassword(oldPassword: string, newPassword: string, confirmPassword: string) {
    if (newPassword === oldPassword) {
      setError('La nueva contraseña no puede ser igual a la anterior.');
      return;
    }

    if (datos && oldPassword !== datos.password) {
      setError('La contraseña actual no es correcta.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('La confirmación de la contraseña no coincide con la nueva contraseña.');
      return;
    }

    await changePassword(newPassword);
  }

  async function changePassword(newPassword: string) {
    try {
      if (datos) {
        await updateUserPassword(Number(datos.user_id), newPassword);
      }
      setSuccessMessage('Contraseña actualizada con éxito.');
      setError(''); // Limpiar mensaje de error si hay éxito
      // Refrescar la página después de un cambio exitoso
      router.refresh();
    } catch (error) {
      //@ts-ignore
      setError('Error al actualizar la contraseña: ' + error.message);
      setSuccessMessage(''); // Limpiar mensaje de éxito si hay error
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mi Cuenta</h1>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Datos Personales {datos?.name}</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Contraseña</label>
          <input
            type="text"
            value={datos?.password}
            className="w-full p-2 border border-gray-300 rounded mt-2"
            disabled
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Cambiar Contraseña</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Escribir la contraseña actual de mi cuenta</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Escribir la nueva contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Repetir la nueva contraseña</label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-2"
          />
        </div>
        <button
          onClick={handleChangePassword}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Cambiar contraseña
        </button>
      </div>
    </div>
  );
}
