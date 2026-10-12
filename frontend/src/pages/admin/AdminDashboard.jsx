import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ImageModal } from '../../components/common/ImageModal';
import { ReviewSubmissionModal } from '../../components/admin/ReviewSubmissionModal';
import {
  Users,
  CheckSquare,
  FileCheck2,
  Clock,
  AlertTriangle,
  Award,
  ArrowRight,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [zoomImageId, setZoomImageId] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/analytics/overview');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setError('Failed to fetch dashboard metrics. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-rose-400 bg-rose-950/20 border border-rose-800/40 rounded-2xl">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p>{error || 'Unable to load dashboard'}</p>
        <button
          onClick={fetchOverview}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-xl text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: data.totalStudents,
      sub: `${data.activeStudents} active accounts`,
      icon: Users,
      color: 'from-blue-600/20 to-blue-500/5 text-blue-400 border-blue-500/20',
      link: '/admin/students',
    },
    {
      title: 'Published Tasks',
      value: data.tasksPublished,
      sub: 'Dynamic daily tasks',
      icon: CheckSquare,
      color: 'from-purple-600/20 to-purple-500/5 text-purple-400 border-purple-500/20',
      link: '/admin/tasks',
    },
    {
      title: 'Pending Reviews',
      value: data.submissionsAwaitingReview,
      sub: 'Submissions awaiting evaluation',
      icon: FileCheck2,
      color: 'from-amber-600/20 to-amber-500/5 text-amber-400 border-amber-500/20',
      link: '/admin/reviews',
    },
    {
      title: 'Approved Today',
      value: data.tasksApprovedToday,
      sub: 'Verified submissions today',
      icon: Award,
      color: 'from-emerald-600/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Overdue Tasks',
      value: data.overdueCount,
      sub: 'Passed deadline without completion',
      icon: Clock,
      color: 'from-rose-600/20 to-rose-500/5 text-rose-400 border-rose-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Mentor Control Center</span>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time monitoring of AI Engineer roadmap student submissions and daily assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/tasks"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 transition-all"
          >
            + Create New Task
          </Link>
          <Link
            to="/admin/reviews"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <span>Review Queue</span>
            {data.submissionsAwaitingReview > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center">
                {data.submissionsAwaitingReview}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const CardContent = (
            <div
              className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} border shadow-lg backdrop-blur-md h-full flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <Icon className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white">{card.value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{card.sub}</div>
              </div>
            </div>
          );

          return card.link ? (
            <Link key={idx} to={card.link} className="hover:scale-[1.02] transition-transform">
              {CardContent}
            </Link>
          ) : (
            <div key={idx}>{CardContent}</div>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Submissions & Falling Behind Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Submitted Work */}
        <Card
          title="Recently Submitted Work"
          subtitle="Latest submissions awaiting mentor evaluation"
          action={
            <Link
              to="/admin/reviews"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
            >
              <span>View Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {data.recentlySubmitted.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No recent student submissions.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentlySubmitted.map((sub) => (
                <div
                  key={sub._id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700/80 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">
                        {sub.student?.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({sub.student?.registerNumber})
                      </span>
                      <Badge status={sub.status} />
                    </div>
                    <p className="text-xs text-purple-400 truncate mt-0.5">
                      Task #{sub.task?.taskNumber}: {sub.task?.title} (v{sub.version})
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Submitted {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white transition-all shrink-0"
                  >
                    Evaluate
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Students Falling Behind */}
        <Card
          title="Students Requiring Attention"
          subtitle="Active students with overdue tasks, requested corrections, or inactive for &gt; 3 days"
          action={
            <Link
              to="/admin/students"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
            >
              <span>All Students</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {data.fallingBehindStudents.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center mx-auto mb-2 text-emerald-400">
                ✓
              </div>
              <p className="text-xs">
                All active students are on track with their practical assignments!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.fallingBehindStudents.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-rose-950/50 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">
                        {item.student?.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.student?.registerNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Stuck on Task #{item.currentTaskNumber}
                    </p>
                    <span className="text-[10px] text-rose-400 font-medium inline-block mt-0.5">
                      Reason: {item.reason}
                    </span>
                  </div>

                  <Link
                    to={`/admin/students/${item.student?._id}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-slate-800 transition-colors"
                    title="View Profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <ReviewSubmissionModal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          submission={selectedSubmission}
          onReviewed={fetchOverview}
          onImageZoom={(id) => setZoomImageId(id)}
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

