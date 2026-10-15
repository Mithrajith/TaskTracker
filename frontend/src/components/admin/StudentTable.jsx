import React from 'react';
import { Badge } from '../common/Badge';
import { AuthorizedImage } from '../common/AuthorizedImage';
import {
  KeyRound,
  Edit2,
  Eye,
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
      <div className="overflow-x-auto rounded-2xl border border-[#D6CEC1] bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#D6CEC1] bg-[#F5F0E8] text-[11px] font-bold uppercase tracking-wider text-[#77766F]">
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
          <tbody className="divide-y divide-[#E5DED2] text-xs text-[#242424]">
            {students.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-[#77766F]">
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
                    className="hover:bg-[#F1ECE2] transition-colors group"
                  >
                    {/* Student Name & GitHub link */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#233DFF] flex items-center gap-2">
                        <span>{student.name}</span>
                        {student.githubRepoUrl && (
                          <a
                            href={student.githubRepoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#9A9890] hover:text-[#233DFF] transition-colors"
                            title="GitHub Profile / Repo"
                          >
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <span className="text-[10px] text-[#77766F]">
                        Status: {student.status}
                      </span>
                    </td>

                    {/* Register Number */}
                    <td className="py-3.5 px-4 font-mono font-medium text-[#242424]">
                      {student.registerNumber}
                    </td>

                    {/* Current Task */}
                    <td className="py-3.5 px-4">
                      {stats.currentTaskNumber > 0 ? (
                        <div>
                          <span className="font-bold text-[#233DFF]">
                            Task #{stats.currentTaskNumber}
                          </span>
                          <p className="text-[10px] text-[#77766F] truncate max-w-[140px]">
                            {stats.currentTaskTitle}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[#9A9890] italic">Task 0 (None)</span>
                      )}
                    </td>

                    {/* Approved Progress */}
                    <td className="py-3.5 px-4">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span className="text-[#2D9B70] font-bold">
                            {stats.approvedPercentage || 0}%
                          </span>
                          <span className="text-[#77766F] text-[10px]">
                            {stats.approvedTasksCount || 0}/{stats.assignedTasksCount || 0}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E5DED2] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#233DFF] to-[#2D9B70] rounded-full transition-all duration-300"
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
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#D6CEC1] bg-[#F5F0E8]">
                          <AuthorizedImage
                            fileId={latestProofId}
                            alt="Proof thumbnail"
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => onImageZoom && onImageZoom(latestProofId)}
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#9A9890]">None</span>
                      )}
                    </td>

                    {/* Latest Submission Date */}
                    <td className="py-3.5 px-4 text-[11px] text-[#77766F]">
                      {stats.latestSubmission?.submittedAt
                        ? new Date(stats.latestSubmission.submittedAt).toLocaleDateString()
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewProfile(student._id)}
                          className="p-1.5 rounded-lg text-[#77766F] hover:text-[#233DFF] hover:bg-[#E5DED2] transition-colors"
                          title="View Profile & Submissions"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 rounded-lg text-[#77766F] hover:text-[#233DFF] hover:bg-[#E5DED2] transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onResetPassword(student)}
                          className="p-1.5 rounded-lg text-[#77766F] hover:text-[#D88918] hover:bg-[#FFF8EA] transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onToggleStatus(student)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            student.status === 'active'
                              ? 'text-[#77766F] hover:text-[#E86A5B] hover:bg-[#FFF0ED]'
                              : 'text-[#E86A5B] hover:text-[#2D9B70] hover:bg-[#E5DED2]'
                          }`}
                          title={
                            student.status === 'active' ? 'Deactivate Account' : 'Activate Account'
                          }
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteStudent && onDeleteStudent(student)}
                          className="p-1.5 rounded-lg text-[#77766F] hover:text-[#E86A5B] hover:bg-[#FFF0ED] transition-colors"
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
        <div className="flex items-center justify-between text-xs text-[#77766F] px-2">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} (Total{' '}
            {pagination.total} students)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-white border border-[#D6CEC1] hover:bg-[#E5DED2] disabled:opacity-40 transition-colors text-[#233DFF]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-[#233DFF]">{pagination.page}</span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-white border border-[#D6CEC1] hover:bg-[#E5DED2] disabled:opacity-40 transition-colors text-[#233DFF]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
