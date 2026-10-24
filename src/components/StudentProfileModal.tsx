import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, Student } from '../types';
import {
  X,
  User as UserIcon,
  CalendarCheck,
  Award,
  BookOpen,
  MessageSquare,
  UserPlus,
  Printer,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Pencil,
  Trash2,
  Plus,
  Save,
  Check,
} from 'lucide-react';
import { StudentEditModal } from './StudentEditModal';

interface StudentProfileModalProps {
  studentId: number;
  currentUser: User;
  onClose: () => void;
  onOpenReportCard: (studentId: number) => void;
  onRefreshList?: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  studentId,
  currentUser,
  onClose,
  onOpenReportCard,
  onRefreshList,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Edit student modal
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);

  // Add remark state
  const [remarkText, setRemarkText] = useState('');
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);
  const [editingRemarkId, setEditingRemarkId] = useState<number | null>(null);
  const [editingRemarkText, setEditingRemarkText] = useState('');
  const [isUpdatingRemark, setIsUpdatingRemark] = useState(false);

  // Direct Marks Entry
  const [isAddMarkOpen, setIsAddMarkOpen] = useState(false);
  const [markSubject, setMarkSubject] = useState('Mathematics');
  const [markExam, setMarkExam] = useState('Mid-Term Examination');
  const [markMax, setMarkMax] = useState('100');
  const [markObtained, setMarkObtained] = useState('');
  const [markError, setMarkError] = useState('');
  const [isSavingMark, setIsSavingMark] = useState(false);

  // Inline editing for marks
  const [editingMarkId, setEditingMarkId] = useState<number | null>(null);
  const [editMarkObtained, setEditMarkObtained] = useState('');
  const [editMarkMax, setEditMarkMax] = useState('');
  const [isUpdatingMark, setIsUpdatingMark] = useState(false);

  // Direct Attendance Entry
  const [quickDate, setQuickDate] = useState(new Date().toISOString().slice(0, 10));
  const [quickStatus, setQuickStatus] = useState<'Present' | 'Absent' | 'Leave'>('Present');
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Link parent modal
  const [isLinkParentOpen, setIsLinkParentOpen] = useState(false);
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [parentUsername, setParentUsername] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [relationship, setRelationship] = useState('Mother');
  const [parentError, setParentError] = useState('');

  // AI suggestions trigger
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const subjectsList = [
    'Mathematics',
    'Science',
    'English Language',
    'Social Studies',
    'Computer Science',
    'Hindi',
    'Physical Education',
    'Environmental Studies',
  ];

  const examsList = [
    'Diagnostic Unit Test 1',
    'Mid-Term Examination',
    'Unit Test 2',
    'Final Annual Examination',
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentProfile(studentId);
      setData(res);
      setParentName(res.student?.parent_or_guardian_name || '');
      setParentContact(res.student?.parent_contact || '');
      setParentUsername(`parent_${res.student?.roll_number}`);
    } catch (err: any) {
      setError(err.message || 'Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  // Remark Handlers
  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkText.trim()) return;

    try {
      setIsSubmittingRemark(true);
      await api.addRemark(studentId, remarkText.trim());
      setRemarkText('');
      showSuccess('Teacher remark added successfully.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save remark.');
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  const handleUpdateRemark = async (remarkId: number) => {
    if (!editingRemarkText.trim()) return;
    try {
      setIsUpdatingRemark(true);
      await api.updateRemark(remarkId, editingRemarkText.trim());
      setEditingRemarkId(null);
      setEditingRemarkText('');
      showSuccess('Teacher remark updated successfully.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update remark.');
    } finally {
      setIsUpdatingRemark(false);
    }
  };

  const handleDeleteRemark = async (remarkId: number) => {
    if (!window.confirm('Are you sure you want to delete this remark?')) return;
    try {
      await api.deleteRemark(remarkId);
      showSuccess('Teacher remark deleted.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete remark.');
    }
  };

  // Direct Mark Handlers
  const handleAddMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMarkError('');

    const max = Number(markMax);
    const obt = Number(markObtained);

    if (isNaN(max) || max <= 0) {
      setMarkError('Maximum marks must be a positive number.');
      return;
    }
    if (isNaN(obt) || obt < 0 || obt > max) {
      setMarkError(`Marks obtained must be between 0 and maximum marks (${max}).`);
      return;
    }

    try {
      setIsSavingMark(true);
      await api.addStudentMark(studentId, {
        subject: markSubject,
        examName: markExam,
        academicYear: data?.student?.academic_year || '2026-2027',
        maximumMarks: max,
        marksObtained: obt,
      });

      setIsAddMarkOpen(false);
      setMarkObtained('');
      showSuccess(`Mark for ${markSubject} (${markExam}) recorded.`);
      loadData();
      onRefreshList?.();
    } catch (err: any) {
      setMarkError(err.message || 'Failed to record marks.');
    } finally {
      setIsSavingMark(false);
    }
  };

  const handleUpdateMarkSubmit = async (markId: number) => {
    const max = Number(editMarkMax);
    const obt = Number(editMarkObtained);

    if (isNaN(max) || max <= 0 || isNaN(obt) || obt < 0 || obt > max) {
      alert(`Invalid score. Marks obtained must be between 0 and ${max}.`);
      return;
    }

    try {
      setIsUpdatingMark(true);
      await api.updateMark(markId, {
        maximumMarks: max,
        marksObtained: obt,
      });
      setEditingMarkId(null);
      showSuccess('Mark updated successfully.');
      loadData();
      onRefreshList?.();
    } catch (err: any) {
      alert(err.message || 'Failed to update mark.');
    } finally {
      setIsUpdatingMark(false);
    }
  };

  const handleDeleteMark = async (markId: number) => {
    if (!window.confirm('Are you sure you want to delete this mark record?')) return;
    try {
      await api.deleteMark(markId);
      showSuccess('Mark record deleted.');
      loadData();
      onRefreshList?.();
    } catch (err: any) {
      alert(err.message || 'Failed to delete mark.');
    }
  };

  // Direct Attendance Handler
  const handleQuickAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingAttendance(true);
      await api.recordStudentAttendance(studentId, quickDate, quickStatus);
      showSuccess(`Attendance for ${quickDate} saved as "${quickStatus}".`);
      loadData();
      onRefreshList?.();
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance.');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleLinkParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentError('');

    if (!parentName.trim() || !parentUsername.trim()) {
      setParentError('Name and username are required.');
      return;
    }

    try {
      await api.createAndLinkParent({
        fullName: parentName.trim(),
        contactNumber: parentContact.trim(),
        emailOrUsername: parentUsername.trim(),
        password: parentPassword || undefined,
        studentId,
        relationship,
      });
      setIsLinkParentOpen(false);
      loadData();
      showSuccess('Parent linked successfully.');
    } catch (err: any) {
      setParentError(err.message || 'Failed to link parent.');
    }
  };

  const handleRequestAi = async () => {
    try {
      setLoadingAi(true);
      const res = await api.getAiSuggestions(studentId);
      setAiAnalysis(`${res.source}:\n\n${res.suggestion}`);
    } catch (err: any) {
      alert(err.message || 'Failed to run suggestion engine.');
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <p className="text-xs text-slate-500 font-semibold animate-pulse">
            Loading student academic profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error || 'Student not found.'}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 text-xs font-semibold rounded-lg text-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { student, marks, marksSummary, attendanceSummary, recentAttendance, remarks, parents, suggestions } = data;
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'teacher';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
              {student.roll_number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{student.full_name}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  Class {student.class}-{student.division}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Roll #{student.roll_number}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Login Username: <span className="font-mono text-slate-700">{student.email_or_username}</span> · Enrolled: {student.enrollment_date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => setIsEditStudentOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs cursor-pointer"
                title="Edit student full demographic & academic details"
              >
                <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                <span>Edit Info</span>
              </button>
            )}

            <button
              onClick={() => onOpenReportCard(student.student_id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Academic Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {successBanner && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Overall Attendance</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {attendanceSummary.percentage}%
              </span>
              <span className="text-xs text-slate-500">
                ({attendanceSummary.presentDays} / {attendanceSummary.totalDays} sessions)
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Marks Percentage</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {marksSummary.percentage}%
              </span>
              <span className="text-xs text-slate-500">
                ({marksSummary.totalObtained} / {marksSummary.totalMax})
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Academic Standing</span>
            <div className="mt-1">
              <span
                className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${
                  marksSummary.category === 'Excellent'
                    ? 'bg-emerald-100 text-emerald-800'
                    : marksSummary.category === 'Good'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {marksSummary.category}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Left Column: Personal Info & Attendance Log */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="font-bold text-slate-900">Personal & Family Details</h3>
                {canEdit && (
                  <button
                    onClick={() => setIsEditStudentOpen(true)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
              <dl className="grid grid-cols-2 gap-y-2 text-xs">
                <dt className="text-slate-500 font-medium">Date of Birth</dt>
                <dd className="text-slate-900 font-mono">{student.date_of_birth}</dd>

                <dt className="text-slate-500 font-medium">Academic Year</dt>
                <dd className="text-slate-900 font-mono">{student.academic_year}</dd>

                <dt className="text-slate-500 font-medium">Primary Guardian</dt>
                <dd className="text-slate-900 font-semibold">{student.parent_or_guardian_name}</dd>

                <dt className="text-slate-500 font-medium">Guardian Contact</dt>
                <dd className="text-slate-900 font-mono">{student.parent_contact}</dd>

                <dt className="text-slate-500 font-medium">Residential Address</dt>
                <dd className="text-slate-900">{student.address || 'Not specified'}</dd>
              </dl>
            </div>

            {/* Quick Attendance Entry for Teacher */}
            {canEdit && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <span>Log / Edit Attendance</span>
                </h3>
                <form onSubmit={handleQuickAttendanceSubmit} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Date</label>
                      <input
                        type="date"
                        value={quickDate}
                        onChange={(e) => setQuickDate(e.target.value)}
                        required
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Status</label>
                      <select
                        value={quickStatus}
                        onChange={(e) => setQuickStatus(e.target.value as any)}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white outline-none font-semibold"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Leave">Leave</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="submit"
                      disabled={isSavingAttendance}
                      className="px-3 py-1 bg-emerald-600 text-white font-semibold rounded-lg text-xs hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingAttendance ? 'Recording...' : 'Record Attendance'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Linked Parents */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900">Linked Parent Accounts</h3>
                {canEdit && (
                  <button
                    onClick={() => setIsLinkParentOpen(true)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Link Parent</span>
                  </button>
                )}
              </div>

              {parents && parents.length > 0 ? (
                <div className="space-y-2">
                  {parents.map((p: any) => (
                    <div key={p.parent_id} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{p.full_name} ({p.relationship})</p>
                        <p className="text-[11px] text-slate-500 font-mono">User: {p.email_or_username}</p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600">{p.contact_number}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No parent account linked yet.</p>
              )}
            </div>

            {/* Growth & Academic Recommendations */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Growth Suggestions</span>
                </h3>
                {canEdit && (
                  <button
                    onClick={handleRequestAi}
                    disabled={loadingAi}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer disabled:opacity-50"
                  >
                    {loadingAi ? 'Analyzing...' : 'Generate AI Study Plan'}
                  </button>
                )}
              </div>

              {aiAnalysis ? (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-slate-800 whitespace-pre-line text-xs font-sans">
                  {aiAnalysis}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {suggestions.map((s: any, idx: number) => (
                    <div key={idx} className="p-2 bg-blue-50/70 border border-blue-100 rounded-lg">
                      <span className="text-[10px] font-mono uppercase text-blue-700 font-bold tracking-wider block mb-0.5">
                        {s.type}
                      </span>
                      <p className="text-slate-700 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Marks & Teacher Remarks */}
          <div className="space-y-4">
            {/* Subject Marks Table with Add & Edit capability */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900">Evaluated Subject Marks</h3>
                {canEdit && (
                  <button
                    onClick={() => {
                      setIsAddMarkOpen(!isAddMarkOpen);
                      setMarkError('');
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddMarkOpen ? 'Cancel' : 'Add Mark'}</span>
                  </button>
                )}
              </div>

              {/* Add Mark Dropdown Form */}
              {isAddMarkOpen && (
                <form onSubmit={handleAddMarkSubmit} className="mb-3 p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                  <p className="font-semibold text-slate-900 text-xs">Enter New Subject Mark</p>
                  {markError && (
                    <p className="text-red-600 text-[11px] font-medium">{markError}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Subject</label>
                      <select
                        value={markSubject}
                        onChange={(e) => setMarkSubject(e.target.value)}
                        className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                      >
                        {subjectsList.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Exam Term</label>
                      <select
                        value={markExam}
                        onChange={(e) => setMarkExam(e.target.value)}
                        className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                      >
                        {examsList.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Maximum Marks</label>
                      <input
                        type="number"
                        min="1"
                        value={markMax}
                        onChange={(e) => setMarkMax(e.target.value)}
                        required
                        className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Marks Obtained</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={markObtained}
                        onChange={(e) => setMarkObtained(e.target.value)}
                        placeholder="e.g. 85"
                        required
                        className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none font-mono font-bold text-blue-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddMarkOpen(false)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded-lg text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingMark}
                      className="px-3 py-1 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingMark ? 'Saving...' : 'Save Mark'}
                    </button>
                  </div>
                </form>
              )}

              {marks && marks.length > 0 ? (
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-mono tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-2 py-1.5">Subject</th>
                        <th className="px-2 py-1.5">Exam</th>
                        <th className="px-2 py-1.5 text-right">Score</th>
                        <th className="px-2 py-1.5 text-right">%</th>
                        {canEdit && <th className="px-2 py-1.5 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {marks.map((m: any) => {
                        const pct = ((m.marks_obtained / m.maximum_marks) * 100).toFixed(1);
                        const isEditingThis = editingMarkId === m.mark_id;

                        return (
                          <tr key={m.mark_id} className="hover:bg-slate-50/60">
                            <td className="px-2 py-2 font-medium text-slate-900">{m.subject}</td>
                            <td className="px-2 py-2 text-slate-500">{m.exam_name}</td>
                            <td className="px-2 py-2 text-right font-mono font-semibold tabular-nums text-slate-800">
                              {isEditingThis ? (
                                <div className="inline-flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={editMarkObtained}
                                    onChange={(e) => setEditMarkObtained(e.target.value)}
                                    className="w-12 px-1 py-0.5 text-xs border border-blue-400 rounded outline-none font-mono"
                                  />
                                  <span>/</span>
                                  <input
                                    type="number"
                                    value={editMarkMax}
                                    onChange={(e) => setEditMarkMax(e.target.value)}
                                    className="w-12 px-1 py-0.5 text-xs border border-blue-400 rounded outline-none font-mono"
                                  />
                                </div>
                              ) : (
                                `${m.marks_obtained} / ${m.maximum_marks}`
                              )}
                            </td>
                            <td className="px-2 py-2 text-right font-mono tabular-nums">
                              <span
                                className={`font-semibold ${
                                  Number(pct) >= 75
                                    ? 'text-emerald-600'
                                    : Number(pct) >= 50
                                    ? 'text-blue-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {pct}%
                              </span>
                            </td>
                            {canEdit && (
                              <td className="px-2 py-2 text-right">
                                {isEditingThis ? (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      onClick={() => handleUpdateMarkSubmit(m.mark_id)}
                                      disabled={isUpdatingMark}
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                      title="Save mark"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditingMarkId(null)}
                                      className="p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setEditingMarkId(m.mark_id);
                                        setEditMarkObtained(String(m.marks_obtained));
                                        setEditMarkMax(String(m.maximum_marks));
                                      }}
                                      className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                      title="Edit mark"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMark(m.mark_id)}
                                      className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                      title="Delete mark"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 italic py-2">No marks entered for this student yet.</p>
              )}
            </div>

            {/* Teacher Remarks Feed, Add & Inline Edit */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Teacher Remarks & Feedback</h3>

              {canEdit && (
                <form onSubmit={handleAddRemark} className="mb-3 space-y-2">
                  <textarea
                    rows={2}
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    placeholder="Enter academic observation or feedback for this student..."
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="text-right">
                    <button
                      type="submit"
                      disabled={isSubmittingRemark || !remarkText.trim()}
                      className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingRemark ? 'Saving...' : 'Add Remark'}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {remarks && remarks.length > 0 ? (
                  remarks.map((r: any) => {
                    const isEditingThis = editingRemarkId === r.remark_id;

                    return (
                      <div key={r.remark_id} className="p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
                        {isEditingThis ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={editingRemarkText}
                              onChange={(e) => setEditingRemarkText(e.target.value)}
                              className="w-full p-2 border border-blue-400 rounded-lg text-xs bg-white outline-none"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setEditingRemarkId(null)}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded text-xs cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateRemark(r.remark_id)}
                                disabled={isUpdatingRemark || !editingRemarkText.trim()}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                              >
                                {isUpdatingRemark ? 'Saving...' : 'Update Remark'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-slate-800 leading-relaxed">{r.remarks}</p>
                            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                              <span className="font-medium text-slate-600">{r.teacher_name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{r.created_at.slice(0, 10)}</span>
                                {canEdit && (
                                  <div className="inline-flex items-center gap-1 ml-2">
                                    <button
                                      onClick={() => {
                                        setEditingRemarkId(r.remark_id);
                                        setEditingRemarkText(r.remarks);
                                      }}
                                      className="p-0.5 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                                      title="Edit remark"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRemark(r.remark_id)}
                                      className="p-0.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                      title="Delete remark"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 italic py-2">No remarks recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* STUDENT EDIT MODAL */}
        {isEditStudentOpen && student && (
          <StudentEditModal
            user={currentUser}
            student={student}
            onClose={() => setIsEditStudentOpen(false)}
            onSuccess={() => {
              setIsEditStudentOpen(false);
              showSuccess('Student profile details updated successfully.');
              loadData();
              onRefreshList?.();
            }}
          />
        )}

        {/* LINK PARENT MODAL */}
        {isLinkParentOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Link Parent to Student</h3>
              <p className="text-xs text-slate-500 mb-3">
                Create or link a parent account to <strong>{student.full_name}</strong>
              </p>

              {parentError && (
                <div className="p-2 mb-3 bg-red-50 text-red-700 text-xs rounded-lg">
                  {parentError}
                </div>
              )}

              <form onSubmit={handleLinkParentSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Parent Full Name</label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={parentContact}
                    onChange={(e) => setParentContact(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Legal Guardian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Username / Email for Login</label>
                  <input
                    type="text"
                    required
                    value={parentUsername}
                    onChange={(e) => setParentUsername(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Password (default: Parent@{student.student_id})</label>
                  <input
                    type="password"
                    value={parentPassword}
                    onChange={(e) => setParentPassword(e.target.value)}
                    placeholder="Leave empty for default"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsLinkParentOpen(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Link Parent
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
