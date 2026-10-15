import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import {
  History,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export const AuditLogsPage = () => {
  const { error } = useToast();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchAuditLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (actionFilter) params.action = actionFilter;

      const res = await apiClient.get('/audit-logs', { params });
      if (res.data?.success) {
        setLogs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      error('Failed to fetch audit log trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(1);
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#233DFF] flex items-center gap-2">
            <History className="w-6 h-6 text-[#233DFF]" />
            <span>Administrative Audit Trail</span>
          </h1>
          <p className="text-sm text-[#77766F] mt-1">
            Immutable log of sensitive administrative operations, student creations, password
            resets, and approvals.
          </p>
        </div>

        <button
          onClick={() => fetchAuditLogs(pagination.page)}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#E5DED2] text-[#233DFF] font-bold text-xs border border-[#D6CEC1] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#233DFF]" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#E5DED2] border border-[#D6CEC1] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-[#233DFF] hidden sm:block" />
          <label className="text-xs text-[#233DFF] font-bold">Filter Action:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-2 bg-white border border-[#D6CEC1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#233DFF]/40"
          >
            <option value="">All Administrative Actions</option>
            <option value="STUDENT_CREATED">STUDENT_CREATED</option>
            <option value="STUDENT_UPDATED">STUDENT_UPDATED</option>
            <option value="PASSWORD_RESET">PASSWORD_RESET</option>
            <option value="PASSWORD_CHANGED">PASSWORD_CHANGED</option>
            <option value="PROFILE_UPDATED">PROFILE_UPDATED</option>
            <option value="TASK_CREATED">TASK_CREATED</option>
            <option value="TASK_PUBLISHED">TASK_PUBLISHED</option>
            <option value="SUBMISSION_APPROVED">SUBMISSION_APPROVED</option>
            <option value="CHANGES_REQUESTED">CHANGES_REQUESTED</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#233DFF]" />
        </div>
      ) : logs.length === 0 ? (
        <Card className="text-center py-12 text-[#77766F] text-sm">
          No audit logs recorded for this criteria.
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-[#D6CEC1] bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D6CEC1] bg-[#F5F0E8] text-[11px] font-bold uppercase tracking-wider text-[#77766F]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DED2] text-xs text-[#242424]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#F1ECE2] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#77766F] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#233DFF]">
                        {log.actor?.name || 'System'}
                      </span>
                      <span className="text-[10px] text-[#77766F] block">
                        {log.actor?.registerNumber} ({log.actor?.role})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#E5DED2] text-[#233DFF] border border-[#D6CEC1]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#77766F]">
                      {log.affectedResource?.resourceType}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#77766F]">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[#77766F] px-2">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchAuditLogs(pagination.page - 1)}
                  className="p-1.5 rounded-lg bg-white border border-[#D6CEC1] hover:bg-[#E5DED2] disabled:opacity-40 transition-colors text-[#233DFF]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-[#233DFF]">{pagination.page}</span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchAuditLogs(pagination.page + 1)}
                  className="p-1.5 rounded-lg bg-white border border-[#D6CEC1] hover:bg-[#E5DED2] disabled:opacity-40 transition-colors text-[#233DFF]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
