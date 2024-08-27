
"use server";
//teacherActions.ts
import { db, sql } from "@vercel/postgres";
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
const writeFile = promisify(fs.writeFile);
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


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




export async function getPublicacionByID(publicationId: number) {
  const query = `
    SELECT p.publication_id, p.title, p.content, p.created_at, 
           array_agg(json_build_object('file_id', f.file_id, 'file_name', f.file_name, 'file_path', f.file_path)) as files
    FROM publications p
    LEFT JOIN files f ON p.publication_id = f.publication_id
    WHERE p.publication_id = $1
    GROUP BY p.publication_id
  `;
  const values = [publicationId];

  try {
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error: any) {
    throw new Error('Error fetching publication: ' + error.message);
  }
}

export async function getTeachersAssociatedWithSubject(subjectId: number) {
  const query = `
    SELECT u.name, t.user_id, t.teacher_id
    FROM teachers t
    INNER JOIN usuarios u ON t.user_id = u.user_id
    INNER JOIN teacher_subjects ts ON t.teacher_id = ts.teacher_id
    WHERE ts.subject_id = $1
  `;
  const values = [subjectId];

  try {
    const result = await db.query(query, values);
    return result.rows;
  } catch (error: any) {
    throw new Error('Error fetching teachers associated with subject: ' + error.message);
  }
}


export async function getTeacherSubjectsDetails(dni: string) {
    const query = `
        SELECT 
            c.name AS career_name,
            cr.year AS course_year,
            cr.career_year,
            cr.division,
            s.name AS subject_name,
            s.subject_id,
            u.name AS teacher_name
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

export async function createPublication(subjectId: number, teacherId: number, title: string, content: string) {
    const query = `
      INSERT INTO publications (subject_id, teacher_id, title, content)
      VALUES ($1, $2, $3, $4)
      RETURNING publication_id
    `;
    const values = [subjectId, teacherId, title, content];
  
    try {
      const result = await db.query(query, values);
      return result.rows[0].publication_id;
    } catch (error: any) {
      throw new Error('Error creating publication: ' + error.message);
    }
  }
  
  export async function addFileToPublication(publicationId: number, fileName: string, filePath: string) {
    const query = `
      INSERT INTO files (publication_id, file_name, file_path)
      VALUES ($1, $2, $3)
    `;
    const values = [publicationId, fileName, filePath];
  
    try {
      await db.query(query, values);
    } catch (error: any) {
      throw new Error('Error adding file to publication: ' + error.message);
    }
  }
  
  export async function getPublicationsForSubject(subjectId: number) {
    const query = `
      SELECT p.publication_id, p.title, p.content, p.created_at, teacher_id,
             array_agg(json_build_object('file_id', f.file_id, 'file_name', f.file_name, 'file_path', f.file_path)) as files
      FROM publications p
      LEFT JOIN files f ON p.publication_id = f.publication_id
      WHERE p.subject_id = $1
      GROUP BY p.publication_id
      ORDER BY p.created_at DESC
    `;
    const values = [subjectId];
  
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error: any) {
      throw new Error('Error fetching publications: ' + error.message);
    }
  }
  
  export async function deletePublication(publicationId: number, teacherId: number) {
    const deleteFilesQuery = `
      DELETE FROM files
      WHERE publication_id = $1
    `;

    const values1 = [publicationId];

    try {
      await db.query(deleteFilesQuery, values1);
    } catch (error: any) {
      throw new Error('Error deleting publication files: ' + error.message);
    }

    
    const query = `
      DELETE FROM publications
      WHERE publication_id = $1 AND teacher_id = $2 AND created_at > NOW() - INTERVAL '1 week'
    `;
    const values = [publicationId, teacherId];
  
    try {
      const result = await db.query(query, values);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error: any) {
      throw new Error('Error deleting publication: ' + error.message);
    }
  }



  export async function getTeacherByDni(dni: string) {
    const query = `
      SELECT t.teacher_id,u.user_id, u.password
      FROM teachers t
      INNER JOIN usuarios u ON t.user_id = u.user_id
      WHERE u.dni = $1;
    `;
    const values = [dni];
  
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      throw new Error('Error fetching teacher by dni: ' + error.message);
    }
  }


  export async function uploadFile(file: File): Promise<{ fileName: string, fileUrl: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) reject(new Error('Error uploading file: ' + error.message));
          else resolve({ fileName: file.name, fileUrl: result?.secure_url || '' });
        }
      );
  
      file.arrayBuffer().then(buffer => {
        uploadStream.write(Buffer.from(buffer));
        uploadStream.end();
      });
    });
  }