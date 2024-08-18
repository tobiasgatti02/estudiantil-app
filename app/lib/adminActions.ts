// lib/adminActions.ts
"use server";

import { db, sql } from "@vercel/postgres";

export async function getCarreras() {
  try {
    const query = 'SELECT name FROM careers';
    const result = await db.query(query);
    return result.rows;
  } catch (error: any) {
    throw new Error('Error fetching carreras: ' + error.message);
  }
}

export async function createCarrera(nombre: string) {
  try {
    const query = 'INSERT INTO careers (name) VALUES ($1) RETURNING name';
    const values = [nombre];
    const result = await db.query(query, values);
    return result.rows[0].name;
  } catch (error: any) {
    throw new Error('Error creating carrera: ' + error.message);
  }
}




export async function getCourses() {
  try {
    const query = `
      SELECT c.course_id, ca.name AS career_name, c.year, c.career_year, c.division
      FROM courses c
      JOIN careers ca ON c.career_id = ca.career_id
      ORDER BY ca.name, c.year, c.career_year, c.division
    `;
    const result = await db.query(query);
    return result.rows;
  } catch (error: any) {
    throw new Error('Error fetching courses: ' + error.message);
  }
}

export async function createCourse(careerName: string, year: number, careerYear: number, division: string) {
  try {
    const query = `
      INSERT INTO courses (career_id, year, career_year, division)
      VALUES (
        (SELECT career_id FROM careers WHERE name = $1),
        $2,
        $3,
        $4
      )
      RETURNING course_id
    `;
    const values = [careerName, year, careerYear, division];
    const result = await db.query(query, values);
    return result.rows[0].course_id;
  } catch (error: any) {
    throw new Error('Error creating course: ' + error.message);
  }
}

export async function getStudentsForCourse(courseId: number) {
  try {
    const query = `
      SELECT u.user_id, u.name, u.dni
      FROM usuarios u
      JOIN students s ON u.user_id = s.user_id
      JOIN student_courses sc ON s.student_id = sc.student_id
      WHERE sc.course_id = $1
      ORDER BY u.name
    `;
    const values = [courseId];
    const result = await db.query(query, values);
    return result.rows;
  } catch (error: any) {
    throw new Error('Error fetching students for course: ' + error.message);
  }
}
export async function getAllStudents() {
  try {
    const query = `
      SELECT u.user_id, u.name, u.dni
      FROM usuarios u
      JOIN students s ON u.user_id = s.user_id
      ORDER BY u.name
    `;
    const result = await db.query(query);
    return result.rows;
  } catch (error: any) {
    throw new Error('Error fetching students: ' + error.message);
  }
}


export async function addStudentToCourse(userId: number, courseId: number) {
  try {
    const query = `
      INSERT INTO student_courses (student_id, course_id)
      VALUES (
        (SELECT student_id FROM students WHERE user_id = $1),
        $2
      )
    `;
    const values = [userId, courseId];
    await db.query(query, values);
  } catch (error: any) {
    throw new Error('Error adding student to course: ' + error.message);
  }
}

export async function deleteSubjectAndTeacherFromSubject(subject_id: string) {
  try {
    await db.query('BEGIN');
    const deleteSubjectSchedulesQuery = `
      DELETE FROM subject_schedules WHERE subject_id = $1
    `;
    await db.query(deleteSubjectSchedulesQuery, [subject_id]);
    const deleteTeacherSubjectsQuery = `
      DELETE FROM teacher_subjects WHERE subject_id = $1
    `;
    await db.query(deleteTeacherSubjectsQuery, [subject_id]);

    const deleteSubjectQuery = `
      DELETE FROM subjects WHERE subject_id = $1
    `;
    await db.query(deleteSubjectQuery, [subject_id]);

    await db.query('COMMIT');
  } catch (error: any) {
    await db.query('ROLLBACK');
    throw new Error('Error deleting subject and its associations: ' + error.message);
  }
}


