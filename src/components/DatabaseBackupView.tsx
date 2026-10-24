import React, { useState } from 'react';
import { Database, Download, ShieldCheck, Code, CheckCircle, FileText } from 'lucide-react';

export const DatabaseBackupView: React.FC = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadBackup = () => {
    setDownloading(true);
    window.location.href = '/api/admin/backup-sql';
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Database Architecture & SQL Backup
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Relational storage details, schema constraints, relationship diagram, and one-click SQL dump
          </p>
        </div>

        <button
          onClick={handleDownloadBackup}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Preparing Dump...' : 'Export SQL Backup'}</span>
        </button>
      </div>

      {/* Database Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase">Engine & Storage</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Persistent SQLite database (with WebAssembly engine). Saved synchronously to <code className="font-mono text-slate-800">data/educonnect.sqlite</code>.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase">Integrity Enforced</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Foreign keys enabled (<code className="font-mono">PRAGMA foreign_keys = ON</code>). Unique constraints on roll numbers and attendance dates prevent duplicate entries.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase">Scale & Performance</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Indexed fields: <code className="font-mono">roll_number</code>, <code className="font-mono">full_name</code>, <code className="font-mono">(class, div, year)</code>, <code className="font-mono">attendance_date</code>, and <code className="font-mono">student_id</code>. Supports 2,000+ students.
          </p>
        </div>
      </div>

      {/* Relational Schema Explanation */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Entity Relationships & Architecture</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Users &amp; Role Inheritance</h4>
            <p className="leading-relaxed text-slate-600">
              The <strong className="text-slate-800">Users</strong> table acts as the unified authentication and credential identity layer. Each <strong className="text-slate-800">Teacher</strong>, <strong className="text-slate-800">Student</strong>, and <strong className="text-slate-800">Parent</strong> row has a 1-to-1 foreign key to <code className="font-mono">Users(user_id)</code> with <code className="font-mono">ON DELETE CASCADE</code>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Students &amp; Uniqueness Constraints</h4>
            <p className="leading-relaxed text-slate-600">
              The <strong className="text-slate-800">Students</strong> table enforces <code className="font-mono">UNIQUE(class, division, academic_year, roll_number)</code>. A roll number cannot be duplicated within the same class division and academic cycle.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Parent-Student Many-to-Many Linking</h4>
            <p className="leading-relaxed text-slate-600">
              The <strong className="text-slate-800">ParentStudentLinks</strong> junction table connects parents to their children via composite primary key <code className="font-mono">(parent_id, student_id)</code>, allowing parents to have multiple children and children to have multiple guardians.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Attendance &amp; Marks Validation</h4>
            <p className="leading-relaxed text-slate-600">
              Attendance enforces <code className="font-mono">UNIQUE(student_id, attendance_date)</code> to block duplicate day records. Marks enforces <code className="font-mono">CHECK(marks_obtained &gt;= 0 AND marks_obtained &lt;= maximum_marks)</code>.
            </p>
          </div>
        </div>

        {/* SQL Schema Definition */}
        <div className="pt-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Complete DDL Schema (SQL)
          </h3>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed">
{`-- EduConnect Complete Production DDL Schema

CREATE TABLE Users (
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

CREATE TABLE Students (
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

CREATE TABLE Teachers (
  teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  assigned_classes TEXT NOT NULL,
  employment_status TEXT NOT NULL DEFAULT 'active' CHECK(employment_status IN ('active', 'inactive'))
);

CREATE TABLE Parents (
  parent_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  contact_number TEXT NOT NULL
);

CREATE TABLE ParentStudentLinks (
  parent_id INTEGER NOT NULL REFERENCES Parents(parent_id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES Students(student_id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  PRIMARY KEY (parent_id, student_id)
);

CREATE TABLE Attendance (
  attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES Students(student_id) ON DELETE CASCADE,
  attendance_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Leave')),
  recorded_by INTEGER NOT NULL REFERENCES Users(user_id),
  created_at TEXT NOT NULL,
  UNIQUE(student_id, attendance_date)
);

CREATE TABLE Marks (
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

CREATE TABLE TeacherRemarks (
  remark_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES Students(student_id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES Users(user_id),
  remarks TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE Notices (
  notice_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK(target_audience IN ('all', 'teachers', 'students', 'parents')),
  created_by INTEGER NOT NULL REFERENCES Users(user_id),
  created_at TEXT NOT NULL
);

CREATE TABLE AuditLog (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES Users(user_id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id INTEGER,
  old_value TEXT,
  new_value TEXT,
  created_at TEXT NOT NULL
);

-- Performance Indexes
CREATE INDEX idx_students_roll ON Students(roll_number);
CREATE INDEX idx_students_fullname ON Students(full_name);
CREATE INDEX idx_students_class_div_year ON Students(class, division, academic_year);
CREATE INDEX idx_attendance_date ON Attendance(attendance_date);
CREATE INDEX idx_attendance_student ON Attendance(student_id);
CREATE INDEX idx_marks_student ON Marks(student_id);
CREATE INDEX idx_users_email ON Users(email_or_username);`}
          </pre>
        </div>
      </div>
    </div>
  );
};
