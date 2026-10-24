import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet,
  FileText,
  Bell,
  ShieldCheck,
  Database,
  CheckCircle2,
  UserCheck,
  BookOpen,
  UserPlus,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'direct-reg', label: 'Direct Registration', icon: UserPlus },
          { id: 'teachers', label: 'Faculty & Teachers', icon: Users },
          { id: 'students', label: 'All Students', icon: GraduationCap },
          { id: 'attendance', label: 'Attendance Records', icon: CalendarCheck },
          { id: 'marks', label: 'Marks & Grades', icon: FileSpreadsheet },
          { id: 'reports', label: 'Academic Reports', icon: FileText },
          { id: 'notices', label: 'School Notices', icon: Bell },
          { id: 'audit-logs', label: 'Audit Trail Logs', icon: ShieldCheck },
          { id: 'backup', label: 'SQL Backup & Schema', icon: Database },
          { id: 'tests', label: 'System Integrity Tests', icon: CheckCircle2 },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Teacher Overview', icon: LayoutDashboard },
          { id: 'direct-reg', label: 'Register Student', icon: UserPlus },
          { id: 'students', label: 'Assigned Students', icon: GraduationCap },
          { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
          { id: 'marks', label: 'Marks Entry', icon: FileSpreadsheet },
          { id: 'reports', label: 'Class Reports', icon: FileText },
          { id: 'notices', label: 'School Notices', icon: Bell },
        ];
      case 'student':
        return [
          { id: 'portal', label: 'My Academic Profile', icon: GraduationCap },
          { id: 'notices', label: 'School Notices', icon: Bell },
        ];
      case 'parent':
        return [
          { id: 'portal', label: 'My Children', icon: UserCheck },
          { id: 'notices', label: 'School Notices', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const content = (
    <div className="h-full flex flex-col justify-between py-5 px-3">
      <div>
        <div className="px-3 mb-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            {role === 'admin'
              ? 'Administration Portal'
              : role === 'teacher'
              ? 'Teacher Workspace'
              : role === 'student'
              ? 'Student Growth Portal'
              : 'Parent Portal'}
          </p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-3 pt-4 border-t border-slate-200">
        <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600">
          <p className="font-semibold text-slate-900 mb-0.5">EduConnect v2.6</p>
          <p className="text-[11px] text-slate-500">
            Relational SQLite Engine · Role Access Control Active
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full z-50 shadow-xl flex flex-col">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
