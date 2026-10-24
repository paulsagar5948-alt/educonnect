import React, { useState } from 'react';
import { api } from '../services/api';
import { User, Student } from '../types';
import { X, AlertCircle, Save, CheckCircle2 } from 'lucide-react';

interface StudentEditModalProps {
  user: User;
  student: Student;
  onClose: () => void;
  onSuccess: (updatedStudent?: any) => void;
}

export const StudentEditModal: React.FC<StudentEditModalProps> = ({
  user,
  student,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState(student.full_name || '');
  const [rollNumber, setRollNumber] = useState(String(student.roll_number || ''));
  const [studentClass, setStudentClass] = useState<number>(student.class || 5);
  const [division, setDivision] = useState<string>(student.division || 'A');
  const [academicYear, setAcademicYear] = useState(student.academic_year || '2026-2027');
  const [dateOfBirth, setDateOfBirth] = useState(student.date_of_birth || '');
  const [parentName, setParentName] = useState(student.parent_or_guardian_name || '');
  const [parentContact, setParentContact] = useState(student.parent_contact || '');
  const [address, setAddress] = useState(student.address || '');
  const [enrollmentDate, setEnrollmentDate] = useState(student.enrollment_date || '');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available classes for teachers (scoped) vs admin (unrestricted)
  const availableClasses =
    user.role === 'teacher' && user.assignedClasses && user.assignedClasses.length > 0
      ? user.assignedClasses
      : [
          { class: 1, division: 'A' },
          { class: 2, division: 'A' },
          { class: 3, division: 'A' },
          { class: 4, division: 'A' },
          { class: 5, division: 'A' },
          { class: 6, division: 'B' },
          { class: 7, division: 'A' },
          { class: 8, division: 'A' },
          { class: 9, division: 'A' },
          { class: 10, division: 'A' },
        ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Student full name is required.');
      return;
    }
    if (!rollNumber || isNaN(Number(rollNumber)) || Number(rollNumber) <= 0) {
      setError('Please provide a valid numeric roll number greater than 0.');
      return;
    }
    if (!dateOfBirth) {
      setError('Date of birth is required.');
      return;
    }
    if (!parentName.trim()) {
      setError('Parent / Guardian name is required.');
      return;
    }
    if (!parentContact.trim()) {
      setError('Parent contact phone number is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.updateStudent(student.student_id, {
        fullName: fullName.trim(),
        rollNumber: Number(rollNumber),
        class: Number(studentClass),
        division: division.trim().toUpperCase(),
        academicYear: academicYear.trim(),
        dateOfBirth,
        parentOrGuardianName: parentName.trim(),
        parentContact: parentContact.trim(),
        address: address.trim() || undefined,
        enrollmentDate: enrollmentDate || undefined,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update student records.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit Student Information</h2>
            <p className="text-[11px] text-slate-500">
              Update academic, demographic, and guardian information for Roll #{student.roll_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
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
          {/* Class & Roll Number */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-800 mb-2">Class, Division & Roll Assignment</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Class & Division *</label>
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
                        Class {ac.class}-{ac.division}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                        <option key={c} value={c}>
                          Class {c}
                        </option>
                      ))}
                    </select>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                    >
                      {['A', 'B', 'C', 'D'].map((d) => (
                        <option key={d} value={d}>
                          Div {d}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Roll Number *</label>
                <input
                  type="number"
                  min="1"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 1"
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Academic Year *</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2026-2027"
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Student Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Student's Legal Name"
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Date of Birth *</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>
          </div>

          {/* Guardian & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Parent / Guardian Name *</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Mother, Father, or Legal Guardian"
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Parent Contact Phone *</label>
              <input
                type="text"
                value={parentContact}
                onChange={(e) => setParentContact(e.target.value)}
                placeholder="+1 555-0100"
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>
          </div>

          {/* Address & Enrollment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Enrollment Date</label>
              <input
                type="date"
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Residential Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street Address, City"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Student Info'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
