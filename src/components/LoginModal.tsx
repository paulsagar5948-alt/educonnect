import React, { useState } from 'react';
import { api, setToken } from '../services/api';
import { User, SystemStatus } from '../types';
import {
  Shield,
  GraduationCap,
  Users,
  LogIn,
  Lock,
  User as UserIcon,
  School,
  AlertCircle,
  Zap,
  ArrowRight,
  BookOpen,
  UserCheck,
  CheckCircle,
} from 'lucide-react';

interface LoginModalProps {
  systemStatus: SystemStatus | null;
  onLoginSuccess: (user: User) => void;
}

type PortalType = 'admin' | 'teacher' | 'student';

export const LoginModal: React.FC<LoginModalProps> = ({ systemStatus, onLoginSuccess }) => {
  const [activePortal, setActivePortal] = useState<PortalType>('admin');

  // Input states per portal
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('Admin@123');

  const [teacherUsername, setTeacherUsername] = useState('teacher');
  const [teacherPassword, setTeacherPassword] = useState('Teacher@123');

  const [studentUsername, setStudentUsername] = useState('student');
  const [studentPassword, setStudentPassword] = useState('Student@123');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1-Click Instant Direct Access (Zero OTP, zero typing)
  const handleInstantAccess = async (role: 'admin' | 'teacher' | 'student' | 'parent', username?: string) => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.instantLogin(role, username);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Direct access failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let u = '';
    let p = '';

    if (activePortal === 'admin') {
      u = adminUsername;
      p = adminPassword;
    } else if (activePortal === 'teacher') {
      u = teacherUsername;
      p = teacherPassword;
    } else {
      u = studentUsername;
      p = studentPassword;
    }

    if (!u.trim() || !p) {
      setError('Please provide your login credentials.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.login(u.trim(), p);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl mb-3">
          <School className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          EDUCONNECT
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-400">
          Smart Student Growth & Digital School Record Management System
        </p>
        <p className="text-[11px] font-mono text-slate-500 mt-0.5">
          {systemStatus?.schoolName || 'EduConnect Academy'} · Session: {systemStatus?.academicYear || '2026-2027'}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* 3 Dedicated Portal Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-800/90 rounded-2xl border border-slate-700/80 mb-5">
          <button
            onClick={() => {
              setActivePortal('admin');
              setError('');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePortal === 'admin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span className="truncate">1. Admin Portal</span>
          </button>

          <button
            onClick={() => {
              setActivePortal('teacher');
              setError('');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePortal === 'teacher'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="truncate">2. Teacher Portal</span>
          </button>

          <button
            onClick={() => {
              setActivePortal('student');
              setError('');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePortal === 'student'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">3. Student/Parent</span>
          </button>
        </div>

        {/* Portal Card */}
        <div className="bg-white py-7 px-6 shadow-2xl rounded-2xl sm:px-9 border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* PORTAL 1: SCHOOL ADMINISTRATION */}
          {/* ============================================================ */}
          {activePortal === 'admin' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>School Administration Portal</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Faculty management, class assignments & school records
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  Admin
                </span>
              </div>

              {/* 1-Click Direct Access */}
              <button
                type="button"
                onClick={() => handleInstantAccess('admin')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition font-semibold text-xs cursor-pointer disabled:opacity-60"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/80 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">1-Click Instant Login as Administrator</div>
                    <div className="text-[10px] text-blue-100 font-normal">Direct entry · Zero verification needed</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-200" />
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400 font-medium">or sign in with credentials</span>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admin Username</label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admin Password</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition cursor-pointer shadow-xs"
                >
                  {isLoading ? 'Entering Dashboard...' : 'Sign In as Admin'}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* PORTAL 2: TEACHER & FACULTY WORKSPACE */}
          {/* ============================================================ */}
          {activePortal === 'teacher' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span>Teacher & Faculty Workspace</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Daily attendance marking, examination marks & student feedback
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  Faculty
                </span>
              </div>

              {/* 1-Click Direct Access */}
              <button
                type="button"
                onClick={() => handleInstantAccess('teacher')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition font-semibold text-xs cursor-pointer disabled:opacity-60"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/80 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">1-Click Instant Login as Teacher</div>
                    <div className="text-[10px] text-indigo-100 font-normal">Prof. Sarah Jenkins (Class 5-A, 6-B)</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-200" />
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400 font-medium">or sign in with credentials</span>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teacher Username</label>
                  <input
                    type="text"
                    required
                    value={teacherUsername}
                    onChange={(e) => setTeacherUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teacher Password</label>
                  <input
                    type="password"
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition cursor-pointer shadow-xs"
                >
                  {isLoading ? 'Entering Workspace...' : 'Sign In as Teacher'}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* PORTAL 3: STUDENT & PARENT GROWTH PORTAL */}
          {/* ============================================================ */}
          {activePortal === 'student' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Student & Parent Portal</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    View report cards, attendance rates & teacher remarks
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  Growth
                </span>
              </div>

              {/* 2 Instant 1-Click Access Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleInstantAccess('student')}
                  disabled={isLoading}
                  className="flex items-center justify-between p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition text-left cursor-pointer disabled:opacity-60"
                >
                  <div>
                    <div className="text-xs font-bold">Student Access</div>
                    <div className="text-[10px] text-emerald-100">Alex Rivera (Class 5-A)</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-200 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleInstantAccess('parent')}
                  disabled={isLoading}
                  className="flex items-center justify-between p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition text-left cursor-pointer disabled:opacity-60"
                >
                  <div>
                    <div className="text-xs font-bold">Parent Access</div>
                    <div className="text-[10px] text-teal-100">Elena Rivera (Guardian)</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-teal-200 shrink-0" />
                </button>
              </div>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400 font-medium">or sign in with credentials</span>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student or Parent Username</label>
                  <input
                    type="text"
                    required
                    value={studentUsername}
                    onChange={(e) => setStudentUsername(e.target.value)}
                    placeholder="e.g. student or parent"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="e.g. Student@123 or Parent@123"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition cursor-pointer shadow-xs"
                >
                  {isLoading ? 'Entering Portal...' : 'Sign In to Portal'}
                </button>
              </form>
            </div>
          )}

          {/* Zero Verification Info Note */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Secure Access Active</span>
            </span>
            <span className="text-slate-400 font-mono">No OTP / Verification codes needed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
