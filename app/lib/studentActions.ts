"use server"
import {db} from '@vercel/postgres';


export async function updateUserPassword(user_id: number, password: string) {
  const query = `
    UPDATE usuarios
    SET password = $1
    WHERE user_id = $2
  `;
  const values = [password, user_id];

  try {
    await db.query(query, values);
  } catch (error: any) {
    throw new Error('Error updating user password: ' + error.message);
  }
}


export async function getStudentCourses(dni:number) {
    try {
      const query = `
        SELECT c.course_id, ca.name AS career_name, c.year, c.career_year, c.division
        FROM courses c
        LEFT JOIN careers ca ON c.career_id = ca.career_id
        WHERE c.course_id IN (SELECT course_id FROM student_courses WHERE student_id = (SELECT student_id FROM students WHERE user_id = (SELECT user_id FROM usuarios WHERE dni = $1)))
        ORDER BY ca.name, c.year, c.career_year, c.division
      `;
      const values = [dni];
      const result = await db.query(query, values);
      return result.rows;
    } catch (error: any) {
      throw new Error('Error fetching student courses: ' + error.message);
    }
  }


export async function getStudentByDni(dni:number) {
    try {
      const query = `
        SELECT s.student_id, u.user_id, u.dni,u.password
        FROM students s
        LEFT JOIN usuarios u ON s.user_id = u.user_id
        WHERE u.dni = $1
        `;
        const values = [dni];
        const result = await db.query(query, values);
        return result.rows[0];
    }
    catch (error: any) {
        throw new Error('Error fetching student by dni: ' + error.message);
    }
}