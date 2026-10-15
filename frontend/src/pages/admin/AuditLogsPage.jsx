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
          <h1 className="text-2xl font-extrabold tracking-tight text-[#064E45] flex items-center gap-2">
            <History className="w-6 h-6 text-[#2D806B]" />
            <span>Administrative Audit Trail</span>
          </h1>
          <p className="text-sm text-[#71817B] mt-1">
            Immutable log of sensitive administrative operations, student creations, password
            resets, and approvals.
          </p>
        </div>

        <button
          onClick={() => fetchAuditLogs(pagination.page)}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#EAF7EF] text-[#064E45] font-bold text-xs border border-[#DDE8DF] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#2D806B]" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#EAF7EF] border border-[#CDE5D6] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-[#2D806B] hidden sm:block" />
          <label className="text-xs text-[#064E45] font-bold">Filter Action:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-2 bg-white border border-[#CDE5D6] rounded-xl text-xs text-[#172E2A] focus:outline-none focus:ring-2 focus:ring-[#2D806B]/40"
          >
            <option value="">All Administrative Actions</option>
            <option value="STUDENT_CREATED">STUDENT_CREATED</option>
            <option value="STUDENT_UPDATED">STUDENT_UPDATED</option>
            <option value="PASSWORD_RESET">PASSWORD_RESET</option>
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
          <Loader2 className="w-8 h-8 animate-spin text-[#2D806B]" />
        </div>
      ) : logs.length === 0 ? (
        <Card className="text-center py-12 text-[#71817B] text-sm">
          No audit logs recorded for this criteria.
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-[#DDE8DF] bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DDE8DF] bg-[#FAF8F0] text-[11px] font-bold uppercase tracking-wider text-[#71817B]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBF2EC] text-xs text-[#172E2A]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#F4FAF6] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#71817B] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#064E45]">
                        {log.actor?.name || 'System'}
                      </span>
                      <span className="text-[10px] text-[#71817B] block">
                        {log.actor?.registerNumber} ({log.actor?.role})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#EAF7EF] text-[#2D806B] border border-[#CDE5D6]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#71817B]">
                      {log.affectedResource?.resourceType}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#71817B]">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[#71817B] px-2">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchAuditLogs(pagination.page - 1)}
                  className="p-1.5 rounded-lg bg-white border border-[#DDE8DF] hover:bg-[#EAF7EF] disabled:opacity-40 transition-colors text-[#064E45]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-[#064E45]">{pagination.page}</span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchAuditLogs(pagination.page + 1)}
                  className="p-1.5 rounded-lg bg-white border border-[#DDE8DF] hover:bg-[#EAF7EF] disabled:opacity-40 transition-colors text-[#064E45]"
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
