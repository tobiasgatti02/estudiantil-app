import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPublication, addFileToPublication, getPublicationsForSubject, deletePublication, getTeacherByDni } from '@/app/lib/teacherActions';
import { useSession } from 'next-auth/react';
import { useUser } from '@/app/context/UserContext';

export default function PublicacionesForm() {
  const [publicacion, setPublicacion] = useState({
    titulo: '',
    contenido: '',
  });
  const [archivos, setArchivos] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [publications, setPublications] = useState<any[]>([]);
  const params = useParams();
  const router = useRouter();
  const  materiaId  = params.id as string;
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
    loadPublications();
  }, [materiaId]);

  const loadPublications = async () => {
    try {
      const pubs = await getPublicationsForSubject(Number(materiaId));
      setPublications(pubs);
    } catch (error) {
      console.error('Error loading publications:', error);
    }
  };
  const uploadToCloudinary = async (file: File): Promise<{ fileName: string, fileUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'tadwuczj'); // Reemplaza con tu upload preset de Cloudinary

    const response = await fetch(`https://api.cloudinary.com/v1_1/dto6o1hst/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Error uploading file to Cloudinary');
    }

    const data = await response.json();
    return { fileName: file.name, fileUrl: data.secure_url };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPublicacion({
      ...publicacion,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos([...archivos, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setArchivos(archivos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating publication:', publicacion);
    console.log('Files:', archivos);
    console.log('Materia:', materiaId);
    


    if (publicacion.titulo.trim() === '') {
      setError('El título no puede estar vacío');
      return;
    }

    try {
      

      const publicationId = await createPublication(
        Number(materiaId),
        // @ts-ignore
        Number(profesorID.teacher_id),
        publicacion.titulo,
        publicacion.contenido
      );

      for (const archivo of archivos) {
        const { fileName, fileUrl } = await uploadToCloudinary(archivo);
        await addFileToPublication(publicationId, fileName, fileUrl);
      }

      setPublicacion({ titulo: '', contenido: '' });
      setArchivos([]);
      setError('');
      loadPublications();
    } catch (error) {
      console.error('Error creating publication:', error);
      setError('Error al crear la publicación');
    }
  };
  const handleDelete = async (publicationId: number) => {
    try {
      // @ts-ignore
      const deleted = await deletePublication(publicationId, Number(profesorID?.teacher_id));
      if (deleted) {
        loadPublications();
      } else {
        setError('No se pudo eliminar la publicación');
      }
    } catch (error) {
      console.error('Error deleting publication:', error);
      setError('Error al eliminar la publicación');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <button onClick={() => router.back()} className="mb-4">
        ← Atrás
      </button>

      <h2 className="text-2xl font-bold mb-4">Crear nueva publicación</h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="titulo" className="block mb-2">Título de la publicación</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={publicacion.titulo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="archivo" className="block mb-2">Añadir nuevo archivo</label>
          <input
            type="file"
            id="archivo"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            multiple
          />
        </div>

        {archivos.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold mb-2">Archivos cargados:</h3>
            <div className="flex flex-wrap gap-4">
              {archivos.map((archivo, index) => (
                <div key={index} className="flex items-center bg-gray-100 p-2 rounded">
                  <span className="mr-2">{archivo.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="contenido" className="block mb-2">Contenido de la publicación</label>
          <textarea
            id="contenido"
            name="contenido"
            value={publicacion.contenido}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Publicar artículo
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <h2 className="text-2xl font-bold mb-4">Publicaciones existentes</h2>

      {publications.map((pub) => (
        <div key={pub.publication_id} className="mb-4 p-4 border rounded">
          <h3 className="font-bold">{pub.title}</h3>
          <p className="text-sm text-gray-500">
            {new Date(pub.created_at).toLocaleString()}
          </p>
          {pub.files && pub.files.length > 0 && (
            <div className="mt-2">
              <h4 className="font-bold">Archivos:</h4>
              <ul>
                {pub.files.map((file: any) => (
                  <li key={file.file_id}>
                    <a href={file.file_path} download>{file.file_name}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-2">{pub.content}</p>
          {new Date(pub.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
            <button
              onClick={() => handleDelete(pub.publication_id)}
              className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
            >
              Eliminar
            </button>
          )}
          <button
            onClick={() => router.push(`/publicacion/${pub.publication_id}`)}
            className="mt-2 ml-2 bg-green-500 text-white px-2 py-1 rounded text-sm"
          >
            Ver publicación
          </button>
        </div>
      ))}
    </div>
  );
}