import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { AuthorizedImage } from '../../components/common/AuthorizedImage';
import { ImageModal } from '../../components/common/ImageModal';
import { ResetPasswordModal } from '../../components/admin/ResetPasswordModal';
import {
  User,
  Hash,
  Calendar,
  Clock,
  ArrowLeft,
  KeyRound,
  ExternalLink,
  MessageSquare,
  History,
  Loader2,
  AlertCircle,
  FileCheck2,
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
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="p-6 text-center text-rose-400 bg-rose-950/20 border border-rose-800/40 rounded-2xl max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>{error || 'Student not found'}</p>
        <Link
          to="/admin/students"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-xl text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Students</span>
        </Link>
      </div>
    );
  }

  const { stats = {}, taskHistory = [] } = studentData;

  return (
    <div className="space-y-6">
      {/* Top back navigation */}
      <div>
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Students</span>
        </Link>
      </div>

      {/* Student Profile Card Header */}
      <Card className="border-purple-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-purple-900/40">
              {studentData.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white">
                  {studentData.name}
                </h1>
                <Badge status={studentData.status} />
              </div>
              <p className="text-xs font-mono text-purple-400 mt-0.5">
                Register Number: {studentData.registerNumber}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Enrolled: {new Date(studentData.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
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
                className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/60 transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Reset Password</span>
            </button>
          </div>
        </div>

        {/* Progress Metrics Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Current Task
            </span>
            <span className="text-lg font-extrabold text-purple-400">
              Task #{stats.currentTaskNumber || 0}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Approved Completion
            </span>
            <span className="text-lg font-extrabold text-emerald-400">
              {stats.approvedPercentage || 0}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Approved Tasks
            </span>
            <span className="text-lg font-extrabold text-white">
              {stats.approvedTasksCount || 0} / {stats.assignedTasksCount || 0}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Current Task Status
            </span>
            <div className="mt-1">
              <Badge status={stats.currentTaskStatus} />
            </div>
          </div>
        </div>
      </Card>

      {/* Task & Complete Submission History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">
            Assigned Tasks & Complete Submission History
          </h2>
        </div>

        {taskHistory.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500 text-center py-8">
              No tasks have been assigned to this student yet.
            </p>
          </Card>
        ) : (
          taskHistory.map((st) => (
            <Card key={st._id} className="border-slate-800">
              {/* Task Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded-md border border-purple-800/40">
                    Task #{st.task?.taskNumber}
                  </span>
                  <h3 className="text-base font-semibold text-slate-100">
                    {st.task?.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={st.status} />
                  <span className="text-xs text-slate-500">
                    Unlocked: {new Date(st.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Submissions for this task */}
              <div className="pt-4 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Submission History ({st.submissions?.length || 0} versions)
                </span>

                {(!st.submissions || st.submissions.length === 0) ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No work has been submitted yet for this task.
                  </p>
                ) : (
                  st.submissions.map((sub) => (
                    <div
                      key={sub._id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-300">
                            Version {sub.version}
                          </span>
                          <Badge status={sub.status} />
                        </div>
                        <span className="text-[11px] text-slate-500">
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
                              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 hover:underline"
                            >
                              <Github className="w-3.5 h-3.5" />
                              <span className="truncate max-w-sm">{sub.githubUrl}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {sub.explanation && (
                            <div>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                                Student Explanation
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                                {sub.explanation}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Proof Image Preview */}
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                            Proof Screenshot
                          </span>
                          <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
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
                        <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1.5">
                          {sub.reviews.map((rev) => (
                            <div
                              key={rev._id}
                              className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs flex items-start gap-2"
                            >
                              <MessageSquare className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-[11px] mb-0.5">
                                  <span className="font-semibold text-slate-200">
                                    Mentor: {rev.reviewer?.name} ({rev.decision})
                                  </span>
                                  <span className="text-slate-500">
                                    {new Date(rev.reviewedAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-slate-300 italic">
                                  "{rev.feedback}"
                                </p>
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
