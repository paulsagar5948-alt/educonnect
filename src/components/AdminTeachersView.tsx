import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Teacher } from '../types';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Key,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Search,
} from 'lucide-react';

export const AdminTeachersView: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<'active' | 'inactive'>('active');
  const [newPassword, setNewPassword] = useState('');

  // Assigned classes state: array of { class: number, division: string }
  const [assignedClasses, setAssignedClasses] = useState<Array<{ class: number; division: string }>>([
    { class: 5, division: 'A' },
  ]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await api.getTeachers();
      setTeachers(data.teachers || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load teachers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleAddClassAssignment = () => {
    setAssignedClasses([...assignedClasses, { class: 1, division: 'A' }]);
  };

  const handleRemoveClassAssignment = (index: number) => {
    setAssignedClasses(assignedClasses.filter((_, i) => i !== index));
  };

  const handleClassChange = (index: number, classNum: number) => {
    const updated = [...assignedClasses];
    updated[index].class = classNum;
    setAssignedClasses(updated);
  };

  const handleDivisionChange = (index: number, div: string) => {
    const updated = [...assignedClasses];
    updated[index].division = div.toUpperCase();
    setAssignedClasses(updated);
  };

  const handleOpenCreate = () => {
    setFullName('');
    setEmail('');
    setContactNumber('');
    setPassword('');
    setAssignedClasses([{ class: 5, division: 'A' }]);
    setError('');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (assignedClasses.length === 0) {
      setError('Please assign at least one class and division.');
      return;
    }

    try {
      await api.createTeacher({
        fullName: fullName.trim(),
        email: email.trim(),
        contactNumber: contactNumber.trim(),
        assignedClasses,
        password,
      });
      setSuccessMsg(`Teacher ${fullName.trim()} registered successfully.`);
      setIsCreateOpen(false);
      loadTeachers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to register teacher.');
    }
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFullName(teacher.full_name);
    setEmail(teacher.email);
    setContactNumber(teacher.contact_number);
    setEmploymentStatus(teacher.employment_status);
    setAssignedClasses(
      Array.isArray(teacher.assigned_classes) && teacher.assigned_classes.length > 0
        ? teacher.assigned_classes
        : [{ class: 5, division: 'A' }]
    );
    setError('');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    try {
      await api.updateTeacher(selectedTeacher.teacher_id, {
        fullName: fullName.trim(),
        email: email.trim(),
        contactNumber: contactNumber.trim(),
        assignedClasses,
        employmentStatus,
      });
      setSuccessMsg(`Teacher updated successfully.`);
      setIsEditOpen(false);
      loadTeachers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update teacher.');
    }
  };

  const handleOpenReset = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setNewPassword('');
    setError('');
    setIsResetOpen(true);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      await api.resetTeacherPassword(selectedTeacher.teacher_id, newPassword);
      setSuccessMsg(`Password reset successfully for ${selectedTeacher.full_name}.`);
      setIsResetOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    }
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (!window.confirm(`Are you sure you want to delete teacher ${teacher.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteTeacher(teacher.teacher_id);
      setSuccessMsg(`Teacher deleted.`);
      loadTeachers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete teacher.');
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.full_name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Faculty & Teacher Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Only authorized school administration can create and assign teacher credentials
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Teacher</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teacher by name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Teacher Name</th>
                <th className="px-4 py-3 font-semibold">Institutional Email</th>
                <th className="px-4 py-3 font-semibold">Assigned Classes</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Loading faculty records...
                  </td>
                </tr>
              ) : filteredTeachers.length > 0 ? (
                filteredTeachers.map((t) => (
                  <tr key={t.teacher_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{t.full_name}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono">{t.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(t.assigned_classes) && t.assigned_classes.length > 0 ? (
                          t.assigned_classes.map((c, i) => (
                            <span
                              key={i}
                              className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                            >
                              Class {c.class}-{c.division}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">None assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {t.employment_status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          title="Edit Faculty Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenReset(t)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                          title="Reset Password"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(t)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Delete Faculty Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    No teacher accounts found. Use "Register New Teacher" to provision the first teacher.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TEACHER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Register New Teacher Account</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email (Institutional) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@school.edu"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+1 555-0192"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Temporary Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Teacher can update password after first login.
                </p>
              </div>

              {/* Assigned Classes */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Assigned Classes & Divisions <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddClassAssignment}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    + Add Another Class
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto p-1">
                  {assignedClasses.map((ac, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1">
                        <select
                          value={ac.class}
                          onChange={(e) => handleClassChange(idx, Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                            <option key={c} value={c}>
                              Class {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <select
                          value={ac.division}
                          onChange={(e) => handleDivisionChange(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                        >
                          {['A', 'B', 'C', 'D'].map((d) => (
                            <option key={d} value={d}>
                              Div {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      {assignedClasses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveClassAssignment(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Create Teacher Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEACHER MODAL */}
      {isEditOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Edit Teacher: {selectedTeacher.full_name}
              </h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employment Status
                  </label>
                  <select
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Assigned Classes */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Assigned Classes & Divisions
                  </label>
                  <button
                    type="button"
                    onClick={handleAddClassAssignment}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    + Add Another Class
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto p-1">
                  {assignedClasses.map((ac, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1">
                        <select
                          value={ac.class}
                          onChange={(e) => handleClassChange(idx, Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                            <option key={c} value={c}>
                              Class {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <select
                          value={ac.division}
                          onChange={(e) => handleDivisionChange(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                        >
                          {['A', 'B', 'C', 'D'].map((d) => (
                            <option key={d} value={d}>
                              Div {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      {assignedClasses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveClassAssignment(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">Reset Teacher Password</h2>
            <p className="text-xs text-slate-500 mb-4">
              Set new credentials for <strong>{selectedTeacher.full_name}</strong>
            </p>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (min. 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
