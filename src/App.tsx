import React, { useEffect, useState } from 'react';
import { api, setToken, getToken } from './services/api';
import { User, SystemStatus } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SetupModal } from './components/SetupModal';
import { LoginModal } from './components/LoginModal';
import { DashboardOverview } from './components/DashboardOverview';
import { AdminTeachersView } from './components/AdminTeachersView';
import { StudentsView } from './components/StudentsView';
import { AttendanceView } from './components/AttendanceView';
import { MarksView } from './components/MarksView';
import { ReportsView } from './components/ReportsView';
import { NoticesView } from './components/NoticesView';
import { AuditLogsView } from './components/AuditLogsView';
import { DatabaseBackupView } from './components/DatabaseBackupView';
import { SystemTestsView } from './components/SystemTestsView';
import { StudentPortalView } from './components/StudentPortalView';
import { ParentPortalView } from './components/ParentPortalView';
import { ReportCardModal } from './components/ReportCardModal';
import { DirectRegistrationView } from './components/DirectRegistrationView';

export default function App() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Global report card modal
  const [reportCardStudentId, setReportCardStudentId] = useState<number | null>(null);

  const checkStatusAndAuth = async () => {
    try {
      setLoading(true);
      const status = await api.getSystemStatus();
      setSystemStatus(status);

      // If token exists, try fetching current user
      const token = getToken();
      if (token) {
        try {
          const me = await api.getCurrentUser();
          setCurrentUser(me.user);
          // Set appropriate initial tab based on role
          if (me.user.role === 'student' || me.user.role === 'parent') {
            setCurrentTab('portal');
          } else {
            setCurrentTab('dashboard');
          }
        } catch {
          setToken('');
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.error('[EduConnect] Initialization check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatusAndAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    setToken('');
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'student' || user.role === 'parent') {
      setCurrentTab('portal');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleSelectTab = (tab: string) => {
    // Teacher cannot access admin tabs (teachers, audit-logs, backup, tests)
    if (currentUser?.role === 'teacher') {
      const allowedTeacherTabs = ['dashboard', 'direct-reg', 'students', 'attendance', 'marks', 'reports', 'notices'];
      if (!allowedTeacherTabs.includes(tab)) {
        setCurrentTab('dashboard');
        return;
      }
    }
    // Student or parent cannot access admin or teacher tabs
    if (currentUser?.role === 'student' || currentUser?.role === 'parent') {
      const allowedStudentTabs = ['portal', 'notices'];
      if (!allowedStudentTabs.includes(tab)) {
        setCurrentTab('portal');
        return;
      }
    }
    setCurrentTab(tab);
  };

  const handleSwitchRole = async (role: any) => {
    // Block teachers from switching to admin
    if (currentUser?.role === 'teacher' && role === 'admin') {
      return;
    }
    // Block students and parents from switching to admin or teacher
    if ((currentUser?.role === 'student' || currentUser?.role === 'parent') && (role === 'admin' || role === 'teacher')) {
      return;
    }

    try {
      const res = await api.instantLogin(role);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setCurrentUser(res.user);
        if (res.user.role === 'student' || res.user.role === 'parent') {
          setCurrentTab('portal');
        } else {
          setCurrentTab('dashboard');
        }
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  const handleSetupSuccess = (user: User) => {
    setSystemStatus((prev) => (prev ? { ...prev, adminExists: true, initialized: true } : null));
    setCurrentUser(user);
    setCurrentTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h1 className="text-white text-base font-bold tracking-tight">
          EDUCONNECT
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-mono">
          Connecting to Relational Database...
        </p>
      </div>
    );
  }

  // 1. First-time Admin Setup: If no admin exists, show one-time initialization
  if (!systemStatus?.adminExists) {
    return <SetupModal onSetupSuccess={handleSetupSuccess} />;
  }

  // 2. Login Screen: If not authenticated
  if (!currentUser) {
    return (
      <LoginModal
        systemStatus={systemStatus}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={currentUser}
        systemStatus={systemStatus}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onSwitchRole={handleSwitchRole}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          role={currentUser.role}
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Admin & Teacher Dashboards */}
          {currentTab === 'dashboard' && (currentUser.role === 'admin' || currentUser.role === 'teacher') && (
            <DashboardOverview
              user={currentUser}
              onNavigate={handleSelectTab}
            />
          )}

          {/* Direct Registration for Students (Allowed for Admin & Teacher; Teacher can only register students) */}
          {currentTab === 'direct-reg' && (currentUser.role === 'admin' || currentUser.role === 'teacher') && (
            <DirectRegistrationView userRole={currentUser.role} />
          )}

          {/* Admin Faculty Management - Strictly Admin Only */}
          {currentTab === 'teachers' && currentUser.role === 'admin' && (
            <AdminTeachersView />
          )}

          {/* Student Roster - Admin or Teacher Only */}
          {currentTab === 'students' && (currentUser.role === 'admin' || currentUser.role === 'teacher') && (
            <StudentsView
              user={currentUser}
              onOpenReportCard={(studentId) => setReportCardStudentId(studentId)}
            />
          )}

          {/* Attendance - Admin or Teacher Only */}
          {currentTab === 'attendance' && (currentUser.role === 'admin' || currentUser.role === 'teacher') && (
            <AttendanceView user={currentUser} />
          )}

          {/* Marks & Grading - Admin or Teacher Only */}
          {currentTab === 'marks' && (currentUser.role === 'admin' || currentUser.role === 'teacher') && (
            <MarksView user={currentUser} />
          )}

          {/* Reports - Admin or Teacher Only */}
          {currentTab === 'reports' && (currentUser.role === 'admin' || currentUser.role === 'teacher') && (
            <ReportsView
              user={currentUser}
              onOpenReportCard={(studentId) => setReportCardStudentId(studentId)}
            />
          )}

          {/* Notices - All authenticated roles */}
          {currentTab === 'notices' && (
            <NoticesView user={currentUser} />
          )}

          {/* Audit Logs - Strictly Admin Only */}
          {currentTab === 'audit-logs' && currentUser.role === 'admin' && (
            <AuditLogsView />
          )}

          {/* Database Backup & Schema - Strictly Admin Only */}
          {currentTab === 'backup' && currentUser.role === 'admin' && (
            <DatabaseBackupView />
          )}

          {/* System Test Runner - Strictly Admin Only */}
          {currentTab === 'tests' && currentUser.role === 'admin' && (
            <SystemTestsView />
          )}

          {/* Student Portal - Strictly Student Role Only */}
          {currentTab === 'portal' && currentUser.role === 'student' && (
            <StudentPortalView
              user={currentUser}
              onOpenReportCard={(studentId) => setReportCardStudentId(studentId)}
            />
          )}

          {/* Parent Portal - Strictly Parent Role Only */}
          {currentTab === 'portal' && currentUser.role === 'parent' && (
            <ParentPortalView
              user={currentUser}
              onOpenReportCard={(studentId) => setReportCardStudentId(studentId)}
            />
          )}
        </main>
      </div>

      {/* Global Official Report Card Modal */}
      {reportCardStudentId !== null && (
        <ReportCardModal
          studentId={reportCardStudentId}
          onClose={() => setReportCardStudentId(null)}
        />
      )}
    </div>
  );
}
