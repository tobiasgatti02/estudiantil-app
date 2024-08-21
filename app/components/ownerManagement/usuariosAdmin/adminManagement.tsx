"use client";
import { getUsersByRole, updateUser, createUser, deleteUser } from '@/app/lib/userActions';
import { useState } from 'react';

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
  const [saveMessage, setSaveMessage] = useState({ message: '', error: false });

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
    const { name, dni, password } = newAdmin;

    if (!name || !dni || !password) {
      setSaveMessage({ message: 'Todos los campos son obligatorios.', error: true });
      return;
    }

    if (parseInt(dni) <= 0) {
      setSaveMessage({ message: 'El DNI debe ser un número positivo.', error: true });
      return;
    }

    try {
      await createUser({
        name,
        dni,
        password,
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
      setSaveMessage({ message: 'Administrador creado con éxito.', error: false });
    } catch (error) {
      console.error('Error creating admin:', error);
      setSaveMessage({ message: 'Error al crear el administrador.', error: true });
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
    const adminData = editingAdmin[adminId];
    const { name, dni, password } = adminData;

    if (!name || !dni || !password) {
      setSaveMessage({ message: 'Todos los campos son obligatorios.', error: true });
      return;
    }

    if (parseInt(dni) <= 0) {
      setSaveMessage({ message: 'El DNI debe ser un número positivo.', error: true });
      return;
    }

    try {
      await updateUser({
        dni,
        password,
        role: 'admin',
        permissions: adminData.permissions
      });
      fetchUsers();
      setSaveMessage({ message: 'Cambios guardados con éxito.', error: false });
    } catch (error) {
      console.error('Error updating admin:', error);
      setSaveMessage({ message: 'Error al guardar los cambios.', error: true });
    }
  };

  const handleDeleteAdmin = async (dni: string) => {
    try {
      await deleteUser(dni);
      fetchUsers();
      setSaveMessage({ message: 'Administrador eliminado con éxito.', error: false });
    } catch (error) {
      console.error('Error deleting admin:', error);
      setSaveMessage({ message: 'Error al eliminar el administrador.', error: true });
    }
  };

  const startEditing = (user: any) => {
    setEditingAdmin(prev => ({
      ...prev,
      [user.user_id]: {
        ...user,
        permissions: user.additional_info?.permissions || {}
      }
    }));
  };

  return (
    <div>
      {saveMessage.message && (
        <div className={`mb-4 p-2 ${saveMessage.error ? 'bg-red-500' : 'bg-green-500'} text-white rounded`}>
          {saveMessage.message}
        </div>
      )}
      
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
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">DNI:</label>
            <input
              type="number"
              name="dni"
              value={newAdmin.dni}
              onChange={handleInputChange}
              className="border rounded p-2"
              required
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
              required
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
                        type="password"
                        name="password"
                        value={editingAdmin[user.user_id]?.password || user.password}
                        onChange={e => handleEditChange(e, user.user_id)}
                        className="border rounded p-2 w-full"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      {Object.keys(newAdmin.permissions).map(permission => (
                        <label key={permission} className="block">
                          <input
                            type="checkbox"
                            name={permission}
                            checked={editingAdmin[user.user_id]?.permissions?.[permission] || user.permissions?.[permission]}
                            onChange={e => handleEditPermissionsChange(e, user.user_id)}
                          />
                          {permission.replace(/can([A-Z])/g, (match, p1) => ` ${p1.toLowerCase()}`)}
                        </label>
                      ))}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <button
                        onClick={() => handleSaveChanges(user.user_id)}
                        className="px-4 py-2 bg-green-500 text-white rounded mr-2"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(user.dni)}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                      >
                        Eliminar
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
