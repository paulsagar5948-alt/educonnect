import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, Student } from '../types';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users,
} from 'lucide-react';

interface AttendanceViewProps {
  user: User;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ user }) => {
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
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [students, setStudents] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<number, 'Present' | 'Absent' | 'Leave'>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getAttendance(studentClass, division, date);
      setStudents(res.students || []);

      // Populate existing statuses
      const statusMap: Record<number, 'Present' | 'Absent' | 'Leave'> = {};
      (res.students || []).forEach((st: any) => {
        if (st.attendance_status) {
          statusMap[st.student_id] = st.attendance_status;
        } else {
          statusMap[st.student_id] = 'Present'; // Default to Present for quick convenience
        }
      });
      setStatuses(statusMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [studentClass, division, date]);

  const handleSetStatus = (studentId: number, status: 'Present' | 'Absent' | 'Leave') => {
    setStatuses((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status: 'Present' | 'Absent' | 'Leave') => {
    const updated: Record<number, 'Present' | 'Absent' | 'Leave'> = {};
    students.forEach((st) => {
      updated[st.student_id] = status;
    });
    setStatuses(updated);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      setError('No students registered in this class to mark attendance.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const records = students.map((st) => ({
        studentId: st.student_id,
        status: statuses[st.student_id] || 'Present',
      }));

      await api.saveAttendance(studentClass, division, date, records);
      setSuccessMsg(`Attendance for Class ${studentClass}-${division} on ${date} saved successfully.`);
      loadAttendance();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  // Compute live day summary
  const totalInClass = students.length;
  const presentCount = Object.values(statuses).filter((s) => s === 'Present').length;
  const absentCount = Object.values(statuses).filter((s) => s === 'Absent').length;
  const leaveCount = Object.values(statuses).filter((s) => s === 'Leave').length;
  const livePct = totalInClass > 0 ? ((presentCount / totalInClass) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Daily Attendance Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record, correct, and monitor classroom presence with duplicate protection
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || students.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition disabled:opacity-60 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Records...' : 'Save Attendance'}</span>
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

      {/* Class & Date Selector Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
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
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white outline-none font-semibold text-slate-800"
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
              Attendance Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white outline-none font-mono text-slate-800"
            />
          </div>
        </div>

        {/* Quick Batch Actions */}
        {students.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Quick mark:</span>
            <button
              onClick={() => handleMarkAll('Present')}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('Absent')}
              className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
            >
              All Absent
            </button>
          </div>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 block text-[11px] font-medium">Total Registered</span>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{totalInClass}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
          <span className="text-emerald-600 block text-[11px] font-medium">Present Today</span>
          <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">{presentCount}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
          <span className="text-red-600 block text-[11px] font-medium">Absent</span>
          <span className="text-xl font-bold font-mono text-red-700 tabular-nums">{absentCount}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
          <span className="text-blue-600 block text-[11px] font-medium">Daily Attendance Rate</span>
          <span className="text-xl font-bold font-mono text-blue-700 tabular-nums">{livePct}%</span>
        </div>
      </div>

      {/* Attendance Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Roll No</th>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Toggle Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    Loading attendance records...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((st) => {
                  const currentStatus = statuses[st.student_id] || 'Present';

                  return (
                    <tr key={st.student_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 tabular-nums">
                        #{st.roll_number}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {st.full_name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block font-mono text-[11px] font-bold px-2.5 py-0.5 rounded ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : currentStatus === 'Absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.student_id, 'Present')}
                            className={`px-3 py-1 rounded text-xs font-semibold transition ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.student_id, 'Absent')}
                            className={`px-3 py-1 rounded text-xs font-semibold transition ${
                              currentStatus === 'Absent'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.student_id, 'Leave')}
                            className={`px-3 py-1 rounded text-xs font-semibold transition ${
                              currentStatus === 'Leave'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            L
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">No students registered in Class {studentClass}-{division}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Register students in this class before taking attendance.
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
