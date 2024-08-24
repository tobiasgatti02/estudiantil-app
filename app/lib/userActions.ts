//   lib/actions.ts
"use server";
import { db } from "@vercel/postgres";
import { signIn, signOut } from "@/auth";
import { permission } from "process";


export async function doLogout() {
  await signOut({ redirectTo: "/auth/login" });
}

export async function getUserByDNI(dni: string) {
  try {
    const query = `
      SELECT * FROM usuarios WHERE dni = $1
    `;
    const values = [dni];
    const result = await db.query(query, values);
    return result.rows;
  } catch (error: any) {
    throw new Error('Error getting user: ' + error.message);
  }
}

export async function getUserByDni(dni: string) {
  try {
    const query = `
      SELECT 
        u.*, 
        CASE
          WHEN u.user_type = 'admin' THEN
            (
              SELECT
                json_build_object(
                  'permissions', json_build_object(
                    'canCreateTeachers', a.can_create_teachers,
                    'canDeleteTeachers', a.can_delete_teachers,
                    'canCreateStudents', a.can_create_students,
                    'canDeleteStudents', a.can_delete_students,
                    'canCreateCareers', a.can_create_careers,
                    'canCreateCourses', a.can_create_courses
                  )
                )
              FROM administrators a
              WHERE a.user_id = u.user_id AND (
                a.can_create_teachers
                OR a.can_delete_teachers
                OR a.can_create_students
                OR a.can_delete_students
                OR a.can_create_careers
                OR a.can_create_courses
              )
            )
          ELSE
            NULL
        END AS admin_permissions
      FROM usuarios u
      WHERE u.dni = $1
    `;
    const values = [dni];
    const result = await db.query(query, values);
    return result.rows;
  } catch (error: any) {
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
export async function getUsers() {
  try {
    const query = `
      SELECT * FROM usuarios
    `;
    const result
      = await db.query(query);
    return result.rows;
  }
  catch (error: any) {
    throw new Error('Error getting users: ' + error.message);
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
                'permissions', json_build_object(
                    'canCreateTeachers', a.can_create_teachers,
                    'canDeleteTeachers', a.can_delete_teachers,
                    'canCreateStudents', a.can_create_students,
                    'canDeleteStudents', a.can_delete_students,
                    'canCreateCareers', a.can_create_careers,
                    'canCreateCourses', a.can_create_courses
                )
            )
            FROM administrators a 
            WHERE a.user_id = u.user_id
        )
        WHEN u.user_type = 'student' THEN (
            SELECT json_build_object('student_id', s.student_id)
            FROM students s
            WHERE s.user_id = u.user_id
        )
        WHEN u.user_type = 'teacher' THEN (
            SELECT json_build_object('teacher_id', t.teacher_id)
            FROM teachers t
            WHERE t.user_id = u.user_id
        )
        ELSE NULL
    END as additional_info
FROM usuarios u
WHERE u.user_type = $1
ORDER BY u.user_id DESC;
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

    const userArray = await getUserByDni(formData.get("dni")?.toString() ?? "");
    const user = userArray[0]; 

   
    return { ...response, role: user.user_type,user:user, dni: user.dni, permissions: user.admin_permissions?.permissions };
  } catch (err) {
    throw err;
  }
}




export async function getAdminByDni(dni: string) {
  try {
    const query = `
      SELECT * FROM administrators WHERE user_id = (SELECT user_id FROM usuarios WHERE dni = $1)
    `;
    const values = [dni];
    const result
      = await db.query(query, values);
    return result.rows[0];
  }
  catch (error: any) {
    throw new Error('Error getting admin: ' + error.message);
  }
}