export async function removeStudentFromCourse(userId: number, courseId: number) {
  try {
    const query = `
      DELETE FROM student_courses
      WHERE student_id = (SELECT student_id FROM students WHERE user_id = $1)
      AND course_id = $2
    `;
    const values = [userId, courseId];
    await db.query(query, values);
  } catch (error: any) {
    throw new Error('Error removing student from course: ' + error.message);
  }
}

export async function getSubjectsForCourse(courseId: number) {
  try {
    const query = `
      SELECT subject_id, name
      FROM subjects
      WHERE course_id = $1
      ORDER BY name
    `;
    const values = [courseId];
    const result = await db.query(query, values);
    return result.rows;
  } catch (error: any) {
    throw new Error('Error fetching subjects for course: ' + error.message);
  }
}

export async function getSubjectDetails(subjectId: number) {
  const { rows } = await sql`
    SELECT * FROM subjects WHERE subject_id = ${subjectId}
  `;
  return rows[0];
}

export async function getSubjectName(courseId: number, subjectId: number) {
  try {
    const query = `
      SELECT name
      FROM subjects
      WHERE course_id = $1 AND subject_id = $2
      LIMIT 1
    `;
    const values = [courseId, subjectId];
    const result = await db.query(query, values);

    // Si se encuentra la materia, devolver el nombre
    if (result.rows.length > 0) {
      return result.rows[0].name;
    } else {
      throw new Error('Subject not found');
    }
  } catch (error: any) {
    throw new Error('Error fetching subject name: ' + error.message);
  }
}


export async function createSubject(courseId: number, name: string) {
  try {
    const query = `
      INSERT INTO subjects (course_id, name)
      VALUES ($1, $2)
      RETURNING subject_id
    `;
    const values = [courseId, name];
    const result = await db.query(query, values);
    if (result.rows.length > 0) {
      return result.rows[0].subject_id;
    } else {
      throw new Error('Subject ID not returned');
    }
  } catch (error: any) {
    throw new Error('Error creating subject: ' + error.message);
  }
}

export async function createSubjectSchedule(subjectId: number, scheduleData: any) {
  await sql`
    INSERT INTO subject_schedules (subject_id, day_of_month, start_time, end_time, location, classroom, month)
    VALUES (${subjectId}, ${scheduleData.day}, ${scheduleData.startTime}, ${scheduleData.endTime}, ${scheduleData.location}, ${scheduleData.classroom}, ${scheduleData.month})
  `;
}

export async function updateSubject (subjectId: number, name: string) {
  try {
    const query = 'UPDATE subjects SET name = $2 WHERE subject_id = $1';
    const values = [subjectId, name];
    await db.query(query, values);
  } catch (error: any) {
    throw new Error('Error updating subject: ' + error.message);
  }
}



export async function getTeachers () {
  try {
    const query = 'SELECT user_id, name, dni FROM usuarios WHERE user_id IN (SELECT user_id FROM teachers) ORDER BY name';
    const result = await db.query(query);
    return result.rows;
  } catch (error: any) {
    throw new Error('Error fetching teachers: ' + error.message);
  }
}


export async function getCourseByDetails(careerName: string, year: number, careerYear: number, division: string) {
  try {
    const query = `
      SELECT course_id
      FROM courses
      WHERE career_id = (SELECT career_id FROM careers WHERE name = $1)
      AND year = $2
      AND career_year = $3
      AND division = $4
      LIMIT 1
    `;
    const values = [careerName, year, careerYear, division];
    const result = await db.query(query, values);

    if (result.rows.length > 0) {
      return result.rows[0].course_id;
    } else {
      return 0;
    }
  } catch (error: any) {
    throw new Error('Error fetching course by details: ' + error.message);
  }
}


export async function updateTeacherForSubject(subjectId: number, teacherId: number) {
  try {
    const query = `
      UPDATE subjects
      SET teacher_id = $2
      WHERE subject_id = $1
    `;
    const values = [subjectId, teacherId];
    await db.query(query, values);
  } catch (error: any) {
    throw new Error('Error updating teacher for subject: ' + error.message);
  }
}

