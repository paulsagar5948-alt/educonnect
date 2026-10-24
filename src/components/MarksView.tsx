import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import {
  FileSpreadsheet,
  Save,
  AlertCircle,
  CheckCircle2,
  Award,
  BookOpen,
} from 'lucide-react';

interface MarksViewProps {
  user: User;
}

export const MarksView: React.FC<MarksViewProps> = ({ user }) => {
  const defaultClass =
    user.role === 'teacher' && user.assignedClasses && user.assignedClasses.length > 0
      ? user.assignedClasses[0].class
      : 5;
  const defaultDiv =
    user.role === 'teacher' && user.assignedClasses && user.assignedClasses.length > 0
      ? user.assignedClasses[0].division
      : 'A';

  const [studentClass, setStudentClass] = useState<number>(defaultClass);
  const [division, setDivision] = useState<string>(defaultDiv);
  const [subject, setSubject] = useState<string>('Mathematics');
  const [examName, setExamName] = useState<string>('Mid-Term Examination');
  const [maximumMarks, setMaximumMarks] = useState<number>(100);
  const [academicYear, setAcademicYear] = useState<string>('2026-2027');

  const [students, setStudents] = useState<any[]>([]);
  const [marksEntries, setMarksEntries] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const loadMarks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getMarks(studentClass, division, subject, examName);
      setStudents(res.students || []);

      const entryMap: Record<number, string> = {};
      (res.students || []).forEach((st: any) => {
        if (st.marks_obtained !== null && st.marks_obtained !== undefined) {
          entryMap[st.student_id] = String(st.marks_obtained);
        }
        if (st.maximum_marks) {
          setMaximumMarks(st.maximum_marks);
        }
      });
      setMarksEntries(entryMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load marks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarks();
  }, [studentClass, division, subject, examName]);

  const handleMarkChange = (studentId: number, val: string) => {
    setMarksEntries((prev) => ({
      ...prev,
      [studentId]: val,
    }));
  };

  const handleSaveMarks = async () => {
    if (students.length === 0) {
      setError('No students registered in this class.');
      return;
    }

    if (maximumMarks <= 0) {
      setError('Maximum marks must be greater than zero.');
      return;
    }

    // Validate marks range: 0 <= marks <= maximumMarks
    for (const [sId, val] of Object.entries(marksEntries)) {
      if (val !== '') {
        const num = Number(val);
        if (isNaN(num) || num < 0 || num > maximumMarks) {
          setError(`Invalid mark for student ID ${sId}: ${val}. Marks must be between 0 and ${maximumMarks}.`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      setError('');
      const entries = students.map((st) => ({
        studentId: st.student_id,
        marksObtained: marksEntries[st.student_id] !== undefined ? marksEntries[st.student_id] : '',
      }));

      await api.saveMarks({
        class: studentClass,
        division,
        subject,
        examName,
        academicYear,
        maximumMarks,
        entries,
      });

      setSuccessMsg(`Marks for ${subject} (${examName}) saved successfully.`);
      loadMarks();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save marks.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Examination Marks & Academic Grading
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter marks with constraint verification (0 ≤ marks ≤ maximum marks)
          </p>
        </div>

        <button
          onClick={handleSaveMarks}
          disabled={saving || students.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition disabled:opacity-60 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Marks...' : 'Save Marks Grid'}</span>
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

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
            Class & Division
          </label>
          <select
            value={`${studentClass}-${division}`}
            onChange={(e) => {
              const [c, d] = e.target.value.split('-');
              setStudentClass(Number(c));
              setDivision(d);
            }}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white outline-none font-semibold text-slate-800"
          >
            {availableClasses.map((ac, idx) => (
              <option key={idx} value={`${ac.class}-${ac.division}`}>
                Class {ac.class}-{ac.division}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
            Subject
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white outline-none text-slate-800"
          >
            {subjectsList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
            Examination
          </label>
          <select
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white outline-none text-slate-800"
          >
            {examsList.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
            Max Marks
          </label>
          <input
            type="number"
            min="1"
            value={maximumMarks}
            onChange={(e) => setMaximumMarks(Number(e.target.value))}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white outline-none font-mono text-slate-800"
          />
        </div>
      </div>

      {/* Marks Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Roll No</th>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold text-center">Marks Obtained (Max: {maximumMarks})</th>
                <th className="px-4 py-3 font-semibold text-center">Percentage</th>
                <th className="px-4 py-3 font-semibold text-right">Academic Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center font-sans text-slate-400">
                    Loading mark entries...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((st) => {
                  const currentVal = marksEntries[st.student_id] ?? '';
                  const numVal = currentVal !== '' ? Number(currentVal) : null;
                  const pct = numVal !== null && maximumMarks > 0 ? ((numVal / maximumMarks) * 100).toFixed(1) : null;

                  let tier = 'Pending';
                  if (pct !== null) {
                    if (Number(pct) >= 75) tier = 'Excellent';
                    else if (Number(pct) >= 50) tier = 'Good';
                    else tier = 'Needs Improvement';
                  }

                  return (
                    <tr key={st.student_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800 tabular-nums">
                        #{st.roll_number}
                      </td>
                      <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                        {st.full_name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={maximumMarks}
                          value={currentVal}
                          onChange={(e) => handleMarkChange(st.student_id, e.target.value)}
                          placeholder="—"
                          className="w-24 px-2 py-1 text-center font-mono text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                        />
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">
                        {pct !== null ? (
                          <span
                            className={`font-semibold ${
                              Number(pct) >= 75
                                ? 'text-emerald-700'
                                : Number(pct) >= 50
                                ? 'text-blue-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {pct}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-sans italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-sans">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                            tier === 'Excellent'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tier === 'Good'
                              ? 'bg-blue-100 text-blue-800'
                              : tier === 'Needs Improvement'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {tier}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center font-sans text-slate-400">
                    <p className="font-semibold text-slate-600">No students found in Class {studentClass}-{division}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Register students in this class before entering marks.
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
