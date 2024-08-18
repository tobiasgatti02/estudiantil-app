// /auth/register.tsx
'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { insertUser } from '../../lib/userActions';

const CreateAccountPage = () => {

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    dni: '',
    password: '',
    role: 'student'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await insertUser(userData);
      console.log('User added successfully!');
      setUserData({
        name: '',
        email: '',
        dni: '',
        password: '',
        role: 'student'
      });
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#e0e5ec] to-[#f7f9fc]">
      <div className="bg-[#ffffff] p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[#333] mb-4">Crea Tu Nueva Cuenta</h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#444] mb-1">Nombre Completo</label>
            <input
              id="name"
              name="name"
              className="w-full px-4 py-3 border border-[#ddd] rounded-lg bg-[#f9f9f9] text-[#333] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4a90e2]"
              type="text"
              placeholder="John Doe"
              value={userData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-[#444] mb-1">DNI</label>
            <input
              id="dni"
              name="dni"
              className="w-full px-4 py-3 border border-[#ddd] rounded-lg bg-[#f9f9f9] text-[#333] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4a90e2]"
              type="text"
              placeholder="123456789"
              value={userData.dni}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#444] mb-1">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              className="w-full px-4 py-3 border border-[#ddd] rounded-lg bg-[#f9f9f9] text-[#333] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4a90e2]"
              type="email"
              placeholder="john@example.com"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#444] mb-1">Contraseña</label>
            <input
              id="password"
              name="password"
              className="w-full px-4 py-3 border border-[#ddd] rounded-lg bg-[#f9f9f9] text-[#333] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4a90e2]"
              type="password"
              placeholder="••••••••"
              value={userData.password}
              onChange={handleChange}
              required
            />
            <p className="text-gray-500 text-xs mt-1">Mínimo 8 caracteres, incluya mayúsculas, minúsculas y números.</p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4a90e2] text-white py-3 rounded-lg font-semibold transition duration-300 ease-in-out hover:bg-[#357ABD] focus:outline-none focus:ring-2 focus:ring-[#357ABD]"
          >
            Crear Cuenta
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-6 text-center">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/auth/login" className="text-[#4a90e2] hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

CreateAccountPage.displayName = 'CreateAccountPage';
export default CreateAccountPage;
