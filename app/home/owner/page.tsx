"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUsersByRole } from '@/app/lib/actions';

const OwnerHomePage = () => {
    const [activeSection, setActiveSection] = useState('Administradores');
    const [activeSubSection, setActiveSubSection] = useState('Existentes');
    const [users, setUsers] = useState<any[]>([]);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin'
    });
    const router = useRouter();

  
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                let role;
                switch (activeSection) {
                    case 'Administradores':
                        role = 'admin';
                        break;
                    case 'Profesores':
                        role = 'teacher';
                        break;
                    case 'Alumnos':
                        role = 'student';
                        break;
                    default:
                        role = 'admin';
                }
                const fetchedUsers = await getUsersByRole(role);
                setUsers(fetchedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, [activeSection]);

    const handleSectionChange = (section: React.SetStateAction<string>) => {
        setActiveSection(section);
        setActiveSubSection('Existentes');
    };

    const handleSubSectionChange = (subSection: React.SetStateAction<string>) => {
        setActiveSubSection(subSection);
    };

    const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setNewUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateUser = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        // Implementar lógica de creación de usuario aquí
        console.log('Creating new user:', newUser);
        // Resetear formulario después de enviar
        setNewUser({
            name: '',
            email: '',
            password: '',
            role: 'admin'
        });
    };

    const handleDeleteUser = async (id: any) => {
        // Implementar funcionalidad de eliminar usuario
        console.log(`Deleting user with ID: ${id}`);
    };

    const handleSaveChanges = async (user: any) => {
        // Implementar funcionalidad de guardar cambios
        console.log(`Saving changes for user:`, user);
    };


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gestionar usuarios</h1>
            <div className="mb-4">
                {['Administradores', 'Profesores', 'Alumnos'].map((section) => (
                    <button 
                        key={section}
                        onClick={() => handleSectionChange(section)}
                        className={`px-4 py-2 mr-2 ${activeSection === section ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
                    >
                        {section}
                    </button>
                ))}
            </div>
            <div className="mb-4">
                {['Crear nuevo', 'Existentes'].map((subSection) => (
                    <button 
                        key={subSection}
                        onClick={() => handleSubSectionChange(subSection)}
                        className={`px-4 py-2 mr-2 ${activeSubSection === subSection ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
                    >
                        {subSection}
                    </button>
                ))}
            </div>
            {activeSubSection === 'Existentes' && (
                <div>
                    {users.map((user) => (
                        <div key={user.id} className="bg-gray-100 p-4 mb-4 rounded">
                            <input type="text" defaultValue={user.name} className="mb-2 p-2 w-full" />
                            <input type="email" defaultValue={user.email} className="mb-2 p-2 w-full" />
                            <input type="text" defaultValue={user.role} className="mb-2 p-2 w-full" readOnly />
                            <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 text-white px-4 py-2 mr-2">
                                Eliminar usuario
                            </button>
                            <button onClick={() => handleSaveChanges(user)} className="bg-green-500 text-white px-4 py-2">
                                Guardar cambios
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {activeSubSection === 'Crear nuevo' && (
                <form onSubmit={handleCreateUser} className="bg-gray-100 p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Crear nuevo {activeSection.slice(0, -2).toLowerCase()}</h2>
                    <div className="mb-2">
                        <label htmlFor="name" className="block">Nombre:</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={newUser.name} 
                            onChange={handleInputChange} 
                            className="w-full p-2 border rounded" 
                            required 
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="email" className="block">Email:</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={newUser.email} 
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
                            value={newUser.password} 
                            onChange={handleInputChange} 
                            className="w-full p-2 border rounded" 
                            required 
                        />
                    </div>
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 mt-4">
                        Crear usuario
                    </button>
                </form>
            )}
        </div>
    );
};

export default OwnerHomePage;