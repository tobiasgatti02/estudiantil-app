"use client"
import React, { useState, useEffect } from 'react';
import { getUsersByRole, updateUser, createUser } from '@/app/lib/userActions';

const AdminManagement = ({ users, activeSubSection, fetchUsers }: {
  users: any[],
  activeSubSection: string,
  fetchUsers: () => void
}) => {
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    dni: '',
    password: '',
    permissions: {
      canCreateTeachers: false,
      canDeleteTeachers: false,
      canCreateStudents: false,
      canDeleteStudents: false,
      canCreateCareers: false,
      canCreateCourses: false
    }
  });

  const [editingAdmin, setEditingAdmin] = useState<{ [key: number]: any }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [name]: checked }
    }));
  };

  const handleCreateAdmin = async () => {
    try {
      await createUser({
        name: newAdmin.name,
        dni: newAdmin.dni,
        password: newAdmin.password,
        user_type: 'admin',
        permissions: newAdmin.permissions
      });
      setNewAdmin({
        name: '',
        dni: '',
        password: '',
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
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>, adminId: number) => {
    const { name, value } = e.target;
    setEditingAdmin(prev => ({
      ...prev,
      [adminId]: { ...prev[adminId], [name]: value }
    }));
  };

  const handleEditPermissionsChange = (e: React.ChangeEvent<HTMLInputElement>, adminId: number) => {
    const { name, checked } = e.target;
    setEditingAdmin(prev => ({
      ...prev,
      [adminId]: {
        ...prev[adminId],
        permissions: { ...prev[adminId].permissions, [name]: checked }
      }
    }));
  };

  const handleSaveChanges = async (adminId: number) => {
    try {
      const adminData = editingAdmin[adminId];
      await updateUser({
        dni: adminData.dni,
        password: adminData.password,
        role: 'admin',
        permissions: adminData.permissions
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating admin:', error);
    }
  };

  const startEditing = (user: any) => {
    setEditingAdmin(prev => ({
      ...prev,
      [user.user_id]: {
        ...user,
        permissions: user.additional_info?.permissions || {
          canCreateTeachers: false,
          canDeleteTeachers: false,
          canCreateStudents: false,
          canDeleteStudents: false,
          canCreateCareers: false,
          canCreateCourses: false
        }
      }
    }));
  };

  return (
    <div>
      {activeSubSection === 'Crear nuevo' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Crear Nuevo Administrador</h2>
          <div className="mb-4">
            <label className="block mb-2">Nombre:</label>
            <input
              type="text"
              name="name"
              value={newAdmin.name}
              onChange={handleInputChange}
              className="border rounded p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">DNI:</label>
            <input
              type="text"
              name="dni"
              value={newAdmin.dni}
              onChange={handleInputChange}
              className="border rounded p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Contraseña:</label>
            <input
              type="password"
              name="password"
              value={newAdmin.password}
              onChange={handleInputChange}
              className="border rounded p-2"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">Permisos:</h3>
          <div className="mb-4">
            <label className="block">
              <input
                type="checkbox"
                name="canCreateTeachers"
                checked={newAdmin.permissions.canCreateTeachers}
                onChange={handlePermissionChange}
              />
              Crear Profesores
            </label>
            <label className="block">
              <input
                type="checkbox"
                name="canDeleteTeachers"
                checked={newAdmin.permissions.canDeleteTeachers}
                onChange={handlePermissionChange}
              />
              Eliminar Profesores
            </label>
            <label className="block">
              <input
                type="checkbox"
                name="canCreateStudents"
                checked={newAdmin.permissions.canCreateStudents}
                onChange={handlePermissionChange}
              />
              Crear Alumnos
            </label>
            <label className="block">
              <input
                type="checkbox"
                name="canDeleteStudents"
                checked={newAdmin.permissions.canDeleteStudents}
                onChange={handlePermissionChange}
              />
              Eliminar Alumnos
            </label>
            <label className="block">
              <input
                type="checkbox"
                name="canCreateCareers"
                checked={newAdmin.permissions.canCreateCareers}
                onChange={handlePermissionChange}
              />
              Crear Carreras
            </label>
            <label className="block">
              <input
                type="checkbox"
                name="canCreateCourses"
                checked={newAdmin.permissions.canCreateCourses}
                onChange={handlePermissionChange}
              />
              Crear Cursos
            </label>
          </div>
          <button
            onClick={handleCreateAdmin}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Guardar Cambios
          </button>
        </div>
      )}

      {activeSubSection === 'Existentes' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Administradores Existentes</h2>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Nombre</th>
                <th className="border border-gray-300 p-2">DNI</th>
                <th className="border border-gray-300 p-2">Contraseña</th>
                <th className="border border-gray-300 p-2">Permisos</th>
                <th className="border border-gray-300 p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                user.user_type === 'admin' && (
                  <tr key={user.user_id}>
                    <td className="border border-gray-300 p-2">{user.name}</td>
                    <td className="border border-gray-300 p-2">{user.dni}</td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={editingAdmin?.[user.user_id]?.password || ''}
                        onChange={(e) => handleEditChange(e, user.user_id)}
                        name="password"
                        className="border rounded p-2"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      {editingAdmin[user.user_id] && (
                        <div>
                          <label className="block">
                            <input
                              type="checkbox"
                              name="canCreateTeachers"
                              checked={editingAdmin[user.user_id].permissions.canCreateTeachers}
                              onChange={(e) => handleEditPermissionsChange(e, user.user_id)}
                            />
                            Crear Profesores
                          </label>
                          <label className="block">
                            <input
                              type="checkbox"
                              name="canDeleteTeachers"
                              checked={editingAdmin[user.user_id].permissions.canDeleteTeachers}
                              onChange={(e) => handleEditPermissionsChange(e, user.user_id)}
                            />
                            Eliminar Profesores
                          </label>
                          <label className="block">
                            <input
                              type="checkbox"
                              name="canCreateStudents"
                              checked={editingAdmin[user.user_id].permissions.canCreateStudents}
                              onChange={(e) => handleEditPermissionsChange(e, user.user_id)}
                            />
                            Crear Alumnos
                          </label>
                          <label className="block">
                            <input
                              type="checkbox"
                              name="canDeleteStudents"
                              checked={editingAdmin[user.user_id].permissions.canDeleteStudents}
                              onChange={(e) => handleEditPermissionsChange(e, user.user_id)}
                            />
                            Eliminar Alumnos
                          </label>
                          <label className="block">
                            <input
                              type="checkbox"
                              name="canCreateCareers"
                              checked={editingAdmin[user.user_id].permissions.canCreateCareers}
                              onChange={(e) => handleEditPermissionsChange(e, user.user_id)}
                            />
                            Crear Carreras
                          </label>
                          <label className="block">
                            <input
                              type="checkbox"
                              name="canCreateCourses"
                              checked={editingAdmin[user.user_id].permissions.canCreateCourses}
                              onChange={(e) => handleEditPermissionsChange(e, user.user_id)}
                            />
                            Crear Cursos
                          </label>
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <button
                        onClick={() => handleSaveChanges(user.user_id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => startEditing(user)}
                        className="px-4 py-2 bg-green-500 text-white rounded ml-2"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;