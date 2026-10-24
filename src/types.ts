export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  userId: number;
  fullName: string;
  emailOrUsername: string;
  role: UserRole;
  accountStatus: 'active' | 'inactive' | 'pending';
  teacherId?: number;
  assignedClasses?: Array<{ class: number; division: string }>;
  studentId?: number;
  parentId?: number;
}

export interface Student {
  student_id: number;
  user_id: number;
  roll_number: number;
  full_name: string;
  date_of_birth: string;
  class: number;
  division: string;
  academic_year: string;
  parent_or_guardian_name: string;
  parent_contact: string;
  enrollment_date: string;
  address?: string;
  profile_photo?: string;
  email_or_username?: string;
  account_status?: string;
  present_days?: number;
  total_attendance_days?: number;
  avg_marks_pct?: number;
}

export interface Teacher {
  teacher_id: number;
  user_id: number;
  full_name: string;
  email: string;
  contact_number: string;
  assigned_classes: Array<{ class: number; division: string }>;
  employment_status: 'active' | 'inactive';
  email_or_username?: string;
  created_at?: string;
  last_login?: string;
}

export interface Parent {
  parent_id: number;
  user_id: number;
  full_name: string;
  contact_number: string;
  relationship?: string;
  email_or_username?: string;
}

export interface AttendanceRecord {
  attendance_id?: number;
  student_id: number;
  roll_number?: number;
  full_name?: string;
  attendance_date?: string;
  attendance_status?: 'Present' | 'Absent' | 'Leave' | null;
  status?: 'Present' | 'Absent' | 'Leave';
}

export interface MarkEntry {
  mark_id?: number;
  student_id: number;
  roll_number?: number;
  full_name?: string;
  subject: string;
  exam_name: string;
  academic_year: string;
  maximum_marks: number;
  marks_obtained: number;
}

export interface TeacherRemark {
  remark_id: number;
  student_id: number;
  remarks: string;
  created_at: string;
  teacher_name?: string;
}

export interface Notice {
  notice_id: number;
  title: string;
  message: string;
  target_audience: 'all' | 'teachers' | 'students' | 'parents';
  author_name: string;
  author_role: string;
  created_at: string;
}

export interface AuditLogItem {
  log_id: number;
  user_id: number;
  user_full_name?: string;
  user_role?: string;
  action: string;
  table_name: string;
  record_id?: number;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeTeachers: number;
  avgAttendanceRate: number;
  performanceSummary: {
    excellent: number;
    good: number;
    needsImprovement: number;
  };
  recentlyAdded: Student[];
  recentAttendanceDates: Array<{ attendance_date: string; total_marked: number }>;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export interface SystemStatus {
  initialized: boolean;
  adminExists: boolean;
  schoolName: string;
  academicYear: string;
}
