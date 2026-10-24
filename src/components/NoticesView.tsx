import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Notice, User } from '../types';
import { Bell, Plus, X, Calendar, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NoticesViewProps {
  user: User;
}

export const NoticesView: React.FC<NoticesViewProps> = ({ user }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create notice modal
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'teachers' | 'students' | 'parents'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const res = await api.getNotices();
      setNotices(res.notices || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load school notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setIsSubmitting(true);
      await api.createNotice({
        title: title.trim(),
        message: message.trim(),
        targetAudience,
      });
      setSuccessMsg('Notice published successfully.');
      setIsOpenCreate(false);
      setTitle('');
      setMessage('');
      loadNotices();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to post notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPost = user.role === 'admin' || user.role === 'teacher';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            School Circulars & Official Notices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-targeted institutional announcements and school communications
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setIsOpenCreate(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Notice</span>
          </button>
        )}
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

      {/* Notices Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold animate-pulse">
            Loading active school notices...
          </div>
        ) : notices.length > 0 ? (
          notices.map((n) => (
            <div key={n.notice_id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 uppercase">
                    Audience: {n.target_audience}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {n.created_at.slice(0, 10)}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-3">
                {n.message}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Issued by: <strong className="text-slate-600">{n.author_name}</strong> ({n.author_role})
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No school notices published</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {canPost
                ? 'Authorized staff can post institutional announcements using the button above.'
                : 'Check back later for school circulars.'}
            </p>
          </div>
        )}
      </div>

      {/* CREATE NOTICE MODAL */}
      {isOpenCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Publish Official Notice</h2>
              <button
                onClick={() => setIsOpenCreate(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Notice Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for Second-Term Diagnostic Assessments"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Audience <span className="text-red-500">*</span>
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-medium"
                >
                  <option value="all">Entire School Community (All Roles)</option>
                  <option value="teachers">Faculty & Teachers Only</option>
                  <option value="students">Students Only</option>
                  <option value="parents">Parents Only</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Announcement Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type the full announcement details here..."
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpenCreate(false)}
                  className="px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-60"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
