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
        className="md:hidden p-2 text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
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

      {/* New button to close the menu */}
      {isOpen && (
        <button
          className="md:hidden p-2 text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 absolute top-4 right-4"
          onClick={closeMenu}
        >
          <span className="sr-only">Cerrar menú</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <nav
        className={`fixed md:relative top-0 left-0 w-64 bg-gray-800 h-screen text-white p-4 md:p-4 md:w-64 ${isOpen ? 'block' : 'hidden'} md:block`}
      >
        <ul>
          {menuItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link href={item.href} className="hover:text-gray-300" onClick={closeMenu}>
                {item.label}
              </Link>
            </li>
          ))}
          <li className='mb-2'>
            <Logout />
          </li>
        </ul>
      </nav>
    </div>
  );
}
