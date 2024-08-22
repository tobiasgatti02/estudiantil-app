
"use server";
//teacherActions.ts
import { db, sql } from "@vercel/postgres";


export async function getTeacherSubjectsDetails(dni: string) {
    const query = `
        SELECT 
            c.name AS career_name,
            cr.year AS course_year,
            cr.career_year,
            cr.division,
            s.name AS subject_name,
            s.subject_id
        FROM subjects s
        INNER JOIN courses cr ON s.course_id = cr.course_id
        INNER JOIN careers c ON cr.career_id = c.career_id
        INNER JOIN teacher_subjects ts ON s.subject_id = ts.subject_id
        INNER JOIN teachers t ON ts.teacher_id = t.teacher_id
        INNER JOIN usuarios u ON t.user_id = u.user_id
        WHERE u.dni = $1;
    `;
    const values = [dni];
    try {
        const result = await db.query(query, values);
        return result.rows;
    } catch (error: any) {
        throw new Error('Error fetching subjects details: ' + error.message);
    }
}

async function insertarPublicacion(subject_id: number, teacher_id: number, title: string, content: string) {
    const query = `
    INSERT INTO publications (subject_id, teacher_id, title, content, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *;
`;
    try {
        const result = await db.query(query);
        return result.rows[0];
    } catch (error: any) {
        throw new Error('Error inserting publication: ' + error.message);
    }
}