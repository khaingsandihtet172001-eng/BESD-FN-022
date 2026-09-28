import mysql from 'mysql2/promise';

const database = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'se_course_user',
  password: process.env.DB_PASSWORD ?? 'local-course-password',
  database: process.env.DB_NAME ?? 'se_course_db',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: ['DATE'],
});

export default database;
