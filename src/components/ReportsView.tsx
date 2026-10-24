import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import {
  FileText,
  AlertTriangle,
  Download,
  Printer,
  ChevronRight,
  TrendingDown,
  CalendarCheck,
  Award,
} from 'lucide-react';

interface ReportsViewProps {
  user: User;
  onOpenReportCard: (studentId: number) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ user, onOpenReportCard }) => {
  const [supportStudents, setSupportStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // CSV export parameters
  const [exportType, setExportType] = useState<'students' | 'attendance' | 'marks'>('students');
  const [exportClass, setExportClass] = useState<string>('');
  const [exportDiv, setExportDiv] = useState<string>('');

  useEffect(() => {
    const fetchSupportList = async () => {
      try {
        setLoading(true);
        const res = await api.getSupportNeeded();
        setSupportStudents(res.students || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load support list.');
      } finally {
        setLoading(false);
      }
    };
    fetchSupportList();
  }, []);

  const handleDownloadCsv = () => {
    const q = new URLSearchParams({ type: exportType });
    if (exportClass) q.set('class', exportClass);
    if (exportDiv) q.set('division', exportDiv);
    window.location.href = `/api/reports/export-csv?${q.toString()}`;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Academic Analytics & Diagnostic Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify at-risk learners, monitor class-wise metrics, and export official CSV records
          </p>
        </div>
      </div>

      {/* CSV Export Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
          <Download className="w-4 h-4 text-blue-600" />
          <span>Export Institutional Database Records (CSV)</span>
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Authorized data access for auditing, administrative reviews, and offline reporting
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Data Category
            </label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white font-medium"
            >
              <option value="students">Student Enrollment Roster</option>
              <option value="attendance">Daily Attendance Logs</option>
              <option value="marks">Examination Score Ledger</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Class (Optional)
            </label>
            <select
              value={exportClass}
              onChange={(e) => setExportClass(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
            >
              <option value="">All Classes</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Division (Optional)
            </label>
            <select
              value={exportDiv}
              onChange={(e) => setExportDiv(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
            >
              <option value="">All Divisions</option>
              {['A', 'B', 'C', 'D'].map((d) => (
                <option key={d} value={d}>
                  Division {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={handleDownloadCsv}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Students Who May Need Academic Support Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Learners Needing Academic Support & Intervention</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered in real-time: Students with marks &lt; 50% OR attendance rate &lt; 75%
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
            {supportStudents.length} Students Flagged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold">Class & Div</th>
                <th className="px-4 py-3 font-semibold">Guardian Contact</th>
                <th className="px-4 py-3 font-semibold text-center">Attendance %</th>
                <th className="px-4 py-3 font-semibold text-center">Marks Average %</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center font-sans text-slate-400">
                    Evaluating diagnostic indicators across records...
                  </td>
                </tr>
              ) : supportStudents.length > 0 ? (
                supportStudents.map((st) => {
                  const attRate =
                    st.total_attendance > 0
                      ? ((st.present_days / st.total_attendance) * 100).toFixed(1)
                      : '0';

                  const isLowAtt = Number(attRate) < 75 && st.total_attendance > 0;
                  const isLowMarks = st.avg_marks_pct !== null && st.avg_marks_pct < 50;

                  return (
                    <tr key={st.student_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                        <div>{st.full_name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Roll #{st.roll_number}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Class {st.class}-{st.division}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <div className="text-slate-800">{st.parent_or_guardian_name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{st.parent_contact}</div>
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">
                        <span
                          className={`font-bold ${
                            isLowAtt ? 'text-red-700' : 'text-slate-700'
                          }`}
                        >
                          {attRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">
                        {st.avg_marks_pct !== null ? (
                          <span
                            className={`font-bold ${
                              isLowMarks ? 'text-red-700' : 'text-slate-700'
                            }`}
                          >
                            {st.avg_marks_pct}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-sans italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-sans">
                        <button
                          onClick={() => onOpenReportCard(st.student_id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <span>Generate Report</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center font-sans text-slate-400">
                    <p className="font-semibold text-emerald-700">All registered students are currently meeting target thresholds</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No learners currently record marks &lt; 50% or attendance &lt; 75%.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
