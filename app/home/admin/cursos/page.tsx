"use client"
import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import CreateCourseForm from '@/app/components/adminManagement/formCurso/createCourseForm';
import ClientCourseList from '@/app/components/adminManagement/listaCurso/courseList';

export default function Page() {

 

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cursos</h1>
       <ClientCourseList />
      
    </div>
  );
}