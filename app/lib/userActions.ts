//   lib/actions.ts
"use server";
import { db } from "@vercel/postgres";
import { signIn, signOut } from "@/auth";


export async function doLogout() {
  await signOut({ redirectTo: "/auth/login" });
}

export async function getAdminByDni(dni: string) {
  try {
    const query = `
      SELECT * FROM administrators WHERE user_id = (SELECT user_id FROM usuarios WHERE dni = $1)
    `;
    const values = [dni];
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error: any) {
    throw new Error('Error getting admin: ' + error.message);
  }
}

export async function getUserByDni(dni: string) {
  try {
    const query = `
      SELECT * FROM usuarios WHERE dni = $1
    `;
    const values = [dni];
    const result = await db.query(query, values);
    return result.rows;
  }
  catch (error: any) {
    throw new Error('Error getting user: ' + error.message);
  }
}


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

export async function createUser(userData: { name: string, dni: string, password: string, user_type: string, permissions?: any }) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Inserción en la tabla users
    const query = `
      INSERT INTO usuarios (name, dni, password, user_type)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id
    `;
    const values = [
      userData.name,
      userData.dni,
      userData.password,
      userData.user_type,
    ];

    const result = await client.query(query, values);
    const userId = result.rows[0].user_id;

    // Inserción en la tabla administrators si el user_type es 'admin'
    if (userData.user_type === 'admin' && userData.permissions) {
      const adminQuery = `
        INSERT INTO administrators (user_id, can_create_teachers, can_delete_teachers, can_create_students, can_delete_students, can_create_careers, can_create_courses)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      const adminValues = [
        userId,
        userData.permissions.canCreateTeachers || false,
        userData.permissions.canDeleteTeachers || false,
        userData.permissions.canCreateStudents || false,
        userData.permissions.canDeleteStudents || false,
        userData.permissions.canCreateCareers || false,
        userData.permissions.canCreateCourses || false,
      ];

      await client.query(adminQuery, adminValues);
    }

    // Inserción en la tabla students si el user_type es 'student'
    if (userData.user_type === 'student') {
      const studentQuery = `
        INSERT INTO students (user_id)
        VALUES ($1)
      `;
      const studentValues = [userId];
      
      await client.query(studentQuery, studentValues);
    }

    // Inserción en la tabla teachers si el user_type es 'teacher'
    if (userData.user_type === 'teacher') {
      const teacherQuery = `
        INSERT INTO teachers (user_id)
        VALUES ($1)
      `;
      const teacherValues = [userId];
      
      await client.query(teacherQuery, teacherValues);
    }

    await client.query('COMMIT');
  } catch (error: any) {
    await client.query('ROLLBACK');
    throw new Error('Error inserting user: ' + error.message);
  } finally {
    client.release();
  }
}





export async function getUsersByRole(role: string) {
  try {
    const query = `
      SELECT u.*, 
        CASE 
          WHEN u.user_type = 'admin' THEN (
            SELECT json_build_object(
              'canCreateTeachers', a.can_create_teachers,
              'canDeleteTeachers', a.can_delete_teachers,
              'canCreateStudents', a.can_create_students,
              'canDeleteStudents', a.can_delete_students,
              'canCreateCareers', a.can_create_careers,
              'canCreateCourses', a.can_create_courses
            )
            FROM administrators a 
            WHERE a.user_id = u.user_id
          )
          ELSE NULL
        END as permissions
      FROM usuarios u
      WHERE u.user_type = $1
      ORDER BY u.user_id DESC
    `;
    const values = [role];
    const result = await db.query(query, values);
    return result.rows;
  } catch (error: any) {
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
      dni: formData.get("dni"),
      redirect: false,
    });

    if (response.error) {
      return { error: response.error };
    }

    const userArray = await getUserByDni(formData.get("dni"));
    const user = userArray[0]; 

   
    return { ...response, role: user.user_type, dni: user.dni };
  } catch (err) {
    throw err;
  }
}




export async function getAdminProps(dni:string) {
  try {
    const query = `
      SELECT can_create_teachers
             can_delete_teachers
             can_create_students
             can_delete_students
             can_create_careers
             can_create_courses FROM 
             administrators WHERE user_id = (SELECT 
             user_id FROM 
             usuarios WHERE 
             dni = $1)
    `;
    const values = [dni];
    const result = await db.query(query, values); 
    return result.rows[0];
  }
  catch (error: any) {
    throw new Error('Error getting admin: ' + error.message);
  }
}



export async function updateUser(userData: { 
  name?: string, 
  dni: string, 
  password?: string, 
  role?: string, 
  permissions?: {
      can_create_teachers?: boolean,
      can_delete_teachers?: boolean,
      can_create_students?: boolean,
      can_delete_students?: boolean,
      can_create_careers?: boolean,
      can_create_courses?: boolean
  }
}) {
  const { name, dni, password, role, permissions } = userData;

  // Construct the update query for the 'users' table
  let userUpdates: string[] = [];
  if (name) userUpdates.push(`name = '${name}'`);
  if (password) userUpdates.push(`password = '${password}'`);
  if (role) userUpdates.push(`user_type = '${role}'`);

  if (userUpdates.length === 0) {
      throw new Error('No fields to update');
  }

  let updateUserQuery = `
      UPDATE usuarios
      SET ${userUpdates.join(', ')}
      WHERE dni = '${dni}'
      RETURNING user_id;
  `;

  // Execute the query to update 'users'
  const result = await db.query(updateUserQuery);
  const userId = result.rows[0]?.user_id;

  // If the user is 'admin', update the 'administrators' table
  if (role === 'admin' && permissions && userId) {
      let adminUpdates: string[] = [];
      if (permissions.can_create_teachers !== undefined) adminUpdates.push(`can_create_teachers = ${permissions.can_create_teachers}`);
      if (permissions.can_delete_teachers !== undefined) adminUpdates.push(`can_delete_teachers = ${permissions.can_delete_teachers}`);
      if (permissions.can_create_students !== undefined) adminUpdates.push(`can_create_students = ${permissions.can_create_students}`);
      if (permissions.can_delete_students !== undefined) adminUpdates.push(`can_delete_students = ${permissions.can_delete_students}`);
      if (permissions.can_create_careers !== undefined) adminUpdates.push(`can_create_careers = ${permissions.can_create_careers}`);
      if (permissions.can_create_courses !== undefined) adminUpdates.push(`can_create_courses = ${permissions.can_create_courses}`);

      if (adminUpdates.length > 0) {
          let updateAdminQuery = `
              UPDATE administrators 
              SET ${adminUpdates.join(', ')}
              WHERE user_id = ${userId};
          `;

          // Execute the query to update 'administrators'
          await db.query(updateAdminQuery);
      }
  }

  return { success: true };
}




 

export async function deleteUser(dni: string) {
  try {
    // First, retrieve the user type and user_id
    const getUserQuery = `
      SELECT user_id, user_type FROM usuarios WHERE dni = $1
    `;
    const user = await db.query(getUserQuery, [dni]);

    if (user.rowCount === 0) {
      throw new Error('User not found');
    }

    const { user_id, user_type } = user.rows[0];

    // Delete the user from the corresponding type-specific table
    let deleteTypeQuery = '';

    switch (user_type) {
      case 'owner':
        deleteTypeQuery = 'DELETE FROM owners WHERE user_id = $1';
        break;
      case 'admin':
        deleteTypeQuery = 'DELETE FROM administrators WHERE user_id = $1';
        break;
      case 'teacher':
        deleteTypeQuery = 'DELETE FROM teachers WHERE user_id = $1';
        break;
      case 'student':
        deleteTypeQuery = 'DELETE FROM students WHERE user_id = $1';
        break;
    }

    if (deleteTypeQuery) {
      await db.query(deleteTypeQuery, [user_id]);
    }

    // Delete the user from the users table
    const deleteUserQuery = `
      DELETE FROM usuarios WHERE dni = $1
    `;
    await db.query(deleteUserQuery, [dni]);

  } catch (error: any) {
    throw new Error('Error deleting user: ' + error.message);
  }
}

