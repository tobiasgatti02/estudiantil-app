import React, { useState, useEffect } from 'react';
import { createUser, updateUser, deleteUser } from '@/app/lib/userActions';
import Logout from '@/app/auth/logOut/page';

const PermissionCheckbox = ({ id, checked, onChange, label }: { id: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string }) => (
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

const AdminForm = ({ admin, onChange, onSubmit, onDelete }: { admin: any, onChange: any, onSubmit: any, onDelete: any }) => (
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
            {admin.permissions && Object.entries(admin.permissions).map(([key, value]) => (
                <PermissionCheckbox
                    key={key}
                    id={key}
                    checked={value as boolean}
                    onChange={(e) => onChange(admin.dni, key, e.target.checked)}
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

const AdminManagement = ({ users, activeSubSection, fetchUsers }: { users: any, activeSubSection: any, fetchUsers: any }) => {
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

    const handleInputChange = (e: { target: { name: any; value: any; type: any; checked: any; }; }) => {
        const { name, value, type, checked } = e.target;
        setNewAdmin(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            permissions: type === 'checkbox' ? { ...prev.permissions, [name]: checked } : prev.permissions
        }));
    };

    const handleAdminChange = (dni: any, key: string, value: any) => {
        setAdmins((prev: { [x: string]: any; dni: any; permissions: { [x: string]: any; }; }[]) => prev.map((admin: { [x: string]: any; dni: any; permissions: { [x: string]: any; }; }) => {
            if (admin.dni === dni) {
                return {
                    ...admin,
                    [key]: key === 'password' ? value : admin[key],
                    permissions: {
                        ...admin.permissions,
                        [key]: key !== 'password' ? value : admin.permissions[key]
                    }
                };
            }
            return admin;
        }));
    };

    const handleCreateAdmin = async (e: { preventDefault: () => void; }) => {
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

    const handleDeleteAdmin = async (dni: string) => {
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

    const handleSaveChanges = async (admin: { name?: string; dni: string; password?: string; role?: string; permissions?: { can_create_teachers?: boolean; can_delete_teachers?: boolean; can_create_students?: boolean; can_delete_students?: boolean; can_create_careers?: boolean; can_create_courses?: boolean; }; }) => {
        try {
            await updateUser(admin);
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
                    {admins.map((admin: { dni: React.Key | null | undefined; }) => (
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
                    <h2 className="text-xl font-bold mb-4">Crear nuevo administrador</h2>
                    <div className="mb-2">
                        <label htmlFor="name" className="block">Nombre:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={newAdmin.name}
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
                            value={newAdmin.dni}
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
                            value={newAdmin.password}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">Permisos:</label>
                        {Object.entries(newAdmin.permissions).map(([key, value]) => (
                            <PermissionCheckbox
                                key={key}
                                id={key}
                                checked={value as boolean}
                                onChange={handleInputChange}
                                label={key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            />
                        ))}
                    </div>
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 mt-4">
                        Crear administrador
                    </button>
                </form>
            )}
        </div>
    );
};

export default AdminManagement;
