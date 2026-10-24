import React from 'react';
import { User, SystemStatus, UserRole } from '../types';
import { LogOut, Menu, Shield, GraduationCap, School, User as UserIcon, Users, UserCheck } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  systemStatus: SystemStatus | null;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
  onSwitchRole?: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  systemStatus,
  onLogout,
  onToggleMobileMenu,
  onSwitchRole,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 md:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white whitespace-nowrap">
                  EDUCONNECT
                </span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-block">
                  {systemStatus?.academicYear || '2026-2027'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block">
                {systemStatus?.schoolName || 'Smart School Record System'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Dedicated Portal Identification (No Admin access for Teachers, No Admin/Teacher access for Students/Parents) */}
        {user && (
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700/60 text-xs shadow-inner">
            {user.role === 'admin' ? (
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>School Administration Master Console</span>
              </div>
            ) : user.role === 'teacher' ? (
              <div className="flex items-center gap-2 text-blue-300 font-semibold">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span>Teacher & Faculty Workspace</span>
              </div>
            ) : user.role === 'student' ? (
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <UserIcon className="w-4 h-4 text-emerald-400" />
                <span>Student Growth & Academic Record Portal</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-purple-300 font-semibold">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Parent Growth Portal</span>
              </div>
            )}
          </div>
        )}

        {/* Right: User Profile & Actions */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white tracking-wide">
                {user.fullName}
              </div>
              <div className="text-[10px] text-blue-400 uppercase font-mono tracking-wider font-semibold">
                Role: {user.role}
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
              {user.role === 'admin' ? (
                <Shield className="w-4 h-4 text-amber-400" />
              ) : user.role === 'teacher' ? (
                <GraduationCap className="w-4 h-4 text-blue-400" />
              ) : user.role === 'student' ? (
                <UserIcon className="w-4 h-4 text-emerald-400" />
              ) : (
                <UserCheck className="w-4 h-4 text-teal-400" />
              )}
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
