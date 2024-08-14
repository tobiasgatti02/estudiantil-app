//   lib/actions.ts
"use server";
import { db } from "@vercel/postgres";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { promise } from "zod";

export async function insertUser(userData: { name: string, email: string,dni:string, password: string, role: string}) {
  try {
    const query = `
      INSERT INTO usuarios (name, email,dni, password, role)
      VALUES ($1, $2, $3, $4,$5)
    `;
    const values = [
      userData.name,
      userData.email,
      userData.dni,
      userData.password,
      userData.role,
    ];
    await db.query(query, values);
  } catch (error: any) {
    throw new Error('Error inserting user: ' + error.message);
  }
}



export async function getUsersByRole(role: string) {
  try {
      const query = `
      SELECT id, name, email, role, created_at, updated_at
      FROM usuarios
      WHERE role = $1
      ORDER BY created_at DESC
      `;
      const values = [role];
      const result = await db.query(query, values);
      return result.rows;
  }
  catch (error: any) {
      throw new Error('Error getting users: ' + error.message);
  }
}


export async function getUserByName (name: string) {
    try {
        const query = `
        SELECT * FROM usuarios WHERE name = $1
        `;
        const values = [name];
        const result = await db.query(query, values);
        return result.rows[0];
    }
    catch (error: any) {
        throw new Error('Error getting user: ' + error.message);
    }
}


export async function doCredentialLogin(formData: FormData) {
  console.log("formData", formData);

  try {
    const response = await signIn("credentials", {
      name: formData.get("name"),
      password: formData.get("password"),
      redirect: false,
    });

    if (response.error) {
      return { error: response.error };
    }

    // Fetch the user data to get the role
    const user = await getUserByName(formData.get("name"));
    return { ...response, role: user.role };
  } catch (err) {
    throw err;
  }
}




 

