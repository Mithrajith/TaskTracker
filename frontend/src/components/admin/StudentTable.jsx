import React from 'react';
import { Badge } from '../common/Badge';
import { AuthorizedImage } from '../common/AuthorizedImage';
import {
  KeyRound,
  Edit2,
  Eye,
  ExternalLink,
  Power,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Github } from '../common/Icons';

export const StudentTable = ({
  students = [],
  pagination,
  onPageChange,
  onViewProfile,
  onEditStudent,
  onResetPassword,
  onToggleStatus,
  onDeleteStudent,
  onImageZoom,
}) => {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4">Register No</th>
              <th className="py-3.5 px-4">Current Task</th>
              <th className="py-3.5 px-4">Approved Progress</th>
              <th className="py-3.5 px-4">Task Status</th>
              <th className="py-3.5 px-4">Latest Proof</th>
              <th className="py-3.5 px-4">Latest Submission</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {students.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-500">
                  No student records found matching the criteria.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const stats = student.stats || {};
                const latestProofId = stats.latestSubmission?.fileId;

                return (
                  <tr
                    key={student._id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Student Name & GitHub link */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <span>{student.name}</span>
                        {student.githubRepoUrl && (
                          <a
                            href={student.githubRepoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-purple-400 transition-colors"
                            title="GitHub Profile / Repo"
                          >
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Status: {student.status}
                      </span>
                    </td>

                    {/* Register Number */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                      {student.registerNumber}
                    </td>

                    {/* Current Task */}
                    <td className="py-3.5 px-4">
                      {stats.currentTaskNumber > 0 ? (
                        <div>
                          <span className="font-bold text-purple-400">
                            Task #{stats.currentTaskNumber}
                          </span>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {stats.currentTaskTitle}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Task 0 (None)</span>
                      )}
                    </td>

                    {/* Approved Progress */}
                    <td className="py-3.5 px-4">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span className="text-emerald-400 font-semibold">
                            {stats.approvedPercentage || 0}%
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {stats.approvedTasksCount || 0}/{stats.assignedTasksCount || 0}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-300"
                            style={{ width: `${stats.approvedPercentage || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Current Task Status */}
                    <td className="py-3.5 px-4">
                      <Badge status={stats.currentTaskStatus} />
                    </td>

                    {/* Latest Proof Thumbnail */}
                    <td className="py-3.5 px-4">
                      {latestProofId ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                          <AuthorizedImage
                            fileId={latestProofId}
                            alt="Proof thumbnail"
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => onImageZoom && onImageZoom(latestProofId)}
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">None</span>
                      )}
                    </td>

                    {/* Latest Submission Date */}
                    <td className="py-3.5 px-4 text-[11px] text-slate-400">
                      {stats.latestSubmission?.submittedAt
                        ? new Date(
                            stats.latestSubmission.submittedAt
                          ).toLocaleDateString()
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewProfile(student._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-slate-800 transition-colors"
                          title="View Profile & Submissions"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-slate-800 transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onResetPassword(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onToggleStatus(student)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            student.status === 'active'
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30'
                              : 'text-rose-400 hover:text-emerald-400 hover:bg-emerald-950/30'
                          }`}
                          title={
                            student.status === 'active'
                              ? 'Deactivate Account'
                              : 'Activate Account'
                          }
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteStudent && onDeleteStudent(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Student from Database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} (Total{' '}
            {pagination.total} students)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-200">
              {pagination.page}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
