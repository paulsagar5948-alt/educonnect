import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { X, Printer, School, Award, Calendar, FileText, ArrowLeft } from 'lucide-react';

interface ReportCardModalProps {
  studentId: number;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({ studentId, onClose }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await api.getAcademicReport(studentId);
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to generate academic report.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [studentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-500 font-semibold animate-pulse">
          Generating official academic report...
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
          <p className="text-xs text-red-600 mb-3">{error || 'Report card not found.'}</p>
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold">
            Close
          </button>
        </div>
      </div>
    );
  }

  const { schoolName, student, marks, summary, remarks } = report;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 my-8">
        {/* Controls - Hidden during print */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Official Progress Report
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="border border-slate-300 p-8 rounded-xl bg-white text-slate-900">
          {/* School Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-2">
              <School className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase text-slate-900">
              {schoolName}
            </h1>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
              Annual Student Growth & Academic Evaluation Record
            </p>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Academic Session: {student.academic_year}
            </p>
          </div>

          {/* Student Bio Grid */}
          <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Student Name</span>
              <span className="font-bold text-slate-900 text-sm">{student.full_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Class & Division</span>
              <span className="font-bold text-slate-900 text-sm">Class {student.class}-{student.division}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Roll Number</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{student.roll_number}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Date of Birth</span>
              <span className="font-mono text-slate-900">{student.date_of_birth}</span>
            </div>
          </div>

          {/* Marks Breakdown Table */}
          <div className="my-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Subject Evaluation Scores
            </h2>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 uppercase font-mono tracking-wider border-b border-slate-300">
                <tr>
                  <th className="px-3 py-2 border-r border-slate-300">Subject</th>
                  <th className="px-3 py-2 border-r border-slate-300">Examination</th>
                  <th className="px-3 py-2 text-right border-r border-slate-300">Max Marks</th>
                  <th className="px-3 py-2 text-right border-r border-slate-300">Marks Obtained</th>
                  <th className="px-3 py-2 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {marks && marks.length > 0 ? (
                  marks.map((m: any, i: number) => {
                    const pct = ((m.marks_obtained / m.maximum_marks) * 100).toFixed(1);
                    return (
                      <tr key={i}>
                        <td className="px-3 py-2 font-sans font-semibold text-slate-900 border-r border-slate-200">
                          {m.subject}
                        </td>
                        <td className="px-3 py-2 font-sans text-slate-600 border-r border-slate-200">
                          {m.exam_name}
                        </td>
                        <td className="px-3 py-2 text-right border-r border-slate-200">
                          {m.maximum_marks}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900 border-r border-slate-200">
                          {m.marks_obtained}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-blue-700">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center font-sans text-slate-400 italic">
                      No examination marks recorded for this academic year.
                    </td>
                  </tr>
                )}
              </tbody>
              {marks && marks.length > 0 && (
                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-xs font-mono">
                  <tr>
                    <td colSpan={2} className="px-3 py-2 text-right uppercase font-sans border-r border-slate-300">
                      Total Aggregate:
                    </td>
                    <td className="px-3 py-2 text-right border-r border-slate-300">
                      {summary.totalMaximum}
                    </td>
                    <td className="px-3 py-2 text-right border-r border-slate-300">
                      {summary.totalObtained}
                    </td>
                    <td className="px-3 py-2 text-right text-blue-700">
                      {summary.percentage}%
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Performance Summary Banner */}
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="font-semibold text-slate-500 block mb-1">Attendance Record</span>
              <p className="text-base font-bold text-slate-900 font-mono">
                {summary.attendancePercentage}%{' '}
                <span className="text-xs font-normal text-slate-500 font-sans">
                  ({summary.presentDays} of {summary.attendanceDays} days present)
                </span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="font-semibold text-slate-500 block mb-1">Academic Grade & Standing</span>
              <p className="text-base font-bold text-slate-900">
                {summary.grade}
              </p>
            </div>
          </div>

          {/* Teacher Remarks */}
          <div className="my-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Faculty Observations & Remarks
            </h2>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
              {remarks && remarks.length > 0 ? (
                remarks.map((r: any, idx: number) => (
                  <div key={idx} className="border-b border-slate-200 last:border-b-0 pb-1.5 last:pb-0">
                    <p className="text-slate-800 italic">"{r.remarks}"</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      — {r.teacher_name} ({r.created_at.slice(0, 10)})
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">No teacher remarks recorded.</p>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2" />
              <span className="font-semibold text-slate-700">Class Teacher Signature</span>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2" />
              <span className="font-semibold text-slate-700">Parent / Guardian Signature</span>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2" />
              <span className="font-semibold text-slate-700">Principal / Head of School</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
