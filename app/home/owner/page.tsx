"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { getUsersByRole } from '@/app/lib/userActions';
import AdminManagement from '@/app/components/ownerManagement/usuariosAdmin/adminManagement';
import TeacherManagement from '@/app/components/ownerManagement/usuariosProfesores/teacherManagement';
import StudentManagement from '@/app/components/ownerManagement/usuariosEstudiantes/studentManagement';

const OwnerHomePage = () => {
    const [activeSection, setActiveSection] = useState('Administradores');
    const [activeSubSection, setActiveSubSection] = useState('Existentes');
    const [users, setUsers] = useState<any[]>([]);

    const fetchUsers = useCallback(async () => {
        try {
            const role = activeSection === 'Administradores' ? 'admin' : 
                         activeSection === 'Profesores' ? 'teacher' : 'student';
            const fetchedUsers = await getUsersByRole(role);
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }, [activeSection]);

    useEffect(() => {
        fetchUsers();
    }, [activeSection, fetchUsers]); // Include fetchUsers in the dependency array

    const handleSectionChange = (section: React.SetStateAction<string>) => {
        if (section !== activeSection) { // Evitar recargas innecesarias
            setActiveSection(section);
            setActiveSubSection('Existentes');
            setUsers([]); // Limpia los usuarios actuales mientras se cargan los nuevos
        }
    };

    const handleSubSectionChange = (subSection: React.SetStateAction<string>) => {
        setActiveSubSection(subSection);
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
            {activeSection === 'Administradores' && (
                <AdminManagement 
                    users={users} 
                    activeSubSection={activeSubSection} 
                    fetchUsers={fetchUsers} 
                />
            )}
            {activeSection === 'Profesores' && (
                <TeacherManagement 
                    users={users} 
                    activeSubSection={activeSubSection} 
                    fetchUsers={fetchUsers} 
                    canCreate={false}
                    canDelete={false}
                />
            )}
            {activeSection === 'Alumnos' && (
                <StudentManagement 
                    users={users} 
                    activeSubSection={activeSubSection} 
                    fetchUsers={fetchUsers} 
                    canCreate={false}
                    canDelete={false}
                />
            )}
        </div>
    );
};

export default OwnerHomePage;