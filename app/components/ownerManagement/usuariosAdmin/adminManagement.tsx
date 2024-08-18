import React, { useState, useEffect } from 'react';
import { createUser, updateUser, deleteUser } from '@/app/lib/userActions';
import Logout from '@/app/auth/logOut/page';

const PermissionCheckbox = ({ id, checked, onChange, label }) => (
    <div>
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
        />
        <label htmlFor={id} className="ml-2">{label}</label>
    </div>
);

const AdminForm = ({ admin, onChange, onSubmit, onDelete }) => (
    <div key={admin.dni} className="bg-gray-100 p-4 mb-4 rounded">
        <input
            type="text"
            value={admin.name}
            className="mb-2 p-2 w-full"
            readOnly
        />
        <input
            type="text"
            value={admin.dni}
            className="mb-2 p-2 w-full"
            readOnly
        />
        <input
            type="text"
            value={admin.password}
            className="mb-2 p-2 w-full"
            onChange={(e) => onChange(admin.dni, 'password', e.target.value)}
        />
        <div className="mb-2">
            <label className="block mb-1">Permisos:</label>
            {Object.entries(admin.permissions).map(([key, value]) => (
                <PermissionCheckbox
                    key={key}
                    id={`${admin.dni}-${key}`}
                    checked={value}
                    onChange={(e) => onChange(admin.dni, `permissions.${key}`, e.target.checked)}
                    label={key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                />
            ))}
        </div>
        <button
            onClick={() => onDelete(admin.dni)}
            className="bg-red-500 text-white px-4 py-2 mr-2"
        >
            Eliminar administrador
        </button>
        <button
            onClick={() => onSubmit(admin)}
            className="bg-green-500 text-white px-4 py-2"
        >
            Guardar cambios
        </button>
    </div>
);

const AdminManagement = ({ users, activeSubSection, fetchUsers }) => {
    const [admins, setAdmins] = useState(users);
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        dni: '',
        password: '',
        user_type: 'admin',
        permissions: {
            canCreateTeachers: false,
            canDeleteTeachers: false,
            canCreateStudents: false,
            canDeleteStudents: false,
            canCreateCareers: false,
            canCreateCourses: false
        }
    });

    useEffect(() => {
        setAdmins(users);
    }, [users]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAdmin(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            permissions: type === 'checkbox' ? { ...prev.permissions, [name]: checked } : prev.permissions
        }));
    };

    const handleAdminChange = (dni, key, value) => {
        setAdmins(prev => prev.map(admin => {
            if (admin.dni === dni) {
                if (key.startsWith('permissions.')) {
                    const permissionKey = key.split('.')[1];
                    return {
                        ...admin,
                        permissions: {
                            ...admin.permissions,
                            [permissionKey]: value
                        }
                    };
                }
                return {
                    ...admin,
                    [key]: value
                };
            }
            return admin;
        }));
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            await createUser(newAdmin);
            alert('Administrador creado exitosamente');
            setNewAdmin({
                name: '',
                dni: '',
                password: '',
                user_type: 'admin',
                permissions: {
                    canCreateTeachers: false,
                    canDeleteTeachers: false,
                    canCreateStudents: false,
                    canDeleteStudents: false,
                    canCreateCareers: false,
                    canCreateCourses: false
                }
            });
            fetchUsers();
        } catch (error) {
            console.error('Error creating admin:', error);
            alert('Error al crear administrador');
        }
    };

    const handleDeleteAdmin = async (dni) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este administrador?')) {
            try {
                await deleteUser(dni);
                alert('Administrador eliminado exitosamente');
                fetchUsers();
            } catch (error) {
                console.error('Error deleting admin:', error);
                alert('Error al eliminar administrador');
            }
        }
    };

    const handleSaveChanges = async (admin) => {
        try {
            await updateUser({
                ...admin,
                role: 'admin',
                permissions: {
                    can_create_teachers: admin.permissions.canCreateTeachers,
                    can_delete_teachers: admin.permissions.canDeleteTeachers,
                    can_create_students: admin.permissions.canCreateStudents,
                    can_delete_students: admin.permissions.canDeleteStudents,
                    can_create_careers: admin.permissions.canCreateCareers,
                    can_create_courses: admin.permissions.canCreateCourses
                }
            });
            alert('Cambios guardados exitosamente');
            fetchUsers();
        } catch (error) {
            console.error('Error updating admin:', error);
            alert('Error al guardar cambios');
        }
    };

    return (
        <div>
            <Logout />
            {activeSubSection === 'Existentes' && (
                <div>
                    {admins.map((admin) => (
                        <AdminForm
                            key={admin.dni}
                            admin={admin}
                            onChange={handleAdminChange}
                            onSubmit={handleSaveChanges}
                            onDelete={handleDeleteAdmin}
                        />
                    ))}
                </div>
            )}
            {activeSubSection === 'Crear nuevo' && (
                <form onSubmit={handleCreateAdmin} className="bg-gray-100 p-4 rounded">
                    {/* ... (código existente para crear nuevo administrador) ... */}
                </form>
            )}
        </div>
    );
};

export default AdminManagement;