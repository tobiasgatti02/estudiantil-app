import React, { useState } from 'react';
import { createUser, updateUser, deleteUser } from '@/app/lib/userActions';

const StudentManagement = ({ users, activeSubSection, fetchUsers }) => {
    const [newStudent, setNewStudent] = useState({
        name: '',
        dni: '',
        password: '',
        user_type: 'student'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStudent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
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
            console.error('Error creating student:', error);
            alert('Error al crear estudiante');
        }
    };

    const handleDeleteStudent = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
            try {
                await deleteUser(id.toString());
                alert('Estudiante eliminado exitosamente');
                fetchUsers();
            } catch (error) {
                console.error('Error deleting student:', error);
                alert('Error al eliminar estudiante');
            }
        }
    };

    const handleSaveChanges = async (student: { id?: React.Key | null | undefined; name: string | number | readonly string[] | undefined; dni: string | number | readonly string[] | undefined; password: string | number | readonly string[] | undefined; role?: string | undefined; permissions?: { can_create_teachers?: boolean; can_delete_teachers?: boolean; can_create_students?: boolean; can_delete_students?: boolean; can_create_careers?: boolean; can_create_courses?: boolean; } | undefined; }) => {
        try {
            await updateUser(student);
            alert('Cambios guardados exitosamente');
            fetchUsers();
        } catch (error) {
            console.error('Error updating student:', error);
            alert('Error al guardar cambios');
        }
    };

    return (
        <div>
            {activeSubSection === 'Existentes' && (
                <div>
                    {users.map((student: { id:number; name: string | number | readonly string[] | undefined; dni: string | number | readonly string[] | undefined; password: string | number | readonly string[] | undefined; }) => (
                        <div key={student.id} className="bg-gray-100 p-4 mb-4 rounded">
                            <input type="text" defaultValue={student.name} className="mb-2 p-2 w-full" readOnly />
                            <input type="text" defaultValue={student.dni} className="mb-2 p-2 w-full" readOnly />
                            <input type="text" defaultValue={student.password} className="mb-2 p-2 w-full" onChange={(e) => student.password = e.target.value} />
                            <button onClick={() => handleDeleteStudent(student.id)} className="bg-red-500 text-white px-4 py-2 mr-2">
                                Eliminar estudiante
                            </button>
                            <button onClick={() => handleSaveChanges(student)} className="bg-green-500 text-white px-4 py-2">
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
                            type="text" 
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
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 mt-4">
                        Crear estudiante
                    </button>
                </form>
            )}
        </div>
    );
};

export default StudentManagement;