export async function getTeachersForSubject(subjectId: number) {
  try {
    const query = `
      SELECT u.user_id, u.name, u.dni, t.teacher_id
      FROM usuarios u
      JOIN teachers t ON u.user_id = t.user_id
      JOIN teacher_subjects ts ON t.teacher_id = ts.teacher_id
      WHERE ts.subject_id = $1
      ORDER BY u.name
    `;
    const values = [subjectId];
    const result = await db.query(query, values);
    return result.rows;
  } catch (error: any) {
    throw new Error('Error fetching teachers for subject: ' + error.message);
  }
}


export async function deleteTeacherFromSubject(subjectId: number, teacher_id:number){
  try {
    const query = `
      DELETE FROM teacher_subjects
      WHERE teacher_id = $2
      AND subject_id = $1
    `;
    const values = [subjectId, teacher_id];
    console.log(values);
    await db.query(query, values);
  } catch (error: any) {
    throw new Error('Error deleting teacher from subject: ' + error.message);
  }
}
  


export async function addTeacherToSubject(userId: number, subjectId: number) {
  try {
    const query = `
      INSERT INTO teacher_subjects (teacher_id, subject_id)
      VALUES (
        (SELECT teacher_id FROM teachers WHERE user_id = $1),
        $2
      )
    `;
    const values = [userId, subjectId];
    await db.query(query, values);
  } catch (error: any) {
    throw new Error('Error adding teacher to subject: ' + error.message);
  }
}

export async function removeTeacherFromSubject(userId: number, subjectId: number) {
  try {
    const query = `
      DELETE FROM teacher_subjects
      WHERE teacher_id = (SELECT teacher_id FROM teachers WHERE user_id = $1)
      AND subject_id = $2
    `;
    const values = [userId, subjectId];
    await db.query(query, values);
  } catch (error: any) {
    throw new Error('Error removing teacher from subject: ' + error.message);
  }
}

export async function removeSubjectSchedule(subjectId: number, scheduleId: number) {
  try {
    const query = 'DELETE FROM subject_schedules WHERE subject_id = $1 AND schedule_id = $2';
    const values = [subjectId, scheduleId];
    await db.query(query, values);
  } catch (error: any) {
    throw new Error('Error removing subject schedule: ' + error.message);
  }
}



export async function getSubjectSchedule(subjectId: number) {
  try {
    const query = `
      SELECT *
      FROM subject_schedules
      WHERE subject_id = $1
      ORDER BY month, day_of_month, start_time
    `;
    const values = [subjectId];
    const result = await db.query(query, values);
    return result.rows;
  } catch (error: any) {
    throw new Error('Error fetching subject schedule: ' + error.message);
  }
}

export async function addSubjectSchedule(
  subjectId: number,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  location: string,
  classroom: string,
  month: number
) {
  try {
    const query = `
      INSERT INTO subject_schedules (subject_id, day_of_month, start_time, end_time, location, classroom, month)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING schedule_id
    `;
    const values = [subjectId, dayOfWeek, startTime, endTime, location, classroom, month];
    const result = await db.query(query, values);
    return result.rows[0].schedule_id;
  } catch (error: any) {
    throw new Error('Error adding subject schedule: ' + error.message);
  }
}

export async function updateSubjectSchedule(
  scheduleId: number,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  location: string,
  classroom: string,
  month: number
) {
  try {
    const query = `
      UPDATE subject_schedules
      SET day_of_month = $2, start_time = $3, end_time = $4, location = $5, classroom = $6, month = $7
      WHERE schedule_id = $1
    `;
    const values = [scheduleId, dayOfWeek, startTime, endTime, location, classroom, month];
    await db.query(query, values);
  } catch (error: any) {
    throw new Error('Error updating subject schedule: ' + error.message);
  }
}

export async function deleteSubjectSchedule(scheduleId: number) {
  try {
    const query = 'DELETE FROM subject_schedules WHERE schedule_id = $1';
    const values = [scheduleId];
    await db.query(query, values);
  } catch (error: any) {
    throw new Error('Error deleting subject schedule: ' + error.message);
  }
}
