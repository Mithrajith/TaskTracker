import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { TaskCard } from '../../components/student/TaskCard';
import { LockedTaskCard } from '../../components/student/LockedTaskCard';
import { ImageModal } from '../../components/common/ImageModal';
import {
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
  Lock,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Github } from '../../components/common/Icons';

export const StudentDashboard = () => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [assignedTasks, setAssignedTasks] = useState([]);
  const [lockedTasks, setLockedTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modal zoom
  const [zoomImageId, setZoomImageId] = useState(null);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/student-tasks');
      if (res.data?.success) {
        setAssignedTasks(res.data.data.assignedTasks || []);
        setLockedTasks(res.data.data.lockedTasks || []);
        setStats(res.data.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
      error('Failed to load your assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleToggleCheckbox = async (studentTaskId, isStudentCompleted) => {
    try {
      const res = await apiClient.patch(
        `/student-tasks/${studentTaskId}/toggle-checkbox`,
        { isStudentCompleted }
      );
      if (res.data?.success) {
        success(res.data.message);
        fetchStudentData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update checklist');
    }
  };

  const handleSubmitWork = async ({
    studentTaskId,
    githubUrl,
    explanation,
    preserveLossless,
    file,
  }) => {
    setSubmitting(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('studentTaskId', studentTaskId);
      if (githubUrl) formData.append('githubUrl', githubUrl);
      if (explanation) formData.append('explanation', explanation);
      if (preserveLossless) formData.append('preserveLossless', String(preserveLossless));
      formData.append('proofImage', file);

      const res = await apiClient.post('/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (res.data?.success) {
        success(res.data.message);
        fetchStudentData();
        refreshUser();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Submission failed';
      error(msg);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  // Find the active task (the latest assigned task that is not approved, or latest task)
  const currentTask = assignedTasks.length > 0 ? assignedTasks[assignedTasks.length - 1] : null;
  const previousApprovedTasks = assignedTasks.filter((t) => t.status === 'approved' && t._id !== currentTask?._id);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/50 border border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/50 border border-purple-700/50 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Engineer In-Training</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name}!
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Register No: <span className="font-mono text-purple-400 font-medium">{user?.registerNumber}</span>
              {user?.githubRepoUrl && (
                <span className="ml-3 inline-flex items-center gap-1 text-slate-400 hover:text-purple-300">
                  • <Github className="w-3 h-3 ml-1" />
                  <a href={user.githubRepoUrl} target="_blank" rel="noreferrer" className="underline">
                    Repository
                  </a>
                </span>
              )}
            </p>
          </div>

          {/* Quick status pill */}
          <div className="flex items-center gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-300 font-bold text-lg">
              {stats?.currentTaskNumber > 0 ? `#${stats.currentTaskNumber}` : '0'}
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Current Level
              </span>
              <span className="text-sm font-bold text-white">
                {stats?.currentTaskNumber > 0 ? `Task ${stats.currentTaskNumber}` : 'Task 0 (Started)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs uppercase font-semibold text-slate-400 flex items-center justify-between">
            <span>Approved Progress</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400">
              {stats?.approvedPercentage || 0}%
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${stats?.approvedPercentage || 0}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs uppercase font-semibold text-slate-400 flex items-center justify-between">
            <span>Total Approved</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </span>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {stats?.approvedTasksCount || 0}
            </div>
            <span className="text-[11px] text-slate-400">
              of {stats?.assignedTasksCount || 0} assigned
            </span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs uppercase font-semibold text-slate-400 flex items-center justify-between">
            <span>Awaiting Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </span>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400">
              {stats?.awaitingReviewCount || 0}
            </div>
            <span className="text-[11px] text-slate-400">
              submissions in queue
            </span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs uppercase font-semibold text-slate-400 flex items-center justify-between">
            <span>Roadmap Stage</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </span>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-100">
              {stats?.currentTaskStatus ? (
                <Badge status={stats.currentTaskStatus} />
              ) : (
                'Enrolled'
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block truncate">
              {stats?.currentTaskTitle || 'Awaiting task'}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Section: Current Active Task */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span>Current Practical Task</span>
          </h2>
          {currentTask && (
            <span className="text-xs text-slate-400">
              Task #{currentTask.task?.taskNumber} of Roadmap
            </span>
          )}
        </div>

        {currentTask ? (
          <TaskCard
            studentTask={currentTask}
            onSubmitWork={handleSubmitWork}
            onToggleCheckbox={handleToggleCheckbox}
            onImageClick={(fileId) => setZoomImageId(fileId)}
            submitting={submitting}
            uploadProgress={uploadProgress}
          />
        ) : (
          <Card className="text-center py-12 border-dashed border-slate-800">
            <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200">
              You're at Task 0: Ready for Your First Assignment!
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Your mentor will publish Task #1 soon. Once published, your practical assignment will appear right here.
            </p>
          </Card>
        )}
      </div>

      {/* Upcoming Locked Tasks Section */}
      {lockedTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-400" />
              <span>Upcoming Locked Tasks in Roadmap</span>
            </h2>
            <span className="text-xs text-slate-500">
              {lockedTasks.length} locked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedTasks.map((lt) => (
              <LockedTaskCard key={lt._id} lockedTask={lt} />
            ))}
          </div>
        </div>
      )}

      {/* Previous Completed Tasks Highlights */}
      {previousApprovedTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Previously Completed & Approved Tasks ({previousApprovedTasks.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {previousApprovedTasks.map((t) => (
              <div
                key={t._id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-950 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-emerald-400">
                    Task #{t.task?.taskNumber}
                  </span>
                  <p className="text-xs font-medium text-slate-200 truncate max-w-xs">
                    {t.task?.title}
                  </p>
                </div>
                <Badge status="approved" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal for Proof Inspection */}
      <ImageModal
        isOpen={!!zoomImageId}
        onClose={() => setZoomImageId(null)}
        imgSrc={
          zoomImageId
            ? zoomImageId.startsWith('blob:') || zoomImageId.startsWith('data:') || zoomImageId.startsWith('http')
              ? zoomImageId
              : `/api/v1/files/${zoomImageId}`
            : null
        }
      />
    </div>
  );
};
