"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { getUsersByRole } from '@/app/lib/userActions';
import AdminManagement from '@/app/components/ownerManagement/usuariosAdmin/adminManagement';
import TeacherManagement from '@/app/components/ownerManagement/usuariosProfesores/teacherManagement';
import StudentManagement from '@/app/components/ownerManagement/usuariosEstudiantes/studentManagement';

const OwnerHomePage = () => {

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gestionar usuarios</h1>
           
        </div>
    );
};

export default OwnerHomePage;