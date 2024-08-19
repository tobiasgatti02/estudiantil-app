"use client";

import { doCredentialLogin } from "@/app/lib/userActions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Logout from "../logOut/page";
const LoginForm = () => {
    const router = useRouter();
    const [error, setError] = useState("");

    async function onSubmit(event: { preventDefault: () => void; currentTarget: HTMLFormElement | undefined; }) {
        event.preventDefault();
       
        try {
            const formData = new FormData(event.currentTarget);
            
            const response = await doCredentialLogin(formData);
            console.log("response",response.role);
            if (response.error) {
                console.error(response.error);
                setError(response.error);
            } else {
                console.log("response",response.role);
            }
        } catch (e) {
            console.error(e);
            setError("Check your Credentials");
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
                    <input className="border mx-2 border-gray-500 rounded" type="text" name="name" id="name" />
                </div>

                <div className="my-2">
                    <label htmlFor="password">Password</label>
                    <input className="border mx-2 border-gray-500 rounded" type="password" name="password" id="password" />
                </div>

                <div>
                <label htmlFor="dni">Dni</label>
                <input className="border mx-2 border-gray-500 rounded" type="text" name="dni" id="dni" />
                </div>

                <button type="submit" className="bg-orange-300 mt-4 rounded flex justify-center items-center w-36">
                    Credential Login
                </button>
            </form>
        </>
    );
};

export default LoginForm;