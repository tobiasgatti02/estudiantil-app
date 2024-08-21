import React, { useState } from 'react';
import { createUser, updateUser, deleteUser } from '@/app/lib/userActions';
import { useUser } from '@/app/context/UserContext';

interface Teacher {
    teacher_id?: number;
    name: string;
    dni: string;
    password: string;
}
interface TeacherManagementProps {
    users: Teacher[];
    activeSubSection: string;
    fetchUsers: () => void;
    canCreate: boolean;
    canDelete: boolean;
}

const TeacherManagement: React.FC<TeacherManagementProps> = ({ users, activeSubSection, fetchUsers, canCreate, canDelete }) => {
    const [newTeacher, setNewTeacher] = useState({
        name: '',
        dni: '',
        password: '',
        user_type: 'teacher'
    });
    const { user } = useUser();
    const [saveMessage, setSaveMessage] = useState({ message: '', error: false });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewTeacher(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeacher.name || !newTeacher.password || !newTeacher.dni) {
            setSaveMessage({ message: 'Todos los campos son obligatorios.', error: true });
            return;
          }
      
          if (parseInt(newTeacher.dni) < 0) {
            setSaveMessage({ message: 'El DNI no puede ser negativo.', error: true });
            return;
          }
        try {
            await createUser(newTeacher);
            alert('Profesor creado exitosamente');
            setNewTeacher({
                name: '',
                dni: '',
                password: '',
                user_type: 'teacher'
            });
            fetchUsers();
        } catch (error) {
            console.error('Error creando profesor:', error);
            alert('Error al crear profesor');
        }
    };

    const handleDeleteTeacher = async (dni: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este profesor?')) {
            try {
                await deleteUser(dni);
                alert('Profesor eliminado exitosamente');
                fetchUsers();
            } catch (error) {
                console.error('Error eliminando profesor:', error);
                alert('Error al eliminar profesor');
            }
        }
    };

    const handleSaveChanges = async (teacher: Teacher) => {
        try {
            // @ts-ignore
            await updateUser(teacher);
            alert('Cambios guardados exitosamente');
            fetchUsers();
        } catch (error) {
            console.error('Error guardando cambios:', error);
            alert('Error al guardar cambios');
        }
    };

    return (
        <div>
            {saveMessage.message && (
        <div className={`mb-4 p-2 ${saveMessage.error ? 'bg-red-500' : 'bg-green-500'} text-white rounded`}>
          {saveMessage.message}
        </div>
      )}
            {activeSubSection === 'Existentes' && (
                <div>
                    {users.map((teacher) => (
                        <div key={teacher.teacher_id || teacher.dni} className="bg-gray-100 p-4 mb-4 rounded">
                            <input type="text" defaultValue={teacher.name} className="mb-2 p-2 w-full" readOnly />
                            <input type="text" defaultValue={teacher.dni} className="mb-2 p-2 w-full" readOnly />
                            <input 
                                type="text" 
                                defaultValue={teacher.password} 
                                className="mb-2 p-2 w-full" 
                                onChange={(e) => teacher.password = e.target.value} 
                            />
                            {(canDelete || user?.role === 'owner') ?  (
                                <button onClick={() => handleDeleteTeacher(teacher.dni)} className="bg-red-500 text-white px-4 py-2 mr-2">
                                    Eliminar profesor
                                </button>
                            ) : (
                                <button disabled className="bg-gray-500 text-white px-4 py-2 mr-2 cursor-not-allowed">
                                    Eliminar profesor
                                </button>
                            )}
                            <button onClick={() => handleSaveChanges(teacher)} className="bg-green-500 text-white px-4 py-2">
                                Guardar cambios
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {activeSubSection === 'Crear nuevo' && (
                <form onSubmit={handleCreateTeacher} className="bg-gray-100 p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Crear nuevo profesor</h2>
                    <div className="mb-2">
                        <label htmlFor="name" className="block">Nombre:</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={newTeacher.name} 
                            onChange={handleInputChange} 
                            className="w-full p-2 border rounded" 
                            required 
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="dni" className="block">DNI:</label>
                        <input 
                            type="number" 
                            id="dni" 
                            name="dni" 
                            value={newTeacher.dni} 
                            onChange={handleInputChange} 
                            className="w-full p-2 border rounded" 
                            required 
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="password" className="block">Contraseña:</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            value={newTeacher.password} 
                            onChange={handleInputChange} 
                            className="w-full p-2 border rounded" 
                            required 
                        />
                    </div>
                    {(canCreate || user?.role === 'owner') ? (
                        <button type="submit" className="bg-green-500 text-white px-4 py-2 mt-4">
                            Crear profesor
                        </button>
                    ) : (
                        <button disabled className="bg-gray-500 text-white px-4 py-2 mt-4 cursor-not-allowed">
                            Crear profesor
                        </button>
                    )}
                </form>
            )}
        </div>
    );
};

export default TeacherManagement;
