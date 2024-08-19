"use client";

import { doCredentialLogin } from "@/app/lib/userActions";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginForm = () => {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
                if (response.role === "admin") {
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
        <>
            <div className="text-xl text-red-500">{error}</div>
            <form 
                className="my-5 flex flex-col items-center border p-3 border-gray-200 rounded-md"
                onSubmit={onSubmit}>
                <div className="my-2">
                    <label htmlFor="name">Username</label>
                    <input className="border mx-2 border-gray-500 rounded" type="text" name="name" id="name" required />
                </div>

                <div className="my-2">
                    <label htmlFor="password">Password</label>
                    <input className="border mx-2 border-gray-500 rounded" type="password" name="password" id="password" required />
                </div>

                <div className="my-2">
                    <label htmlFor="dni">Dni</label>
                    <input className="border mx-2 border-gray-500 rounded" type="text" name="dni" id="dni" required />
                </div>

                <button type="submit" className="bg-orange-300 mt-4 rounded flex justify-center items-center w-36" disabled={loading}>
                    {loading ? 'Logging in...' : 'Credential Login'}
                </button>
            </form>
        </>
    );
};

export default LoginForm;
