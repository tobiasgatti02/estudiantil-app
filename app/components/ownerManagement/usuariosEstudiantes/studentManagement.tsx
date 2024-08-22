import React, { useState } from 'react';
import { createUser, updateUser, deleteUser } from '@/app/lib/userActions';
import { useUser } from '@/app/context/UserContext';
import { useSession } from 'next-auth/react';
interface Student {
    student_id: number;
    name: string;
    dni: string;
    password: string;
    role: string;
    permissions: any;
}

interface StudentManagementProps {
    users: Student[];
    activeSubSection: string;
    fetchUsers: () => void;
    canCreate: boolean;
    canDelete: boolean;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ users, activeSubSection, fetchUsers, canCreate, canDelete }) => {
    const [newStudent, setNewStudent] = useState({
        name: '',
        dni: '',
        password: '',
        user_type: 'student'
    });
    const { user } = useUser();
    const [saveMessage, setSaveMessage] = useState({ message: '', error: false });
    const { data: session, status } = useSession();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewStudent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudent.name || !newStudent.password || !newStudent.dni) {
            setSaveMessage({ message: 'Todos los campos son obligatorios.', error: true });
            return;
          }
      
          if (parseInt(newStudent.dni) < 0) {
            setSaveMessage({ message: 'El DNI no puede ser negativo.', error: true });
            return;
          }
        if (!canCreate && session?.user.user_type!=='owner'&& user?.role !== 'owner') {
            alert('No tienes privilegios para crear estudiantes.');
            return;
        }
        try {
            await createUser(newStudent);
            alert('Estudiante creado exitosamente');
            setNewStudent({
                name: '',
                dni: '',
                password: '',
                user_type: 'student'
            });
            fetchUsers();
        } catch (error) {
            console.error('Error creando estudiante:', error);
            alert('Error al crear estudiante');
        }
    };

    const handleDeleteStudent = async (dni: string) => {
        if (!canDelete && session?.user.user_type!=='owner' && user?.role !== 'owner') {
            alert('No tienes privilegios para eliminar estudiantes.');
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
            try {
                await deleteUser(dni);
                alert('Estudiante eliminado exitosamente');
                fetchUsers();
            } catch (error) {
                console.error('Error eliminando estudiante:', error);
                alert('Error al eliminar estudiante');
            }
        }
    };

    const handleSaveChanges = async (student: Student) => {
        try {
            await updateUser({
                ...student,
                // @ts-ignore
                name: String(student.name),
                dni: String(student.dni),
                password: String(student.password),
            });
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
                    {users.map((student) => (
                        <div key={student.dni} className="bg-gray-100 p-4 mb-4 rounded">
                            <input 
                                type="text" 
                                defaultValue={student.name} 
                                className="mb-2 p-2 w-full" 
                                readOnly 
                            />
                            <input 
                                type="text" 
                                defaultValue={student.dni} 
                                className="mb-2 p-2 w-full" 
                                readOnly 
                            />
                            <input 
                                type="text" 
                                defaultValue={student.password} 
                                className="mb-2 p-2 w-full" 
                                onChange={(e) => student.password = e.target.value} 
                            />
                            {(canDelete || session?.user.user_type ==='owner'|| user?.role === 'owner') ?  (
                                <button 
                                    onClick={() => handleDeleteStudent(student.dni)} 
                                    className="bg-red-500 text-white px-4 py-2 mr-2"
                                >
                                    Eliminar estudiante
                                </button>
                            ) : (
                              
                                    <button disabled className="bg-gray-500 text-white px-4 py-2 mr-2 cursor-not-allowed">
                                        Eliminar estudiante
                                    </button>
                                )}
                            <button 
                                onClick={() => handleSaveChanges(student)} 
                                className="bg-green-500 text-white px-4 py-2"
                            >
                                Guardar cambios
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {activeSubSection === 'Crear nuevo' && (
                <form onSubmit={handleCreateStudent} className="bg-gray-100 p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Crear nuevo estudiante</h2>
                    <div className="mb-2">
                        <label htmlFor="name" className="block">Nombre:</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={newStudent.name} 
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
                            value={newStudent.dni} 
                            onChange={handleInputChange} 
                            className="w-full p-2 border rounded" 
                            required 
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="password" className="block">Contraseña:</label>
                        <input 
                            type="text" 
                            id="password" 
                            name="password" 
                            value={newStudent.password} 
                            onChange={handleInputChange} 
                            className="w-full p-2 border rounded" 
                            required 
                        />
                    </div>
                    {(canCreate || session?.user.user_type ==='owner'|| user?.role === 'owner')?(
                        <button type="submit" className="bg-green-500 text-white px-4 py-2 mt-4">
                            Crear estudiante
                        </button>
                    ) : (
                        <button disabled className="bg-gray-500 text-white px-4 py-2 mt-4 cursor-not-allowed">
                            Crear Estudiante
                        </button>                    
                    )}
                </form>
            )}
        </div>
    );
};

export default StudentManagement;
