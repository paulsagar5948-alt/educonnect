import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { queryOne, query } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'educonnect-secure-jwt-secret-key-2026';
const TOKEN_EXPIRY = '7d';

export interface UserPayload {
  userId: number;
  fullName: string;
  emailOrUsername: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  accountStatus: 'active' | 'inactive' | 'pending';
  teacherId?: number;
  assignedClasses?: Array<{ class: number; division: string }>;
  studentId?: number;
  parentId?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

// Authentication middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  let token: string | undefined;

  // Check Bearer Authorization Header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Fallback to cookie
  if (!token && req.cookies && req.cookies.edu_token) {
    token = req.cookies.edu_token;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
    return;
  }

  // Refresh user details from DB to ensure account is still active
  const user = queryOne<{
    user_id: number;
    full_name: string;
    email_or_username: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    account_status: 'active' | 'inactive' | 'pending';
  }>('SELECT user_id, full_name, email_or_username, role, account_status FROM Users WHERE user_id = ?', [payload.userId]);

  if (!user || user.account_status !== 'active') {
    res.status(403).json({ error: 'User account is inactive or has been deactivated.' });
    return;
  }

  req.user = {
    ...payload,
    fullName: user.full_name,
    role: user.role,
    accountStatus: user.account_status,
  };

  // If teacher, attach current assigned classes
  if (user.role === 'teacher') {
    const teacher = queryOne<{ teacher_id: number; assigned_classes: string }>(
      'SELECT teacher_id, assigned_classes FROM Teachers WHERE user_id = ?',
      [user.user_id]
    );
    if (teacher) {
      req.user.teacherId = teacher.teacher_id;
      try {
        req.user.assignedClasses = JSON.parse(teacher.assigned_classes || '[]');
      } catch {
        req.user.assignedClasses = [];
      }
    }
  }

  // If student, attach student_id
  if (user.role === 'student') {
    const student = queryOne<{ student_id: number; class: number; division: string }>(
      'SELECT student_id, class, division FROM Students WHERE user_id = ?',
      [user.user_id]
    );
    if (student) {
      req.user.studentId = student.student_id;
    }
  }

  // If parent, attach parent_id
  if (user.role === 'parent') {
    const parent = queryOne<{ parent_id: number }>(
      'SELECT parent_id FROM Parents WHERE user_id = ?',
      [user.user_id]
    );
    if (parent) {
      req.user.parentId = parent.parent_id;
    }
  }

  next();
}

// Authorization: Admin only
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden. Administrator authorization required.' });
    return;
  }
  next();
}

// Authorization: Teacher or Admin
export function requireTeacherOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'teacher')) {
    res.status(403).json({ error: 'Forbidden. Teacher or Administrator authorization required.' });
    return;
  }
  next();
}

// Helper: check if a teacher has access to a specific class and division
export function teacherHasClassAccess(user: UserPayload, classNum: number, division: string): boolean {
  if (user.role === 'admin') return true;
  if (user.role !== 'teacher') return false;
  if (!user.assignedClasses || user.assignedClasses.length === 0) return false;
  return user.assignedClasses.some(
    (c) => Number(c.class) === Number(classNum) && c.division.toUpperCase() === division.toUpperCase()
  );
}
