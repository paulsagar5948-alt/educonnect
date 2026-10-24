import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  Printer,
  Sparkles,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface StudentPortalViewProps {
  user: User;
  onOpenReportCard: (studentId: number) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({ user, onOpenReportCard }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSelf = async () => {
      try {
        setLoading(true);
        if (!user.studentId) {
          setError('Student profile record not found for this account.');
          return;
        }
        const data = await api.getStudentProfile(user.studentId);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load student profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchSelf();
  }, [user.studentId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 font-semibold animate-pulse">
        Loading your academic dashboard...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || 'Unable to load records.'}</span>
        </div>
      </div>
    );
  }

  const { student, marks, marksSummary, attendanceSummary, remarks, suggestions } = profile;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Student Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {student.roll_number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{student.full_name}</h1>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Class {student.class}-{student.division}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Roll #{student.roll_number} · Academic Year: {student.academic_year} · Enrolled: {student.enrollment_date}
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenReportCard(student.student_id)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>View Official Report Card</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase">Overall Attendance</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {attendanceSummary.percentage}%
            </span>
            <span className="text-xs text-slate-500">
              ({attendanceSummary.presentDays} of {attendanceSummary.totalDays} sessions)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {attendanceSummary.percentage >= 75
              ? 'Meets standard 75% attendance threshold'
              : 'Attendance is below 75% goal'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase">Overall Marks Average</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {marksSummary.percentage}%
            </span>
            <span className="text-xs text-slate-500">
              ({marksSummary.totalObtained} / {marksSummary.totalMax})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Category: <strong className="text-slate-700">{marksSummary.category}</strong>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase">Academic Standing</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span
              className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
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
          <p className="text-[11px] text-slate-400 mt-2">Evaluated on real exam records</p>
        </div>
      </div>

      {/* Marks Table & Teacher Remarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Marks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3">My Subject Results</h2>
          {marks && marks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 font-sans">Subject</th>
                    <th className="px-3 py-2 font-sans">Exam</th>
                    <th className="px-3 py-2 text-right">Score</th>
                    <th className="px-3 py-2 text-right">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marks.map((m: any) => {
                    const pct = ((m.marks_obtained / m.maximum_marks) * 100).toFixed(1);
                    return (
                      <tr key={m.mark_id}>
                        <td className="px-3 py-2.5 font-sans font-semibold text-slate-900">
                          {m.subject}
                        </td>
                        <td className="px-3 py-2.5 font-sans text-slate-500">{m.exam_name}</td>
                        <td className="px-3 py-2.5 text-right text-slate-800 font-bold tabular-nums">
                          {m.marks_obtained} / {m.maximum_marks}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold tabular-nums text-blue-700">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              No examination marks entered yet for this session.
            </div>
          )}
        </div>

        {/* Growth Recommendations & Teacher Remarks */}
        <div className="space-y-4">
          {/* Growth Suggestions */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Personalized Growth Advice</span>
            </h2>
            <div className="space-y-2">
              {suggestions && suggestions.length > 0 ? (
                suggestions.map((s: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs">
                    <span className="text-[10px] font-mono uppercase text-blue-700 font-bold tracking-wider block mb-0.5">
                      {s.type}
                    </span>
                    <p className="text-slate-700 leading-relaxed">{s.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No suggestions at this time.</p>
              )}
            </div>
          </div>

          {/* Teacher Remarks */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Teacher Feedback & Observations</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {remarks && remarks.length > 0 ? (
                remarks.map((r: any) => (
                  <div key={r.remark_id} className="p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
                    <p className="text-slate-800 leading-relaxed italic">"{r.remarks}"</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-600">{r.teacher_name}</span>
                      <span className="font-mono">{r.created_at.slice(0, 10)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-2">No remarks from teachers yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
