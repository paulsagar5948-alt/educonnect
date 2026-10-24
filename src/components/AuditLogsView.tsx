import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AuditLogItem } from '../types';
import { ShieldCheck, Search, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getAuditLogs(page, 30, actionFilter);
      setLogs(res.logs || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            System Security & Audit Trail Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking of data modifications, attendance saves, marks entries, and logins
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-600">Filter Action:</label>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none bg-white font-mono"
        >
          <option value="">All Actions</option>
          <option value="INITIALIZE_ADMIN">INITIALIZE_ADMIN</option>
          <option value="LOGIN">LOGIN</option>
          <option value="CREATE_TEACHER">CREATE_TEACHER</option>
          <option value="REGISTER_STUDENT">REGISTER_STUDENT</option>
          <option value="RECORD_ATTENDANCE">RECORD_ATTENDANCE</option>
          <option value="ENTER_MARKS">ENTER_MARKS</option>
          <option value="LINK_PARENT">LINK_PARENT</option>
          <option value="CREATE_NOTICE">CREATE_NOTICE</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold font-sans">User</th>
                <th className="px-4 py-3 font-semibold">Target Entity</th>
                <th className="px-4 py-3 font-semibold font-sans">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center font-sans text-slate-400">
                    Loading security logs...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => {
                  let payloadSummary = '';
                  if (log.new_value) {
                    try {
                      const parsed = JSON.parse(log.new_value);
                      payloadSummary = JSON.stringify(parsed);
                    } catch {
                      payloadSummary = log.new_value;
                    }
                  }

                  return (
                    <tr key={log.log_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {log.created_at ? log.created_at.replace('T', ' ').slice(0, 19) : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-blue-700">{log.action}</span>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <span className="font-semibold text-slate-900">
                          {log.user_full_name || 'System / Admin'}
                        </span>{' '}
                        {log.user_role && (
                          <span className="text-[10px] uppercase font-mono text-slate-400">
                            ({log.user_role})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {log.table_name} {log.record_id ? `#${log.record_id}` : ''}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 max-w-xs truncate" title={payloadSummary}>
                        {payloadSummary || '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center font-sans text-slate-400">
                    No audit log records recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 font-mono">
            Total {total} audit records (Page {page} of {totalPages})
          </div>
          <div className="flex items-center gap-2">
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
    </div>
  );
};
