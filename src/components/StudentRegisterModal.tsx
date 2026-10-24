import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { X, AlertCircle, CheckCircle2, UserCheck, Shield } from 'lucide-react';

interface StudentRegisterModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentRegisterModal: React.FC<StudentRegisterModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  // If teacher, default to their first assigned class
  const defaultClass =
    user.role === 'teacher' && user.assignedClasses && user.assignedClasses.length > 0
      ? user.assignedClasses[0].class
      : 5;
  const defaultDiv =
    user.role === 'teacher' && user.assignedClasses && user.assignedClasses.length > 0
      ? user.assignedClasses[0].division
      : 'A';

  const [rollNumber, setRollNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [studentClass, setStudentClass] = useState(defaultClass);
  const [division, setDivision] = useState(defaultDiv);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter allowed classes for teacher
  const availableClasses =
    user.role === 'teacher' && user.assignedClasses
      ? user.assignedClasses
      : [
          { class: 1, division: 'A' },
          { class: 2, division: 'A' },
          { class: 3, division: 'A' },
          { class: 4, division: 'A' },
          { class: 5, division: 'A' },
          { class: 6, division: 'A' },
          { class: 7, division: 'A' },
          { class: 8, division: 'A' },
          { class: 9, division: 'A' },
          { class: 10, division: 'A' },
        ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!rollNumber || isNaN(Number(rollNumber))) {
      setError('Please provide a valid numeric roll number.');
      return;
    }
    if (!fullName.trim()) {
      setError('Student full name is required.');
      return;
    }
    if (!dateOfBirth) {
      setError('Date of birth is required.');
      return;
    }
    if (!parentName.trim()) {
      setError('Parent or Guardian name is required.');
      return;
    }
    if (!parentContact.trim()) {
      setError('Parent contact phone number is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.registerStudent({
        rollNumber: Number(rollNumber),
        fullName: fullName.trim(),
        dateOfBirth,
        class: Number(studentClass),
        division: division.toUpperCase(),
        academicYear,
        parentOrGuardianName: parentName.trim(),
        parentContact: parentContact.trim(),
        enrollmentDate,
        address: address.trim() || undefined,
        username: username.trim() || undefined,
        password: password || undefined,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to register student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Register New Student</h2>
            <p className="text-[11px] text-slate-500">
              Only authorized teachers may register students for their assigned classes.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Class & Division Assignment */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-800 mb-2">Class Assignment & Academic Year</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Class *</label>
                {user.role === 'teacher' ? (
                  <select
                    value={`${studentClass}-${division}`}
                    onChange={(e) => {
                      const [c, d] = e.target.value.split('-');
                      setStudentClass(Number(c));
                      setDivision(d);
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                  >
                    {availableClasses.map((ac, i) => (
                      <option key={i} value={`${ac.class}-${ac.division}`}>
                        Class {ac.class}-{ac.division} (Assigned)
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {user.role !== 'teacher' && (
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Division *</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                  >
                    {['A', 'B', 'C', 'D'].map((d) => (
                      <option key={d} value={d}>
                        Division {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Roll Number *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Student Personal Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maya Sharma"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Parent/Guardian Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Parent Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={parentContact}
                onChange={(e) => setParentContact(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Enrollment Date & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Enrollment Date *</label>
              <input
                type="date"
                required
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Residential Address (Optional)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 14 Elm St, Springfield"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Optional Portal Login Customization */}
          <div className="pt-2 border-t border-slate-100">
            <p className="font-semibold text-slate-700 mb-1">Student Portal Login Credentials (Optional)</p>
            <p className="text-[11px] text-slate-400 mb-2">
              If left blank, EduConnect will automatically assign username <code className="font-mono">std_{studentClass}{division.toLowerCase()}_{rollNumber || 'X'}</code> and default password.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Custom username (optional)"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Custom password (optional)"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-60"
            >
              {isSubmitting ? 'Registering Student...' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
