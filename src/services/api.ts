import {
  User,
  Student,
  Teacher,
  Notice,
  AuditLogItem,
  DashboardStats,
  SystemStatus,
} from '../types';

let authToken = localStorage.getItem('edu_auth_token') || '';

export function setToken(token: string) {
  authToken = token;
  if (token) {
    localStorage.setItem('edu_auth_token', token);
  } else {
    localStorage.removeItem('edu_auth_token');
  }
}

export function getToken(): string {
  return authToken || localStorage.getItem('edu_auth_token') || '';
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) errMsg = data.error;
    } catch {
      errMsg = await res.text();
    }
    throw new Error(errMsg);
  }

  // Check if response is JSON or blob
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res as any;
}

export const api = {
  // System
  getSystemStatus: () => request<SystemStatus>('/api/system/status'),
  setupAdmin: (data: {
    fullName: string;
    emailOrUsername: string;
    password: string;
    schoolName?: string;
    academicYear?: string;
  }) =>
    request<{ success: boolean; token: string; user: User }>('/api/auth/setup-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Auth
  login: (emailOrUsername: string, password: string) =>
    request<{ success: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    }),
  instantLogin: (role: 'admin' | 'teacher' | 'student' | 'parent', username?: string) =>
    request<{ success: boolean; token: string; user: User }>('/api/auth/instant-login', {
      method: 'POST',
      body: JSON.stringify({ role, username }),
    }),
  getCurrentUser: () =>
    request<{ success: boolean; user: User; details?: any }>('/api/auth/me'),
  logout: () =>
    request<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
    }),
  directRegisterStudent: (data: {
    fullName: string;
    class?: number;
    division?: string;
    rollNumber?: number;
    parentOrGuardianName?: string;
    parentContact?: string;
    dateOfBirth?: string;
    password?: string;
  }) =>
    request<{ success: boolean; message: string; studentId: number; username: string }>('/api/direct/register-student', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  directRegisterTeacher: (data: {
    fullName: string;
    email?: string;
    contactNumber?: string;
    assignedClass?: number;
    assignedDivision?: string;
    password?: string;
  }) =>
    request<{ success: boolean; message: string; teacherId: number; username: string }>('/api/direct/register-teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin: Teachers
  getTeachers: () =>
    request<{ teachers: Teacher[] }>('/api/admin/teachers'),
  createTeacher: (data: {
    fullName: string;
    email: string;
    contactNumber: string;
    assignedClasses: Array<{ class: number; division: string }>;
    password: string;
  }) =>
    request<{ success: boolean; teacherId: number }>('/api/admin/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTeacher: (
    teacherId: number,
    data: {
      fullName: string;
      email: string;
      contactNumber: string;
      assignedClasses: Array<{ class: number; division: string }>;
      employmentStatus: 'active' | 'inactive';
    }
  ) =>
    request<{ success: boolean }>('/api/admin/teachers/' + teacherId, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  resetTeacherPassword: (teacherId: number, newPassword: string) =>
    request<{ success: boolean }>('/api/admin/teachers/' + teacherId + '/reset-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),
  deleteTeacher: (teacherId: number) =>
    request<{ success: boolean }>('/api/admin/teachers/' + teacherId, {
      method: 'DELETE',
    }),

  // Students
  getStudents: (params: {
    class?: number | string;
    division?: string;
    academicYear?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const q = new URLSearchParams();
    if (params.class) q.set('class', String(params.class));
    if (params.division) q.set('division', params.division);
    if (params.academicYear) q.set('academicYear', params.academicYear);
    if (params.search) q.set('search', params.search);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.sortBy) q.set('sortBy', params.sortBy);
    if (params.order) q.set('order', params.order);
    return request<{
      students: Student[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/api/students?' + q.toString());
  },
  getStudentProfile: (studentId: number) =>
    request<any>('/api/students/' + studentId),
  registerStudent: (data: any) =>
    request<any>('/api/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStudent: (studentId: number, data: any) =>
    request<any>('/api/students/' + studentId, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteStudent: (studentId: number) =>
    request<any>('/api/students/' + studentId, {
      method: 'DELETE',
    }),

  // Attendance
  getAttendance: (cls: number, div: string, date: string) =>
    request<any>(`/api/attendance?class=${cls}&division=${div}&date=${date}`),
  saveAttendance: (cls: number, div: string, date: string, records: Array<{ studentId: number; status: string }>) =>
    request<any>('/api/attendance', {
      method: 'POST',
      body: JSON.stringify({ class: cls, division: div, date, records }),
    }),
  recordStudentAttendance: (studentId: number, date: string, status: 'Present' | 'Absent' | 'Leave') =>
    request<any>(`/api/students/${studentId}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ date, status }),
    }),

  // Marks
  getMarks: (cls: number, div: string, subject: string, examName: string) =>
    request<any>(`/api/marks?class=${cls}&division=${div}&subject=${encodeURIComponent(subject)}&examName=${encodeURIComponent(examName)}`),
  saveMarks: (data: {
    class: number;
    division: string;
    subject: string;
    examName: string;
    academicYear: string;
    maximumMarks: number;
    entries: Array<{ studentId: number; marksObtained: number | string }>;
  }) =>
    request<any>('/api/marks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addStudentMark: (studentId: number, data: {
    subject: string;
    examName: string;
    academicYear?: string;
    maximumMarks: number;
    marksObtained: number;
  }) =>
    request<any>(`/api/students/${studentId}/marks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMark: (markId: number, data: {
    subject?: string;
    examName?: string;
    academicYear?: string;
    maximumMarks?: number;
    marksObtained?: number;
  }) =>
    request<any>(`/api/marks/${markId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMark: (markId: number) =>
    request<any>(`/api/marks/${markId}`, {
      method: 'DELETE',
    }),

  // Remarks
  addRemark: (studentId: number, remarks: string) =>
    request<any>('/api/remarks', {
      method: 'POST',
      body: JSON.stringify({ studentId, remarks }),
    }),
  updateRemark: (remarkId: number, remarks: string) =>
    request<any>(`/api/remarks/${remarkId}`, {
      method: 'PUT',
      body: JSON.stringify({ remarks }),
    }),
  deleteRemark: (remarkId: number) =>
    request<any>(`/api/remarks/${remarkId}`, {
      method: 'DELETE',
    }),
  getAiSuggestions: (studentId: number) =>
    request<{ source: string; suggestion: string }>('/api/marks/ai-suggestion', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    }),

  // Parents
  createAndLinkParent: (data: {
    fullName: string;
    contactNumber: string;
    emailOrUsername: string;
    password?: string;
    studentId: number;
    relationship: string;
  }) =>
    request<any>('/api/parents/create-and-link', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getParentChildren: () =>
    request<{ children: Student[] }>('/api/parent/children'),

  // Notices
  getNotices: () =>
    request<{ notices: Notice[] }>('/api/notices'),
  createNotice: (data: { title: string; message: string; targetAudience: string }) =>
    request<any>('/api/notices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboardStats: () =>
    request<DashboardStats>('/api/dashboard/stats'),

  // Reports
  getAcademicReport: (studentId: number) =>
    request<any>('/api/reports/academic/' + studentId),
  getSupportNeeded: () =>
    request<{ students: any[] }>('/api/reports/support-needed'),

  // Admin Logs & Settings
  getAuditLogs: (page = 1, limit = 30, action = '') =>
    request<{ logs: AuditLogItem[]; total: number; page: number; totalPages: number }>(
      `/api/admin/audit-logs?page=${page}&limit=${limit}${action ? '&action=' + action : ''}`
    ),
  getSettings: () =>
    request<{ settings: Record<string, string> }>('/api/admin/settings'),
  updateSettings: (data: { schoolName?: string; academicYear?: string }) =>
    request<any>('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // System test runner (real execution)
  runSystemTests: () =>
    request<{ results: Array<{ testId: number; title: string; status: 'PASSED' | 'FAILED'; details: string }> }>('/api/system/run-tests'),
};
