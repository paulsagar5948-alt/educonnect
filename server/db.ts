import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';

let dbInstance: SqlJsDatabase | null = null;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'educonnect.sqlite');

export async function initDatabase(): Promise<SqlJsDatabase> {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.error('[DB] Failed to load existing database file, initializing fresh:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Enforce foreign key constraints
  dbInstance.run('PRAGMA foreign_keys = ON;');

  // Create tables according to strict schema specifications
  createSchema(dbInstance);
  persistDatabase();

  return dbInstance;
}

export function persistDatabase(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('[DB] Failed to persist database to disk:', err);
  }
}

export function getDb(): SqlJsDatabase {
  if (!dbInstance) {
    throw new Error('Database has not been initialized. Call initDatabase() first.');
  }
  return dbInstance;
}

function createSchema(db: SqlJsDatabase) {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email_or_username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student', 'parent')),
      account_status TEXT NOT NULL DEFAULT 'active' CHECK(account_status IN ('active', 'inactive', 'pending')),
      created_by INTEGER REFERENCES Users(user_id),
      created_at TEXT NOT NULL,
      last_login TEXT
    );
  `);

  // Students table
  db.run(`
    CREATE TABLE IF NOT EXISTS Students (
      student_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
      roll_number INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      class INTEGER NOT NULL CHECK(class BETWEEN 1 AND 10),
      division TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      parent_or_guardian_name TEXT NOT NULL,
      parent_contact TEXT NOT NULL,
      enrollment_date TEXT NOT NULL,
      address TEXT,
      profile_photo TEXT,
      UNIQUE(class, division, academic_year, roll_number)
    );
  `);

  // Teachers table
  db.run(`
    CREATE TABLE IF NOT EXISTS Teachers (
      teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      assigned_classes TEXT NOT NULL, -- JSON array string, e.g. [{"class": 5, "division": "A"}]
      employment_status TEXT NOT NULL DEFAULT 'active' CHECK(employment_status IN ('active', 'inactive'))
    );
  `);

  // Parents table
  db.run(`
    CREATE TABLE IF NOT EXISTS Parents (
      parent_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      contact_number TEXT NOT NULL
    );
  `);

  // ParentStudentLinks table
  db.run(`
    CREATE TABLE IF NOT EXISTS ParentStudentLinks (
      parent_id INTEGER NOT NULL REFERENCES Parents(parent_id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES Students(student_id) ON DELETE CASCADE,
      relationship TEXT NOT NULL,
      PRIMARY KEY (parent_id, student_id)
    );
  `);

  // Attendance table
  db.run(`
    CREATE TABLE IF NOT EXISTS Attendance (
      attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES Students(student_id) ON DELETE CASCADE,
      attendance_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Leave')),
      recorded_by INTEGER NOT NULL REFERENCES Users(user_id),
      created_at TEXT NOT NULL,
      UNIQUE(student_id, attendance_date)
    );
  `);

  // Marks table
  db.run(`
    CREATE TABLE IF NOT EXISTS Marks (
      mark_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES Students(student_id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      exam_name TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      maximum_marks REAL NOT NULL CHECK(maximum_marks > 0),
      marks_obtained REAL NOT NULL,
      entered_by INTEGER NOT NULL REFERENCES Users(user_id),
      created_at TEXT NOT NULL,
      CHECK(marks_obtained >= 0 AND marks_obtained <= maximum_marks)
    );
  `);

  // TeacherRemarks table
  db.run(`
    CREATE TABLE IF NOT EXISTS TeacherRemarks (
      remark_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES Students(student_id) ON DELETE CASCADE,
      teacher_id INTEGER NOT NULL REFERENCES Users(user_id),
      remarks TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Notices table
  db.run(`
    CREATE TABLE IF NOT EXISTS Notices (
      notice_id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      target_audience TEXT NOT NULL CHECK(target_audience IN ('all', 'teachers', 'students', 'parents')),
      created_by INTEGER NOT NULL REFERENCES Users(user_id),
      created_at TEXT NOT NULL
    );
  `);

  // AuditLog table
  db.run(`
    CREATE TABLE IF NOT EXISTS AuditLog (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES Users(user_id),
      action TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id INTEGER,
      old_value TEXT,
      new_value TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // SchoolSettings table
  db.run(`
    CREATE TABLE IF NOT EXISTS SchoolSettings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL
    );
  `);

  // Performance Indexes as required by Section 3 & Section 12
  db.run(`CREATE INDEX IF NOT EXISTS idx_students_roll ON Students(roll_number);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_students_fullname ON Students(full_name);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_students_class_div_year ON Students(class, division, academic_year);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON Attendance(attendance_date);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_student ON Attendance(student_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_marks_student ON Marks(student_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email_or_username);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_audit_created ON AuditLog(created_at);`);
}

// Database helper functions for queries
export function query<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function run(sql: string, params: any[] = []): { lastInsertRowid: number; changes: number } {
  const db = getDb();
  db.run(sql, params);
  const rowidRes = query<{ id: number }>('SELECT last_insert_rowid() AS id;');
  const changesRes = query<{ count: number }>('SELECT changes() AS count;');
  const lastInsertRowid = rowidRes[0]?.id ?? 0;
  const changes = changesRes[0]?.count ?? 0;
  persistDatabase();
  return { lastInsertRowid, changes };
}

// Safe transaction runner
export function transaction<T>(callback: () => T): T {
  const db = getDb();
  db.run('BEGIN TRANSACTION;');
  try {
    const result = callback();
    db.run('COMMIT;');
    persistDatabase();
    return result;
  } catch (err) {
    db.run('ROLLBACK;');
    throw err;
  }
}

// Audit logger helper
export function logAudit(
  userId: number | null,
  action: string,
  tableName: string,
  recordId: number | null,
  oldValue: any = null,
  newValue: any = null
) {
  try {
    run(
      `INSERT INTO AuditLog (user_id, action, table_name, record_id, old_value, new_value, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        tableName,
        recordId,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        new Date().toISOString(),
      ]
    );
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err);
  }
}

// Export database as SQL statements for backup
export function exportToSql(): string {
  const db = getDb();
  let sqlDump = `-- ==================================================\n`;
  sqlDump += `-- EDUCONNECT RELATIONAL DATABASE BACKUP DUMP\n`;
  sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
  sqlDump += `-- Engine: SQLite (Persistent Relational Database)\n`;
  sqlDump += `-- ==================================================\n\n`;
  sqlDump += `PRAGMA foreign_keys = OFF;\n\n`;

  const tables = [
    'SchoolSettings',
    'Users',
    'Teachers',
    'Students',
    'Parents',
    'ParentStudentLinks',
    'Attendance',
    'Marks',
    'TeacherRemarks',
    'Notices',
    'AuditLog',
  ];

  for (const table of tables) {
    const rows = query(`SELECT * FROM ${table}`);
    sqlDump += `-- Table: ${table} (${rows.length} rows)\n`;
    for (const row of rows) {
      const keys = Object.keys(row);
      const cols = keys.join(', ');
      const vals = keys
        .map((k) => {
          const val = (row as any)[k];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          return `'${String(val).replace(/'/g, "''")}'`;
        })
        .join(', ');
      sqlDump += `INSERT INTO ${table} (${cols}) VALUES (${vals});\n`;
    }
    sqlDump += `\n`;
  }

  sqlDump += `PRAGMA foreign_keys = ON;\n`;
  return sqlDump;
}
