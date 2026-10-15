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
      <div className="overflow-x-auto rounded-2xl border border-[#DDE8DF] bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#DDE8DF] bg-[#FAF8F0] text-[11px] font-bold uppercase tracking-wider text-[#71817B]">
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
          <tbody className="divide-y divide-[#EBF2EC] text-xs text-[#172E2A]">
            {students.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-[#71817B]">
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
                    className="hover:bg-[#F4FAF6] transition-colors group"
                  >
                    {/* Student Name & GitHub link */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#064E45] flex items-center gap-2">
                        <span>{student.name}</span>
                        {student.githubRepoUrl && (
                          <a
                            href={student.githubRepoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#A3B2AC] hover:text-[#2D806B] transition-colors"
                            title="GitHub Profile / Repo"
                          >
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <span className="text-[10px] text-[#71817B]">
                        Status: {student.status}
                      </span>
                    </td>

                    {/* Register Number */}
                    <td className="py-3.5 px-4 font-mono font-medium text-[#172E2A]">
                      {student.registerNumber}
                    </td>

                    {/* Current Task */}
                    <td className="py-3.5 px-4">
                      {stats.currentTaskNumber > 0 ? (
                        <div>
                          <span className="font-bold text-[#2D806B]">
                            Task #{stats.currentTaskNumber}
                          </span>
                          <p className="text-[10px] text-[#71817B] truncate max-w-[140px]">
                            {stats.currentTaskTitle}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[#A3B2AC] italic">Task 0 (None)</span>
                      )}
                    </td>

                    {/* Approved Progress */}
                    <td className="py-3.5 px-4">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span className="text-[#2D9B70] font-bold">
                            {stats.approvedPercentage || 0}%
                          </span>
                          <span className="text-[#71817B] text-[10px]">
                            {stats.approvedTasksCount || 0}/{stats.assignedTasksCount || 0}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#EBF2EC] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#2D806B] to-[#2D9B70] rounded-full transition-all duration-300"
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
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#DDE8DF] bg-[#FAF8F0]">
                          <AuthorizedImage
                            fileId={latestProofId}
                            alt="Proof thumbnail"
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => onImageZoom && onImageZoom(latestProofId)}
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#A3B2AC]">None</span>
                      )}
                    </td>

                    {/* Latest Submission Date */}
                    <td className="py-3.5 px-4 text-[11px] text-[#71817B]">
                      {stats.latestSubmission?.submittedAt
                        ? new Date(stats.latestSubmission.submittedAt).toLocaleDateString()
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewProfile(student._id)}
                          className="p-1.5 rounded-lg text-[#71817B] hover:text-[#2D806B] hover:bg-[#EAF7EF] transition-colors"
                          title="View Profile & Submissions"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 rounded-lg text-[#71817B] hover:text-[#2D806B] hover:bg-[#EAF7EF] transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onResetPassword(student)}
                          className="p-1.5 rounded-lg text-[#71817B] hover:text-[#D88918] hover:bg-[#FFF8EA] transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onToggleStatus(student)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            student.status === 'active'
                              ? 'text-[#71817B] hover:text-[#E86A5B] hover:bg-[#FFF0ED]'
                              : 'text-[#E86A5B] hover:text-[#2D9B70] hover:bg-[#EAF7EF]'
                          }`}
                          title={
                            student.status === 'active' ? 'Deactivate Account' : 'Activate Account'
                          }
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteStudent && onDeleteStudent(student)}
                          className="p-1.5 rounded-lg text-[#71817B] hover:text-[#E86A5B] hover:bg-[#FFF0ED] transition-colors"
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
        <div className="flex items-center justify-between text-xs text-[#71817B] px-2">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} (Total{' '}
            {pagination.total} students)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-white border border-[#DDE8DF] hover:bg-[#EAF7EF] disabled:opacity-40 transition-colors text-[#064E45]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-[#064E45]">{pagination.page}</span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-white border border-[#DDE8DF] hover:bg-[#EAF7EF] disabled:opacity-40 transition-colors text-[#064E45]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
