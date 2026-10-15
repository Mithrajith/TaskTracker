import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { AuthorizedImage } from '../../components/common/AuthorizedImage';
import { ImageModal } from '../../components/common/ImageModal';
import { ResetPasswordModal } from '../../components/admin/ResetPasswordModal';
import {
  Calendar,
  Clock,
  ArrowLeft,
  KeyRound,
  ExternalLink,
  MessageSquare,
  History,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Github } from '../../components/common/Icons';

export const StudentDetailPage = () => {
  const { id } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [zoomImageId, setZoomImageId] = useState(null);

  const fetchStudentProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/students/${id}`);
      if (res.data?.success) {
        setStudentData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch student details:', err);
      setError(err.response?.data?.message || 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D806B]" />
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="p-6 text-center text-[#E86A5B] bg-[#FFF0ED] border border-[#FAD3CC] rounded-2xl max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>{error || 'Student not found'}</p>
        <Link
          to="/admin/students"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#064E45] hover:bg-[#085f54] text-xs font-bold rounded-xl text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Students</span>
        </Link>
      </div>
    );
  }

  const { stats = {}, taskHistory = [] } = studentData;
  const labelClass = 'text-[10px] font-bold uppercase tracking-wider text-[#71817B]';

  return (
    <div className="space-y-6">
      {/* Top back navigation */}
      <div>
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#71817B] hover:text-[#064E45] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Students</span>
        </Link>
      </div>

      {/* Student Profile Card Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#064E45] flex items-center justify-center text-2xl font-black text-white shrink-0">
              {studentData.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-[#064E45]">{studentData.name}</h1>
                <Badge status={studentData.status} />
              </div>
              <p className="text-xs font-mono text-[#2D806B] mt-0.5 font-semibold">
                Register Number: {studentData.registerNumber}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-[#71817B] flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#2D806B]" />
                  Enrolled: {new Date(studentData.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#2D806B]" />
                  Last Active: {new Date(studentData.lastActivityAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {studentData.githubRepoUrl && (
              <a
                href={studentData.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-[#EAF7EF] text-[#064E45] border border-[#DDE8DF] transition-colors flex items-center gap-1.5"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFF8EA] hover:bg-[#FCE6BD]/60 text-[#D88918] border border-[#FCE6BD] transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Reset Password</span>
            </button>
          </div>
        </div>

        {/* Progress Metrics Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#DDE8DF]">
          <div className="p-3.5 rounded-xl bg-[#EAF7EF] border border-[#CDE5D6]">
            <span className={`${labelClass} block`}>Current Task</span>
            <span className="text-lg font-extrabold text-[#064E45]">
              Task #{stats.currentTaskNumber || 0}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#EAF7EF] border border-[#CDE5D6]">
            <span className={`${labelClass} block`}>Approved Completion</span>
            <span className="text-lg font-extrabold text-[#2D9B70]">
              {stats.approvedPercentage || 0}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF]">
            <span className={`${labelClass} block`}>Approved Tasks</span>
            <span className="text-lg font-extrabold text-[#064E45]">
              {stats.approvedTasksCount || 0} / {stats.assignedTasksCount || 0}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF]">
            <span className={`${labelClass} block`}>Current Task Status</span>
            <div className="mt-1">
              <Badge status={stats.currentTaskStatus} />
            </div>
          </div>
        </div>
      </Card>

      {/* Task & Complete Submission History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#2D806B]" />
          <h2 className="text-lg font-extrabold text-[#064E45]">
            Assigned Tasks &amp; Complete Submission History
          </h2>
        </div>

        {taskHistory.length === 0 ? (
          <Card>
            <p className="text-sm text-[#71817B] text-center py-8">
              No tasks have been assigned to this student yet.
            </p>
          </Card>
        ) : (
          taskHistory.map((st) => (
            <Card key={st._id}>
              {/* Task Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#DDE8DF]">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D806B] bg-[#EAF7EF] px-2.5 py-0.5 rounded-md border border-[#CDE5D6]">
                    Task #{st.task?.taskNumber}
                  </span>
                  <h3 className="text-base font-bold text-[#064E45]">{st.task?.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={st.status} />
                  <span className="text-xs text-[#71817B] font-medium">
                    Unlocked: {new Date(st.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Submissions for this task */}
              <div className="pt-4 space-y-4">
                <span className={`${labelClass} block`}>
                  Submission History ({st.submissions?.length || 0} versions)
                </span>

                {!st.submissions || st.submissions.length === 0 ? (
                  <p className="text-xs text-[#8C9B95] italic py-2">
                    No work has been submitted yet for this task.
                  </p>
                ) : (
                  st.submissions.map((sub) => (
                    <div
                      key={sub._id}
                      className="p-4 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF] space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2D806B]">
                            Version {sub.version}
                          </span>
                          <Badge status={sub.status} />
                        </div>
                        <span className="text-[11px] text-[#71817B]">
                          Submitted: {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Code Link & Explanation */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        <div className="md:col-span-2 space-y-2">
                          {sub.githubUrl && (
                            <a
                              href={sub.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-[#2D806B] hover:underline font-semibold"
                            >
                              <Github className="w-3.5 h-3.5" />
                              <span className="truncate max-w-sm">{sub.githubUrl}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {sub.explanation && (
                            <div>
                              <span className={`${labelClass} block mb-0.5`}>
                                Student Explanation
                              </span>
                              <p className="text-xs text-[#172E2A] leading-relaxed bg-white p-2.5 rounded-lg border border-[#DDE8DF]">
                                {sub.explanation}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Proof Image Preview */}
                        <div>
                          <span className={`${labelClass} block mb-1`}>Proof Screenshot</span>
                          <div className="w-full h-24 rounded-lg overflow-hidden border border-[#DDE8DF] bg-white flex items-center justify-center">
                            <AuthorizedImage
                              fileId={sub.fileId}
                              alt={`Proof v${sub.version}`}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setZoomImageId(sub.fileId)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mentor Feedback & Review decision history */}
                      {sub.reviews && sub.reviews.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#DDE8DF] space-y-1.5">
                          {sub.reviews.map((rev) => (
                            <div
                              key={rev._id}
                              className="p-2.5 rounded-lg bg-white border border-[#DDE8DF] text-xs flex items-start gap-2"
                            >
                              <MessageSquare className="w-4 h-4 text-[#2D806B] shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-[11px] mb-0.5">
                                  <span className="font-bold text-[#064E45]">
                                    Mentor: {rev.reviewer?.name} ({rev.decision})
                                  </span>
                                  <span className="text-[#71817B]">
                                    {new Date(rev.reviewedAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-[#172E2A] italic">"{rev.feedback}"</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <ResetPasswordModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          student={studentData}
          onReset={fetchStudentProfile}
        />
      )}

      {/* Image Zoom Modal */}
      <ImageModal
        isOpen={!!zoomImageId}
        onClose={() => setZoomImageId(null)}
        imgSrc={zoomImageId ? `/api/v1/files/${zoomImageId}` : null}
      />
    </div>
  );
};
