import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { ShieldAlert, Lock, UserCheck, School, Calendar, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface SetupModalProps {
  onSetupSuccess: (user: User) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ onSetupSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [schoolName, setSchoolName] = useState('EduConnect Academy');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please provide the full name for the master school administrator.');
      return;
    }
    if (!emailOrUsername.trim()) {
      setError('Please provide a secure master username or institutional email.');
      return;
    }
    if (password.length < 6) {
      setError('Master administrator password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter carefully.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.setupAdmin({
        fullName: fullName.trim(),
        emailOrUsername: emailOrUsername.trim(),
        password,
        schoolName: schoolName.trim(),
        academicYear: academicYear.trim(),
      });
      if (res.success && res.user) {
        onSetupSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Setup initialization failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          EDUCONNECT
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-400">
          First-Time System Initialization & Master Admin Setup
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200">
          <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex gap-2.5 items-start">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">One-Time Secure Initialization:</span> No administrators exist in the database. Please establish the root administrator account. Once created, this setup route permanently locks itself.
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Admin Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Arthur Vance"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Admin Email / Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="e.g. admin@school.edu or principal"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Master Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2">School Configuration</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">School Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-md disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Initializing Relational Database...</span>
                ) : (
                  <>
                    <span>Initialize Root Administrator</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            EDUCONNECT · Strict Role Hierarchy · Secure Relational Storage
          </div>
        </div>
      </div>
    </div>
  );
};
