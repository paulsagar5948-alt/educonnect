import React, { useState } from 'react';
import { api } from '../services/api';
import { UserRole } from '../types';
import { UserPlus, GraduationCap, CheckCircle2, AlertCircle, ArrowRight, Sparkles, ShieldX } from 'lucide-react';

interface DirectRegistrationViewProps {
  userRole?: UserRole;
  onSuccess?: () => void;
}

export const DirectRegistrationView: React.FC<DirectRegistrationViewProps> = ({ userRole = 'admin', onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

  // Student form state
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState<number>(5);
  const [studentDiv, setStudentDiv] = useState('A');
  const [studentRoll, setStudentRoll] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Teacher form state
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherClass, setTeacherClass] = useState<number>(5);
  const [teacherDiv, setTeacherDiv] = useState('A');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ message: string; username: string; password?: string } | null>(null);

  // Strictly block students and parents from registration
  if (userRole === 'student' || userRole === 'parent') {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldX className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600">
          Students and Parents do not possess administrative registration privileges.
        </p>
      </div>
    );
  }

  const isTeacher = userRole === 'teacher';

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessInfo(null);

    if (!studentName.trim()) {
      setError('Student full name is required.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.directRegisterStudent({
        fullName: studentName.trim(),
        class: studentClass,
        division: studentDiv,
        rollNumber: studentRoll ? Number(studentRoll) : undefined,
        parentOrGuardianName: parentName.trim() || 'Parent/Guardian',
        parentContact: parentPhone.trim() || '+1 555-0100',
      });

      setSuccessInfo({
        message: res.message,
        username: res.username,
        password: 'Student@123',
      });
      setStudentName('');
      setStudentRoll('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Direct student registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTeacher) {
      setError('Only School Administration can register faculty members.');
      return;
    }
    setError('');
    setSuccessInfo(null);

    if (!teacherName.trim()) {
      setError('Teacher full name is required.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.directRegisterTeacher({
        fullName: teacherName.trim(),
        email: teacherEmail.trim() || undefined,
        contactNumber: teacherPhone.trim() || undefined,
        assignedClass: teacherClass,
        assignedDivision: teacherDiv,
      });

      setSuccessInfo({
        message: res.message,
        username: res.username,
        password: 'Teacher@123',
      });
      setTeacherName('');
      setTeacherEmail('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Direct teacher registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <span>
            {isTeacher ? 'Direct Student Registration' : 'Direct Registration (Fast & Immediate)'}
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isTeacher
            ? 'Enroll students directly into classes with auto-generated roll numbers and immediate student portal access'
            : 'Register new students and faculty members directly into the database with zero transaction locks or verification hurdles'}
        </p>
      </div>

      {/* Selector Tabs - ONLY shown if Admin; Hidden for Teacher */}
      {!isTeacher && (
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl max-w-md">
          <button
            onClick={() => {
              setActiveTab('student');
              setError('');
              setSuccessInfo(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'student'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Direct Register Student</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('teacher');
              setError('');
              setSuccessInfo(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'teacher'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Direct Register Teacher</span>
          </button>
        </div>
      )}

      {/* Success Banner */}
      {successInfo && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successInfo.message}</span>
          </div>
          <div className="font-mono text-[11px] pt-1">
            Login Username: <strong className="text-emerald-900">{successInfo.username}</strong> · Default Password: <strong className="text-emerald-900">{successInfo.password}</strong>
          </div>
          <p className="text-[10px] text-emerald-700">Account is active and ready to log in immediately.</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM: REGISTER STUDENT DIRECTLY */}
      {activeTab === 'student' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Direct Student Enrollment</h2>
            <p className="text-xs text-slate-500">
              Immediate record insertion for Class 1 to Class 10
            </p>
          </div>

          <form onSubmit={handleRegisterStudent} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Student Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Lucas Bennett"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none bg-white font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Division</label>
                  <select
                    value={studentDiv}
                    onChange={(e) => setStudentDiv(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none bg-white font-semibold"
                  >
                    {['A', 'B', 'C', 'D'].map((d) => (
                      <option key={d} value={d}>
                        Div {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1" title="Leave empty for auto">
                    Roll # (Auto)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    placeholder="Auto"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. David Bennett"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Parent Phone Contact</label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+1 555-0144"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Adding Student...' : 'Register Student Directly'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* FORM: REGISTER TEACHER DIRECTLY */}
      {activeTab === 'teacher' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Direct Faculty Provisioning</h2>
            <p className="text-xs text-slate-500">
              Immediate teacher account creation with assigned classes
            </p>
          </div>

          <form onSubmit={handleRegisterTeacher} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Teacher Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="e.g. Dr. Robert Chen"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email / Username</label>
                <input
                  type="text"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="e.g. rchen@school.edu (or auto)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Class</label>
                <select
                  value={teacherClass}
                  onChange={(e) => setTeacherClass(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-semibold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Division</label>
                <select
                  value={teacherDiv}
                  onChange={(e) => setTeacherDiv(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-semibold"
                >
                  {['A', 'B', 'C', 'D'].map((d) => (
                    <option key={d} value={d}>
                      Division {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  placeholder="+1 555-0177"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Adding Teacher...' : 'Register Teacher Directly'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
