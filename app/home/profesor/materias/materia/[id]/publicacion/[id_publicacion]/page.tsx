"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPublicacionByID, getTeacherByDni } from '@/app/lib/teacherActions';
import { useSession } from 'next-auth/react';
import { useUser } from '@/app/context/UserContext';

export default function PublicacionDetalle() {
  const [publicacion, setPublicacion] = useState<any>(null);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const materiaId = params.id as string;
  const publicacionId = params.id_publicacion as string;
  const { data: session } = useSession();
  const { user } = useUser();
  const userDni = session?.user?.dni || user?.dni || '';
  const [profesorID, setProfesorID] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfesorID = async () => {
      try {
        const id = await getTeacherByDni(userDni);
        setProfesorID(id);
      } catch (error) {
        console.error('Error fetching profesor ID:', error);
        setError('Error al obtener el ID del profesor');
      }
    };

    fetchProfesorID();
  }, [userDni]);

  useEffect(() => {
    if (profesorID !== null) {
      loadPublication();
    }
  }, [materiaId, publicacionId, profesorID]);

  const loadPublication = async () => {
    try {
      const pub = await getPublicacionByID(Number(publicacionId));
 
        setPublicacion(pub);
     
    } catch (error) {
      console.error('Error loading publication:', error);
      setError('Error al cargar la publicación');
    }
  };

  return (
    <div className="container mx-auto p-4">
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {publicacion ? (
        <div className="mb-4 p-4 border rounded">
          <h3 className="font-bold">{publicacion.title}</h3>
          <p className="text-sm text-gray-500">
            {new Date(publicacion.created_at).toLocaleString()}
          </p>
          {publicacion.files && publicacion.files.length > 0 && (
            <div className="mt-2">
              <h4 className="font-bold">Archivos:</h4>
              <ul>
                {publicacion.files.map((file: any) => (
                  <li key={file.file_id}>
                    <a href={file.file_path} download>{file.file_name}</a>
                    <div>
                    {file.file_path.endsWith('.pdf') ? (
                        <embed src={file.file_path} type="application/pdf" className="mt-2 max-w-xs" />
                    ) : (
                        <img src={file.file_path} alt={file.file_name} className="mt-2 max-w-xs" />
                    )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-2">{publicacion.content}</p>
        </div>
      ) : (
        <p>Cargando publicación...</p>
      )}
    </div>
  );
}