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
  ExternalLink,
  UploadCloud,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { Github } from '../../components/common/Icons';

const CircularProgress = ({ percentage = 0, size = 148, stroke = 14 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#DDE8DF"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2D9B70"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-[#064E45]">{clamped}%</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#71817B]">
          Complete
        </span>
      </div>
    </div>
  );
};

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
        <Loader2 className="w-8 h-8 animate-spin text-[#2D806B]" />
      </div>
    );
  }

  // Find the active task (the latest assigned task that is not approved, or latest task)
  const currentTask = assignedTasks.length > 0 ? assignedTasks[assignedTasks.length - 1] : null;
  const previousApprovedTasks = assignedTasks.filter(
    (t) => t.status === 'approved' && t._id !== currentTask?._id
  );

  const totalTasks = stats?.assignedTasksCount || assignedTasks.length;
  const approvedCount = stats?.approvedTasksCount || 0;
  const inProgressCount = assignedTasks.filter((t) =>
    ['assigned', 'in_progress', 'changes_requested'].includes(t.status)
  ).length;
  const pendingReviewCount = stats?.awaitingReviewCount || 0;
  const lockedCount = lockedTasks.length;
  const approvedPercentage = stats?.approvedPercentage || 0;

  // Build recent activity feed from real submission review data
  const activity = [];
  assignedTasks.forEach((st) => {
    (st.submissions || []).forEach((sub) => {
      activity.push({
        id: `${sub._id}-submitted`,
        type: 'submitted',
        date: sub.submittedAt,
        title: `Submitted Task #${st.task?.taskNumber} (v${sub.version})`,
        detail: 'Awaiting mentor evaluation',
      });
      (sub.reviews || []).forEach((rev) => {
        activity.push({
          id: `${rev._id}-review`,
          type: rev.decision === 'approved' ? 'approved' : 'changes',
          date: rev.reviewedAt,
          title:
            rev.decision === 'approved'
              ? `Task #${st.task?.taskNumber} approved`
              : `Changes requested on Task #${st.task?.taskNumber}`,
          detail: rev.feedback,
        });
      });
    });
  });
  activity.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentActivity = activity.slice(0, 5);

  const statCards = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: BookOpen,
      tone: 'bg-[#EAF7EF] text-[#2D806B] border-[#CDE5D6]',
    },
    {
      label: 'Approved Tasks',
      value: approvedCount,
      icon: CheckCircle2,
      tone: 'bg-[#EAF7EF] text-[#2D9B70] border-[#CDE5D6]',
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      icon: TrendingUp,
      tone: 'bg-[#EAF7EF] text-[#2D806B] border-[#CDE5D6]',
    },
    {
      label: 'Pending Review',
      value: pendingReviewCount,
      icon: Clock,
      tone: 'bg-[#FFF8EA] text-[#D88918] border-[#FCE6BD]',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-[#EAF7EF] border border-[#D1E8D9] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-[#E0F3E8] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#CDE5D6] text-[#2D806B] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#2D806B]" />
              <span>AI Engineer In-Training</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064E45] tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Engineer'}!
            </h1>
            <p className="text-sm text-[#71817B] mt-1.5 max-w-xl">
              Stay consistent — every approved task brings you one step closer to your goal.
              Let's get today's work done.
            </p>
            <p className="text-xs text-[#71817B] mt-3">
              Register No:{' '}
              <span className="font-mono font-semibold text-[#2D806B]">
                {user?.registerNumber}
              </span>
              {user?.githubRepoUrl && (
                <a
                  href={user.githubRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-3 inline-flex items-center gap-1 text-[#2D806B] hover:underline font-semibold"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Repository</span>
                </a>
              )}
            </p>
          </div>

          {/* Current task summary card */}
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-[#DDE8DF] shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[#064E45] flex items-center justify-center text-white font-black text-lg">
              {stats?.currentTaskNumber > 0 ? `#${stats.currentTaskNumber}` : '0'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#71817B] block">
                Current Task
              </span>
              <span className="text-sm font-bold text-[#064E45] block truncate max-w-[190px]">
                {stats?.currentTaskTitle ||
                  (stats?.currentTaskNumber > 0
                    ? `Task ${stats.currentTaskNumber}`
                    : 'Task 0 (Getting Started)')}
              </span>
              {stats?.currentTaskStatus && (
                <span className="mt-1 inline-block">
                  <Badge status={stats.currentTaskStatus} />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-4" variant="white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#71817B]">
                  {card.label}
                </span>
                <span
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center ${card.tone}`}
                >
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-[#064E45]">{card.value}</div>
            </Card>
          );
        })}
      </div>

      {/* Main grid: Current task + Progress overview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4" id="current-task">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#064E45] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#2D806B]" />
              <span>Current Practical Task</span>
            </h2>
            {currentTask && (
              <span className="text-xs font-semibold text-[#71817B]">
                Task #{currentTask.task?.taskNumber} of roadmap
              </span>
            )}
          </div>

          {currentTask ? (
            <TaskCard
              studentTask={currentTask}
              onSubmitWork={handleSubmitWork}
              onImageClick={(fileId) => setZoomImageId(fileId)}
              submitting={submitting}
              uploadProgress={uploadProgress}
            />
          ) : (
            <Card className="text-center py-12 border-dashed border-[#CDE5D6] bg-[#EAF7EF]/50">
              <Sparkles className="w-10 h-10 text-[#2D806B] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#064E45]">
                You're at Task 0: Ready for Your First Assignment!
              </h3>
              <p className="text-xs text-[#71817B] mt-1 max-w-md mx-auto">
                Your mentor will publish Task #1 soon. Once published, your practical assignment
                will appear right here.
              </p>
            </Card>
          )}
        </div>

        {/* Progress Overview */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-[#064E45] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#2D806B]" />
            <span>Progress Overview</span>
          </h2>

          <Card variant="mint" className="flex flex-col items-center gap-5 py-7">
            <CircularProgress percentage={approvedPercentage} />
            <div className="w-full space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-[#2D9B70]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2D9B70]" />
                  Approved
                </span>
                <span className="text-[#064E45]">{approvedCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-[#2D806B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#064E45]" />
                  In Progress
                </span>
                <span className="text-[#064E45]">{inProgressCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-[#71817B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A3B2AC]" />
                  Locked
                </span>
                <span className="text-[#064E45]">{lockedCount}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#064E45] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#2D806B]" />
          <span>Recent Activity</span>
        </h2>

        <Card variant="white">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-[#71817B] text-center py-8">
              No activity yet. Submit your first task proof to see updates here.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => {
                const config =
                  item.type === 'approved'
                    ? { icon: CheckCircle2, tone: 'bg-[#EAF7EF] text-[#2D9B70] border-[#CDE5D6]' }
                    : item.type === 'changes'
                    ? { icon: MessageSquare, tone: 'bg-[#FFF0ED] text-[#E86A5B] border-[#FAD3CC]' }
                    : { icon: UploadCloud, tone: 'bg-[#EAF7EF] text-[#2D806B] border-[#CDE5D6]' };
                const Icon = config.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF]"
                  >
                    <span
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${config.tone}`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#064E45]">{item.title}</p>
                      {item.detail && (
                        <p className="text-[11px] text-[#71817B] line-clamp-2 mt-0.5">
                          {item.detail}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-[#71817B] whitespace-nowrap shrink-0">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming Locked Tasks Section */}
      {lockedTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#064E45] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#71817B]" />
              <span>Upcoming Locked Tasks</span>
            </h2>
            <span className="text-xs font-semibold text-[#71817B]">
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
        <div className="space-y-3 pt-4 border-t border-[#DDE8DF]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#71817B]">
            Previously Completed &amp; Approved Tasks ({previousApprovedTasks.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {previousApprovedTasks.map((t) => (
              <div
                key={t._id}
                className="p-3.5 rounded-xl bg-[#EAF7EF] border border-[#CDE5D6] flex items-center justify-between"
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#2D9B70]">
                    Task #{t.task?.taskNumber}
                  </span>
                  <p className="text-xs font-semibold text-[#064E45] truncate max-w-xs">
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
        fileId={
          zoomImageId && !/^(blob:|data:|https?:)/.test(zoomImageId) ? zoomImageId : undefined
        }
        imgSrc={
          zoomImageId && /^(blob:|data:|https?:)/.test(zoomImageId) ? zoomImageId : undefined
        }
      />
    </div>
  );
};
