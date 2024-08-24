// /app/page.tsx
'use client'
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#e0e5ec] to-[#f7f9fc] text-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full">
        <h1 className="text-4xl font-bold text-[#333] mb-6">Bienvenido a Estudiantil App</h1>
        <p className="text-lg text-[#555] mb-8">La plataforma que te ayuda a gestionar tus estudios de manera eficiente.</p>

        <div className="space-y-4">
          <Link href="/auth/login" className="block bg-[#4a90e2] text-white py-3 rounded-lg font-semibold transition duration-300 ease-in-out hover:bg-[#357ABD] focus:outline-none focus:ring-2 focus:ring-[#357ABD]">
              Iniciar Sesión
          </Link>

          
        </div>

       
      
      </div>
    </div>
  );
}
