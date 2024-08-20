"use client";

import { doCredentialLogin } from "@/app/lib/userActions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";

const LoginForm = () => {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { setUser } = useUser();


    async function onSubmit(event: { preventDefault: () => void; currentTarget: HTMLFormElement | undefined; }) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const formData = new FormData(event.currentTarget);
            const response = await doCredentialLogin(formData);

            if (response.error) {
                console.error(response.error);
                setError(response.error);
            } else {
                setUser({
                    name: response.user.name,
                    dni: response.user.dni,
                    role: response.role,
                              permissions: response.permissions,

                  });

                if (response.role === "admin") {
                    console.log(response.permissions);
                    router.push("/home/admin/cursos");
                } else if (response.role === "teacher") {
                    router.push("/teacher");
                } else if (response.role === "student") {
                    router.push("/student");
                } else if (response.role === "owner") {
                    router.push("/home/owner");
                }
            }
        } catch (e) {
            console.error(e);
            setError("Check your Credentials");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h2>
                {error && <div className="p-2 mb-4 text-white bg-red-500 rounded">{error}</div>}
                <form className="space-y-4" onSubmit={onSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Username</label>
                        <input className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" type="text" name="name" id="name" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" type="password" name="password" id="password" required />
                    </div>
                    <div>
                        <label htmlFor="dni" className="block text-sm font-medium text-gray-700">Dni</label>
                        <input className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" type="text" name="dni" id="dni" required />
                    </div>
                    <button type="submit" className="w-full py-2 mt-4 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500" disabled={loading}>
                        {loading ? 'Logging in...' : 'Credential Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;