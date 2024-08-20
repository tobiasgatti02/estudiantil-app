"use client"
import CreateSubject from "@/app/components/materias/crearMateria";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CrearMateria() {
    const params = useParams();
    const courseId = Number(params.id);

    const handleSubjectCreated = () => {
        console.log('Subject created successfully');
    };

    return (
        <div>
            <Link href={`/home/admin/cursos/curso/${courseId}`} className="text-blue-500 hover:underline mb-4 inline-block">
                ← Volver a la lista de cursos
            </Link>
            <CreateSubject onSubjectCreated={handleSubjectCreated} />
        </div>
    );
}