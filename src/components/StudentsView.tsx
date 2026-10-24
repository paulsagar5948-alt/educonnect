import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Student, User } from '../types';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { StudentRegisterModal } from './StudentRegisterModal';
import { StudentProfileModal } from './StudentProfileModal';
import { StudentEditModal } from './StudentEditModal';

interface StudentsViewProps {
  user: User;
  onOpenReportCard: (studentId: number) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ user, onOpenReportCard }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('roll_number');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getStudents({
        class: selectedClass || undefined,
        division: selectedDivision || undefined,
        search: search.trim() || undefined,
        page,
        limit,
        sortBy,
        order,
      });
      setStudents(res.students || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [page, limit, selectedClass, selectedDivision, sortBy, order]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadStudents();
  };

  const handleDelete = async (student: Student) => {
    if (!window.confirm(`Are you sure you want to delete student ${student.full_name} (Roll #${student.roll_number})? All marks and attendance will be removed.`)) {
      return;
    }

    try {
      await api.deleteStudent(student.student_id);
      setSuccessMsg(`Student ${student.full_name} deleted.`);
      loadStudents();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete student.');
    }
  };

  const handleExportCsv = () => {
    const q = new URLSearchParams({ type: 'students' });
    if (selectedClass) q.set('class', selectedClass);
    if (selectedDivision) q.set('division', selectedDivision);
    window.location.href = `/api/reports/export-csv?${q.toString()}`;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {user.role === 'teacher' ? 'Assigned Class Roster' : 'Student Record Management'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Class 1 to Class 10 student profiles, roll numbers, and academic records
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(user.role === 'admin' || user.role === 'teacher') && (
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          {(user.role === 'admin' || user.role === 'teacher') && (
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Student</span>
            </button>
          )}
        </div>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or roll number..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Class Filter */}
        <div className="w-32">
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setPage(1);
            }}
            className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
          >
            <option value="">All Classes</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        </div>

        {/* Division Filter */}
        <div className="w-28">
          <select
            value={selectedDivision}
            onChange={(e) => {
              setSelectedDivision(e.target.value);
              setPage(1);
            }}
            className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
          >
            <option value="">All Divs</option>
            {['A', 'B', 'C', 'D'].map((d) => (
              <option key={d} value={d}>
                Div {d}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Column */}
        <div className="w-36">
          <select
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [col, ord] = e.target.value.split('-');
              setSortBy(col);
              setOrder(ord as 'asc' | 'desc');
            }}
            className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
          >
            <option value="roll_number-asc">Roll No (Asc)</option>
            <option value="roll_number-desc">Roll No (Desc)</option>
            <option value="full_name-asc">Name (A-Z)</option>
            <option value="full_name-desc">Name (Z-A)</option>
            <option value="class-asc">Class (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Students Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Roll No</th>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold">Class & Div</th>
                <th className="px-4 py-3 font-semibold">Parent / Contact</th>
                <th className="px-4 py-3 font-semibold text-center">Attendance %</th>
                <th className="px-4 py-3 font-semibold text-center">Avg Marks %</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Loading student database records...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((st) => {
                  const attRate =
                    st.total_attendance_days && st.total_attendance_days > 0
                      ? ((st.present_days || 0) / st.total_attendance_days) * 100
                      : null;

                  return (
                    <tr key={st.student_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 tabular-nums">
                        #{st.roll_number}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div>{st.full_name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          DOB: {st.date_of_birth}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                          Class {st.class}-{st.division}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-800 font-medium">{st.parent_or_guardian_name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{st.parent_contact}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono tabular-nums">
                        {attRate !== null ? (
                          <span
                            className={`font-semibold ${
                              attRate >= 75
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {attRate.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not recorded</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono tabular-nums">
                        {st.avg_marks_pct !== null && st.avg_marks_pct !== undefined ? (
                          <span
                            className={`font-semibold ${
                              st.avg_marks_pct >= 75
                                ? 'text-emerald-700'
                                : st.avg_marks_pct >= 50
                                ? 'text-blue-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {st.avg_marks_pct}%
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No marks</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setSelectedStudentId(st.student_id)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                            title="View Student Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {(user.role === 'admin' || user.role === 'teacher') && (
                            <button
                              onClick={() => setEditingStudent(st)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition cursor-pointer"
                              title="Edit Student Information"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {(user.role === 'admin' || user.role === 'teacher') && (
                            <button
                              onClick={() => handleDelete(st)}
                              className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">No students registered yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {user.role === 'teacher'
                        ? 'An authorized teacher can add the first student using the Register Student button.'
                        : 'No student records match the active criteria.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Controls */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-mono">
            Showing {students.length} of {total} records (Page {page} of {totalPages})
          </div>

          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 text-xs border border-slate-300 rounded bg-white outline-none"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-slate-700 px-1 font-semibold">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* REGISTER STUDENT MODAL */}
      {isRegisterOpen && (
        <StudentRegisterModal
          user={user}
          onClose={() => setIsRegisterOpen(false)}
          onSuccess={() => {
            setIsRegisterOpen(false);
            setSuccessMsg('Student registered successfully.');
            loadStudents();
            setTimeout(() => setSuccessMsg(''), 4000);
          }}
        />
      )}

      {/* STUDENT EDIT MODAL */}
      {editingStudent !== null && (
        <StudentEditModal
          user={user}
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSuccess={() => {
            setEditingStudent(null);
            setSuccessMsg('Student information updated successfully.');
            loadStudents();
            setTimeout(() => setSuccessMsg(''), 4000);
          }}
        />
      )}

      {/* STUDENT PROFILE MODAL */}
      {selectedStudentId !== null && (
        <StudentProfileModal
          studentId={selectedStudentId}
          currentUser={user}
          onClose={() => setSelectedStudentId(null)}
          onOpenReportCard={(id) => {
            setSelectedStudentId(null);
            onOpenReportCard(id);
          }}
          onRefreshList={loadStudents}
        />
      )}
    </div>
  );
};
