import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import apiClient from '../../api/client';
import { useToast } from '../../context/ToastContext';
import {
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Users,
  Loader2,
  FileSpreadsheet,
  BookOpen,
} from 'lucide-react';

export const ExportStudentsModal = ({ isOpen, onClose }) => {
  const { error: toastError, success: toastSuccess } = useToast();

  const [tasks, setTasks] = useState([]);
  const [selectedTaskNumber, setSelectedTaskNumber] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all' | 'done' | 'not_done'

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [exportData, setExportData] = useState(null);

  // Fetch available tasks for the selector dropdown
  useEffect(() => {
    if (!isOpen) return;

    const fetchTasks = async () => {
      try {
        const res = await apiClient.get('/tasks');
        if (res.data?.success && res.data.data?.length > 0) {
          const sorted = res.data.data.sort((a, b) => a.taskNumber - b.taskNumber);
          setTasks(sorted);
          if (sorted[0]?.taskNumber) {
            setSelectedTaskNumber(sorted[0].taskNumber);
          }
        }
      } catch (err) {
        console.error('Failed to load tasks for export:', err);
      }
    };

    fetchTasks();
  }, [isOpen]);

  // Fetch preview data whenever selected task or filter changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchPreview = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/students/export', {
          params: {
            taskNumber: selectedTaskNumber,
            filter,
            format: 'json',
          },
        });

        if (res.data?.success) {
          setExportData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch export preview:', err);
        toastError('Failed to fetch student data for export');
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [isOpen, selectedTaskNumber, filter]);

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      const res = await apiClient.get('/students/export', {
        params: {
          taskNumber: selectedTaskNumber,
          filter,
          format: 'csv',
        },
        responseType: 'blob',
      });

      // Create download link from blob
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `students_task_${selectedTaskNumber}_${filter}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toastSuccess(`Exported CSV for Task #${selectedTaskNumber} (${filter})`);
    } catch (err) {
      console.error('Failed to download CSV:', err);
      toastError('Failed to download CSV file');
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  const summary = exportData?.summary || {
    totalStudents: 0,
    doneCount: 0,
    notDoneCount: 0,
    filteredCount: 0,
  };

  const studentList = exportData?.data || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Students by Task Progress"
      subtitle="Export students who completed Task N and those who haven't"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Task Selection and Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#EAF7EF] border border-[#DDE8DF]">
          {/* Select Task Number N */}
          <div>
            <label className="block text-xs font-bold text-[#064E45] mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#064E45]" />
              <span>Select Task Number (N)</span>
            </label>
            <select
              value={selectedTaskNumber}
              onChange={(e) => setSelectedTaskNumber(parseInt(e.target.value, 10))}
              className="w-full p-2.5 bg-white border border-[#DDE8DF] rounded-xl text-xs text-[#172E2A] font-bold focus:outline-none focus:ring-2 focus:ring-[#064E45]/20"
            >
              {tasks.length > 0 ? (
                tasks.map((t) => (
                  <option key={t._id} value={t.taskNumber}>
                    Task #{t.taskNumber}: {t.title}
                  </option>
                ))
              ) : (
                <>
                  <option value={1}>Task #1</option>
                  <option value={2}>Task #2</option>
                  <option value={3}>Task #3</option>
                  <option value={4}>Task #4</option>
                  <option value={5}>Task #5</option>
                </>
              )}
            </select>
          </div>

          {/* Select Completion Filter */}
          <div>
            <label className="block text-xs font-bold text-[#064E45] mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#064E45]" />
              <span>Export Criteria</span>
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#DDE8DF] rounded-xl text-xs text-[#172E2A] font-bold focus:outline-none focus:ring-2 focus:ring-[#064E45]/20"
            >
              <option value="all">All Students (Done &amp; Didn't Do)</option>
              <option value="done">Completed Task #{selectedTaskNumber} (Done)</option>
              <option value="not_done">Haven't Completed Task #{selectedTaskNumber} (Didn't Do)</option>
            </select>
          </div>
        </div>

        {/* Live Metrics Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-white border border-[#DDE8DF] text-center shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71817B] block">
              Total Students
            </span>
            <span className="text-xl font-extrabold text-[#064E45]">
              {summary.totalStudents}
            </span>
          </div>

          <div
            onClick={() => setFilter('done')}
            className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
              filter === 'done'
                ? 'bg-[#EAF7EF] border-[#2D9B70] shadow-sm'
                : 'bg-white border-[#DDE8DF] hover:border-[#2D9B70]'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D9B70] flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Done Task #{selectedTaskNumber}
            </span>
            <span className="text-xl font-extrabold text-[#2D9B70]">
              {summary.doneCount}
            </span>
          </div>

          <div
            onClick={() => setFilter('not_done')}
            className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
              filter === 'not_done'
                ? 'bg-[#FFF8EA] border-[#F3B74F] shadow-sm'
                : 'bg-white border-[#DDE8DF] hover:border-[#F3B74F]'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A86B0F] flex items-center justify-center gap-1">
              <XCircle className="w-3 h-3 text-[#F3B74F]" />
              Didn't Do
            </span>
            <span className="text-xl font-extrabold text-[#F3B74F]">
              {summary.notDoneCount}
            </span>
          </div>
        </div>

        {/* Preview Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#71817B]">
            <span className="font-bold text-[#064E45]">
              Preview ({studentList.length} students matching criteria)
            </span>
            <span className="font-mono text-[11px] text-[#71817B]">Columns: Student | Register No | Current Task | Task Status</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#DDE8DF] max-h-72 overflow-y-auto bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#FAF8F0] border-b border-[#DDE8DF] text-[11px] font-bold uppercase tracking-wider text-[#71817B] z-10">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Register No</th>
                  <th className="py-2.5 px-3">Current Task</th>
                  <th className="py-2.5 px-3">Task Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE8DF] text-[#172E2A]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#71817B]">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#064E45] mb-1" />
                      <span>Loading student preview...</span>
                    </td>
                  </tr>
                ) : studentList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#71817B]">
                      No students found matching this criteria.
                    </td>
                  </tr>
                ) : (
                  studentList.map((st) => (
                    <tr key={st.id} className="hover:bg-[#EAF7EF]/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#172E2A]">
                        {st.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-[#064E45]">
                        {st.registerNumber}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#172E2A]">
                        <span className="font-semibold text-[#064E45]">
                          {st.currentTask || (st.currentTaskNumber > 0 ? `Task #${st.currentTaskNumber}` : 'None')}
                        </span>
                        {st.currentTaskTitle && st.currentTaskTitle !== 'No tasks assigned yet' && (
                          <span className="block text-[10px] text-[#71817B] truncate max-w-[170px]">
                            {st.currentTaskTitle}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            st.taskStatus === 'Approved'
                              ? 'bg-[#EAF7EF] text-[#2D9B70] border-[#DDE8DF]'
                              : st.taskStatus === 'Submitted'
                              ? 'bg-[#E0F3E8] text-[#064E45] border-[#DDE8DF]'
                              : st.taskStatus === 'Changes Requested'
                              ? 'bg-[#FFF8EA] text-[#A86B0F] border-[#FCE6BD]'
                              : st.taskStatus === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-gray-100 text-[#71817B] border-[#DDE8DF]'
                          }`}
                        >
                          {st.taskStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#DDE8DF]">
          <span className="text-xs text-[#71817B]">
            Exports only <b>Student</b>, <b>Register No</b>, <b>Current Task</b>, and <b>Task Status</b> as CSV.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#71817B] hover:text-[#064E45] hover:bg-[#EAF7EF] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={downloading || summary.filteredCount === 0}
              className="px-5 py-2.5 rounded-xl bg-[#064E45] hover:bg-[#053d36] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Preparing CSV...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download CSV ({summary.filteredCount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

