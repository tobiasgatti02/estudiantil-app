'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getAdminByDni, getUsersByRole } from '@/app/lib/userActions';
import TeacherManagement from '@/app/components/ownerManagement/usuariosProfesores/teacherManagement';
import StudentManagement from '@/app/components/ownerManagement/usuariosEstudiantes/studentManagement';

const AdminCreateUsers = () => {
    const { data: session } = useSession(); // Obtén la sesión
    const [activeSection, setActiveSection] = useState('Profesores');
    const [activeSubSection, setActiveSubSection] = useState('Existentes');
    const [users, setUsers] = useState<any[]>([]);
    const [permissions, setPermissions] = useState({
        can_create_teachers: false,
        can_delete_teachers: false,
        can_create_students: false,
        can_delete_students: false
    });

    useEffect(() => {
        async function fetchPermissions() {
            try {
                if (session?.user?.dni) {
                    const admin = await getAdminByDni(session.user.dni);
                    setPermissions({
                        can_create_teachers: admin?.can_create_teachers || false,
                        can_delete_teachers: admin?.can_delete_teachers || false,
                        can_create_students: admin?.can_create_students || false,
                        can_delete_students: admin?.can_delete_students || false
                    });
                }
            } catch (error) {
                console.error('Error fetching permissions:', error);
            }
        }

        fetchPermissions();
    }, [session]);

    useEffect(() => {
        fetchUsers();
    }, [activeSection]); 

    const fetchUsers = async () => {
        try {
            const role = activeSection === 'Profesores' ? 'teacher' : 'student';
            const fetchedUsers = await getUsersByRole(role);
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSectionChange = (section: React.SetStateAction<string>) => {
        if (section !== activeSection) { 
            setActiveSection(section);
            setActiveSubSection('Existentes');
            setUsers([]); 
        }
    };

    const handleSubSectionChange = (subSection: React.SetStateAction<string>) => {
        setActiveSubSection(subSection);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gestionar usuarios</h1>
            <div className="mb-4">
                {permissions.can_create_teachers || permissions.can_delete_teachers ? (
                    <button 
                        onClick={() => handleSectionChange('Profesores')}
                        className={`px-4 py-2 mr-2 ${activeSection === 'Profesores' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
                    >
                        Profesores
                    </button>
                ) : null}
                {permissions.can_create_students || permissions.can_delete_students ? (
                    <button 
                        onClick={() => handleSectionChange('Alumnos')}
                        className={`px-4 py-2 mr-2 ${activeSection === 'Alumnos' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
                    >
                        Alumnos
                    </button>
                ) : null}
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

            {activeSection === 'Profesores' && (
                <TeacherManagement 
                    users={users} 
                    activeSubSection={activeSubSection} 
                    fetchUsers={fetchUsers} 
                    canCreate={permissions.can_create_teachers}
                    canDelete={permissions.can_delete_teachers}
                />
            )}
            {activeSection === 'Alumnos' && (
                <StudentManagement 
                    users={users} 
                    activeSubSection={activeSubSection} 
                    fetchUsers={fetchUsers} 
                    canCreate={permissions.can_create_students}
                    canDelete={permissions.can_delete_students}
                />
            )}
        </div>
    );
};

export default AdminCreateUsers;
