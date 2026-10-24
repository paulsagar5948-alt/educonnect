import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardStats, User } from '../types';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DashboardOverviewProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ user, onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 p-4 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const isZeroState = stats?.totalStudents === 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {user.role === 'admin' ? 'School Administration Overview' : 'Teacher Growth Dashboard'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time computed metrics from relational database records
          </p>
        </div>

        {user.role === 'admin' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('direct-reg')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Direct Registration</span>
            </button>
            <button
              onClick={() => onNavigate('teachers')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Faculty</span>
            </button>
            <button
              onClick={() => onNavigate('tests')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition cursor-pointer"
            >
              <span>Run System Tests</span>
            </button>
          </div>
        )}

        {user.role === 'teacher' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('direct-reg')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Direct Register</span>
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Student</span>
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Mark Attendance</span>
            </button>
          </div>
        )}
      </div>

      {/* Helpful Empty State message per Requirement 1 */}
      {isZeroState && (
        <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-blue-900">
                Initial Database State: Zero Records
              </h2>
              <p className="text-xs text-blue-800 mt-0.5 max-w-2xl leading-relaxed">
                {user.role === 'admin'
                  ? 'No students registered yet. As Administrator, first create teacher accounts under Faculty & Teachers and assign them classes. Teachers can then register students.'
                  : 'No students registered yet in your assigned classes. An authorized teacher can add the first student using the Register Student button.'}
              </p>
            </div>
          </div>
          {user.role === 'admin' ? (
            <button
              onClick={() => onNavigate('teachers')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shrink-0 cursor-pointer"
            >
              <span>Add First Teacher</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('students')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shrink-0 cursor-pointer"
            >
              <span>Add First Student</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* KPI Stat Cards (Real computed zeros, strict tabular figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Students
            </span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {stats?.totalStudents ?? 0}
            </span>
            <span className="text-xs text-slate-500">enrolled</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Class 1 to Class 10 records</p>
        </div>

        {/* Active Teachers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Faculty
            </span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {stats?.activeTeachers ?? 0}
            </span>
            <span className="text-xs text-slate-500">teachers</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Class-assigned mentors</p>
        </div>

        {/* Average Attendance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg. Attendance
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {stats?.avgAttendanceRate ?? 0}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Computed on recorded days</p>
        </div>

        {/* Performance High Achievers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Distinction (≥75%)
            </span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {stats?.performanceSummary.excellent ?? 0}
            </span>
            <span className="text-xs text-slate-500">marks entries</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Excellent category grade</p>
        </div>
      </div>

      {/* Academic Distribution & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Category Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Academic Performance Tiers</h2>
          <p className="text-xs text-slate-500 mb-4">
            Percentage = (Total Marks Obtained / Total Maximum Marks) × 100
          </p>

          <div className="space-y-3.5">
            {/* Excellent */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-700">Excellent (≥ 75%)</span>
                <span className="font-mono text-slate-700 font-semibold tabular-nums">
                  {stats?.performanceSummary.excellent ?? 0} records
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (stats?.performanceSummary.excellent || 0) +
                        (stats?.performanceSummary.good || 0) +
                        (stats?.performanceSummary.needsImprovement || 0) >
                      0
                        ? (stats!.performanceSummary.excellent /
                            (stats!.performanceSummary.excellent +
                              stats!.performanceSummary.good +
                              stats!.performanceSummary.needsImprovement)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Good */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-blue-700">Good (50% to &lt; 75%)</span>
                <span className="font-mono text-slate-700 font-semibold tabular-nums">
                  {stats?.performanceSummary.good ?? 0} records
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (stats?.performanceSummary.excellent || 0) +
                        (stats?.performanceSummary.good || 0) +
                        (stats?.performanceSummary.needsImprovement || 0) >
                      0
                        ? (stats!.performanceSummary.good /
                            (stats!.performanceSummary.excellent +
                              stats!.performanceSummary.good +
                              stats!.performanceSummary.needsImprovement)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Needs Improvement */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-amber-700">Needs Improvement (&lt; 50%)</span>
                <span className="font-mono text-slate-700 font-semibold tabular-nums">
                  {stats?.performanceSummary.needsImprovement ?? 0} records
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (stats?.performanceSummary.excellent || 0) +
                        (stats?.performanceSummary.good || 0) +
                        (stats?.performanceSummary.needsImprovement || 0) >
                      0
                        ? (stats!.performanceSummary.needsImprovement /
                            (stats!.performanceSummary.excellent +
                              stats!.performanceSummary.good +
                              stats!.performanceSummary.needsImprovement)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recently Added Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recently Enrolled Students</h2>
              <p className="text-xs text-slate-500">Latest records added to system</p>
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats?.recentlyAdded && stats.recentlyAdded.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recentlyAdded.map((st) => (
                <div key={st.student_id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{st.full_name}</p>
                    <p className="text-[11px] text-slate-500">
                      Class {st.class}-{st.division} · Roll #{st.roll_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-slate-500">
                      Enrolled: {st.enrollment_date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No students enrolled yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
