"use client"
import CreateSubject from "@/app/components/materias/crearMateria";
import Link from "next/link";
import { useParams } from "next/navigation";
export default function crearMaterial() {
    const params = useParams();
    const courseId = Number(params.id);
  return (
    <div>
      <Link href={`/home/admin/cursos/curso/${courseId}`} className="text-blue-500 hover:underline mb-4 inline-block">
        ← Volver a la lista de cursos
      </Link>
      <CreateSubject onSubjectCreated={function (): void {
              throw new Error("Function not implemented.");
          } }/>
    </div>
  );
}