export async function updateUser(userData: { dni: string, password: string, role: string, permissions: any }) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    // Update user information
    const updateUserQuery = `
      UPDATE usuarios
      SET password = $1
      WHERE dni = $2
    `;
    const updateUserValues = [userData.password, userData.dni];
    await client.query(updateUserQuery, updateUserValues);

    // Update admin permissions if the role is 'admin'
    if (userData.role === 'admin' && userData.permissions) {
      const updateAdminQuery = `
        UPDATE administrators
        SET can_create_teachers = $1,
            can_delete_teachers = $2,
            can_create_students = $3,
            can_delete_students = $4,
            can_create_careers = $5,
            can_create_courses = $6
        WHERE user_id = (SELECT user_id FROM usuarios WHERE dni = $7)
      `;
      const updateAdminValues = [
        userData.permissions.canCreateTeachers || false,
        userData.permissions.canDeleteTeachers || false,
        userData.permissions.canCreateStudents || false,
        userData.permissions.canDeleteStudents || false,
        userData.permissions.canCreateCareers || false,
        userData.permissions.canCreateCourses || false,
        userData.dni
      ];
      await client.query(updateAdminQuery, updateAdminValues);
    }

    await client.query('COMMIT');
  } catch (error: any) {
    await client.query('ROLLBACK');
    throw new Error('Error updating user: ' + error.message);
  } finally {
    client.release();
  }
}



 

export async function deleteUser(dni: string) {
  try {
    // Primero, recupera el user_id y el user_type
    const getUserQuery = `
      SELECT user_id, user_type FROM usuarios WHERE dni = $1
    `;
    const user = await db.query(getUserQuery, [dni]);

    if (user.rowCount === 0) {
      throw new Error('User not found');
    }

    const { user_id, user_type } = user.rows[0];

    // Elimina al usuario de la tabla correspondiente a su tipo
    let deleteTypeQuery = '';

    switch (user_type) {
      case 'owner':
        deleteTypeQuery = 'DELETE FROM owners WHERE user_id = $1';
        break;
      case 'admin':
        deleteTypeQuery = 'DELETE FROM administrators WHERE user_id = $1';
        break;
      case 'teacher':
        // Primero, obtén el teacher_id
        const getTeacherIdQuery = 'SELECT teacher_id FROM teachers WHERE user_id = $1';
        const teacherResult = await db.query(getTeacherIdQuery, [user_id]);
        if (teacherResult.rowCount === 0) {
          throw new Error('Teacher not found');
        }
        const teacherId = teacherResult.rows[0].teacher_id;

        // Elimina los archivos asociados a las publicaciones del profesor
        const deleteFilesQuery = `
          DELETE FROM files
          WHERE publication_id IN (
            SELECT publication_id
            FROM publications
            WHERE teacher_id = $1
          )
        `;
        await db.query(deleteFilesQuery, [teacherId]);

        // Elimina las publicaciones del profesor
        const deletePublicationsQuery = 'DELETE FROM publications WHERE teacher_id = $1';
        await db.query(deletePublicationsQuery, [teacherId]);

        // Elimina las asociaciones con materias
        const deleteTeacherSubjectsQuery = 'DELETE FROM teacher_subjects WHERE teacher_id = $1';
        await db.query(deleteTeacherSubjectsQuery, [teacherId]);

        // Luego, elimina al profesor
        deleteTypeQuery = 'DELETE FROM teachers WHERE user_id = $1';
        break;
      case 'student':
        // Primero, elimina las asociaciones con cursos
        const deleteStudentCoursesQuery = `
          DELETE FROM student_courses WHERE student_id = (SELECT student_id FROM students WHERE user_id = $1)
        `;
        await db.query(deleteStudentCoursesQuery, [user_id]);

        // Luego, elimina al estudiante
        deleteTypeQuery = 'DELETE FROM students WHERE user_id = $1';
        break;
    }

    if (deleteTypeQuery) {
      await db.query(deleteTypeQuery, [user_id]);
    }

    // Finalmente, elimina al usuario de la tabla usuarios
    const deleteUserQuery = `
      DELETE FROM usuarios WHERE dni = $1
    `;
    await db.query(deleteUserQuery, [dni]);

  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new Error('Error deleting user: ' + error.message);
  }
}

