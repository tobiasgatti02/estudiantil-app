import React, { useState } from 'react';
import { createUser, updateUser, deleteUser } from '@/app/lib/userActions';

const TeacherManagement = ({ users, activeSubSection, fetchUsers, canCreate, canDelete }: { users: any[], activeSubSection: string, fetchUsers: () => void, canCreate: boolean, canDelete: boolean }) => {
    const [newTeacher, setNewTeacher] = useState({
        name: '',
        dni: '',
        password: '',
        user_type: 'teacher'
    });

    const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setNewTeacher(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateTeacher = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
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
            console.error('Error creating teacher:', error);
            alert('Error al crear profesor');
        }
    };

    const handleDeleteTeacher = async (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este profesor?')) {
            try {
                await deleteUser(id);
                alert('Profesor eliminado exitosamente');
                fetchUsers();
            } catch (error) {
                console.error('Error deleting teacher:', error);
                alert('Error al eliminar profesor');
            }
        }
    };

    const handleSaveChanges = async (teacher: { name?: string; dni: string; password?: string; role?: string; permissions?: { can_create_teachers?: boolean; can_delete_teachers?: boolean; can_create_students?: boolean; can_delete_students?: boolean; can_create_careers?: boolean; can_create_courses?: boolean; }; }) => {
        try {
            // @ts-ignore
            await updateUser(teacher);
            alert('Cambios guardados exitosamente');
            fetchUsers();
        } catch (error) {
            console.error('Error updating teacher:', error);
            alert('Error al guardar cambios');
        }
    };

    return (
        <div>
            {activeSubSection === 'Existentes' && (
                <div>
                    {users.map((teacher) => (
                        <div key={teacher.teacher_id || teacher.dni} className="bg-gray-100 p-4 mb-4 rounded">
                            <input type="text" defaultValue={teacher.name} className="mb-2 p-2 w-full" readOnly />
                            <input type="text" defaultValue={teacher.dni} className="mb-2 p-2 w-full" readOnly />
                            <input type="text" defaultValue={teacher.password} className="mb-2 p-2 w-full" onChange={(e) => teacher.password = e.target.value} />
                            <button onClick={() => handleDeleteTeacher(teacher.dni)} className="bg-red-500 text-white px-4 py-2 mr-2">
                                Eliminar profesor
                            </button>
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
                            type="text" 
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
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 mt-4">
                        Crear profesor
                    </button>
                </form>
            )}
        </div>
    );
};

export default TeacherManagement;
