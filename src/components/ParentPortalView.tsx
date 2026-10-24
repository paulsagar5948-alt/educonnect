import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Student, User } from '../types';
import {
  UserCheck,
  CalendarCheck,
  Award,
  BookOpen,
  Printer,
  Sparkles,
  AlertCircle,
  Users,
} from 'lucide-react';

interface ParentPortalViewProps {
  user: User;
  onOpenReportCard: (studentId: number) => void;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({ user, onOpenReportCard }) => {
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [childProfile, setChildProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState('');

  const loadChildren = async () => {
    try {
      setLoading(true);
      const res = await api.getParentChildren();
      const list = res.children || [];
      setChildren(list);
      if (list.length > 0) {
        setSelectedChildId(list[0].student_id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load linked children.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;

    const fetchChild = async () => {
      try {
        setLoadingProfile(true);
        const data = await api.getStudentProfile(selectedChildId);
        setChildProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load child records.');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchChild();
  }, [selectedChildId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 font-semibold animate-pulse">
        Loading parent portal...
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <UserCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">No Children Linked Yet</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your parent account has been verified, but no student records are currently linked. Please contact your child's class teacher or school administration to link your student.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Child Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Parent & Guardian Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor academic progress, attendance history, and school notices for your linked children
          </p>
        </div>

        {/* Child Selector Tabs */}
        {children.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {children.map((ch) => (
              <button
                key={ch.student_id}
                onClick={() => setSelectedChildId(ch.student_id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  selectedChildId === ch.student_id
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ch.full_name} (Class {ch.class}-{ch.division})
              </button>
            ))}
          </div>
        )}
      </div>

      {childProfile && (
        <>
          {/* Child Overview Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {childProfile.student.roll_number}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{childProfile.student.full_name}</h2>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Class {childProfile.student.class}-{childProfile.student.division}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Roll #{childProfile.student.roll_number} · DOB: {childProfile.student.date_of_birth} · Academic Year: {childProfile.student.academic_year}
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenReportCard(childProfile.student.student_id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download Progress Report</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Attendance Rate
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {childProfile.attendanceSummary.percentage}%
                </span>
                <span className="text-xs text-slate-500">
                  ({childProfile.attendanceSummary.presentDays} of {childProfile.attendanceSummary.totalDays} days)
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Marks Average
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {childProfile.marksSummary.percentage}%
                </span>
                <span className="text-xs text-slate-500">
                  ({childProfile.marksSummary.totalObtained} / {childProfile.marksSummary.totalMax})
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Academic Standing
              </span>
              <div className="mt-2">
                <span
                  className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                    childProfile.marksSummary.category === 'Excellent'
                      ? 'bg-emerald-100 text-emerald-800'
                      : childProfile.marksSummary.category === 'Good'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {childProfile.marksSummary.category}
                </span>
              </div>
            </div>
          </div>

          {/* Marks and Teacher Remarks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Academic Exam Scores</h3>
              {childProfile.marks && childProfile.marks.length > 0 ? (
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
                      {childProfile.marks.map((m: any) => {
                        const pct = ((m.marks_obtained / m.maximum_marks) * 100).toFixed(1);
                        return (
                          <tr key={m.mark_id}>
                            <td className="px-3 py-2.5 font-sans font-semibold text-slate-900">
                              {m.subject}
                            </td>
                            <td className="px-3 py-2.5 font-sans text-slate-500">{m.exam_name}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-slate-800 tabular-nums">
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
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No examination marks recorded yet.
                </p>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Teacher Remarks</h3>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {childProfile.remarks && childProfile.remarks.length > 0 ? (
                  childProfile.remarks.map((r: any) => (
                    <div key={r.remark_id} className="p-3 bg-slate-50 rounded-lg text-xs border border-slate-100">
                      <p className="text-slate-800 italic">"{r.remarks}"</p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-600">{r.teacher_name}</span>
                        <span className="font-mono">{r.created_at.slice(0, 10)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No teacher observations recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
