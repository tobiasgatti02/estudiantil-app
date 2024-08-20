"use client"
import { useState } from 'react';
import Logout from '@/app/auth/logOut/page';
import Link from 'next/link';

const menuItems = [
  { href: '/home/admin/alumnos', label: 'Crear usuarios' },
  { href: '/home/admin/carreras', label: 'Carreras' },
  { href: '/home/admin/cursos', label: 'Cursos' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="relative">
      <button
        className="md:hidden p-2 text-gray-800 bg-white rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-transform mt-4 ml-4 transform hover:scale-110"
        onClick={toggleMenu}
      >
        <span className="sr-only">Abrir menú</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          )}
        </svg>
      </button>

      {isOpen && (
        <button
          className="md:hidden p-2 text-gray-800 bg-white rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 absolute top-4 right-4 transition-transform transform hover:scale-110"
          onClick={closeMenu}
        >
          <span className="sr-only">Cerrar menú</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <nav
        className={`fixed md:relative top-0 left-0 w-64 bg-gradient-to-r from-gray-800 to-gray-900 h-screen text-white p-6 md:p-4 md:w-64 shadow-xl transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block px-4 py-2 text-lg font-medium hover:bg-gray-700 hover:rounded-md transition-colors duration-200" onClick={closeMenu}>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Logout />
          </li>
        </ul>
      </nav>
    </div>
  );
}
