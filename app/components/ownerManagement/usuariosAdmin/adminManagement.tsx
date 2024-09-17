"use client"
import { getUsersByRole, updateUser, createUser, deleteUser } from '@/app/lib/userActions';
import { useState } from 'react';
import { checkDniExists } from '@/app/lib/userActions'; // Asegúrate de importar la función

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
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

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
    if (!newAdmin.name || !newAdmin.password || !newAdmin.dni) {
      setSaveMessage({ message: 'Todos los campos son obligatorios.', error: true });
      return;
    }

    const dniRegex = /^[0-9]+$/;
    if (!dniRegex.test(newAdmin.dni)) {
      setSaveMessage({ message: 'El DNI solo puede contener números.', error: true });
      return;
    }
  
    if (parseInt(newAdmin.dni) < 0) {
      setSaveMessage({ message: 'El DNI no puede ser negativo.', error: true });
      return;
    }
  
    try {

      const dniExists = await checkDniExists(newAdmin.dni);
      if (dniExists) {
        setSaveMessage({ message: 'Error: El DNI coincide con el de otro usuario ya existente.', error: true });
        return;
      }
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
      })
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
    if (!editingAdmin[adminId].password) {
      setSaveMessage({ message: 'La contraseña no puede estar vacía.', error: true });
      return
    }
    
    try {
      
      const adminData = editingAdmin[adminId];
      await updateUser({
        dni: adminData.dni,
        password: adminData.password,
        role: 'admin',
        permissions: adminData.permissions
      });
      fetchUsers();
      setEditingUserId(null);
      setIsEditing(false);
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
    setEditingUserId(user.user_id);
    setIsEditing(true);
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
              onKeyDown={(e) => {
                if (e.key === '.' || e.key.toLowerCase() === 'e' || e.key.toLowerCase() === '-'
                  || e.key.toLowerCase() === ',' || e.key.toLowerCase() === '+') {
                  e.preventDefault();
                }
              }}
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
                        disabled={editingUserId !== user.user_id}
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
                      <button
                        onClick={() => handleDeleteAdmin(user.dni)}
                        className="px-4 py-2 bg-red-500 text-white rounded ml-2"
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