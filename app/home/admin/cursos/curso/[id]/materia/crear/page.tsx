"use client"
import Logout from "@/app/auth/logOut/page";
import CreateSubject from "@/app/components/materias/crearMateria";
import { doLogout, getAdminByDni } from "@/app/lib/userActions";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CrearMateria() {
    const params = useParams();
    const courseId = Number(params.id);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        const checkUserExists = async () => {
            if (session?.user?.dni) {
                try {
                    const admin = await getAdminByDni(session.user.dni);
                    if (!admin) {
                        router.push('/auth/login');
                        doLogout();
                    }
                } catch (error) {
                    console.error('Error checking user existence:', error);
                }
            }
        };

        // Check immediately and then every 90 seconds
        checkUserExists();
        const intervalId = setInterval(checkUserExists, 90000);

        // Clear interval on component unmount
        return () => clearInterval(intervalId);
    }, [session]);
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