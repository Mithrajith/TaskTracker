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
  UserCheck,
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
        <Loader2 className="w-8 h-8 animate-spin text-[#2D806B]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-[#E86A5B] bg-[#FFF0ED] border border-[#FAD3CC] rounded-2xl">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p>{error || 'Unable to load dashboard'}</p>
        <button
          onClick={fetchOverview}
          className="mt-4 px-4 py-2 bg-[#064E45] hover:bg-[#085f54] text-xs font-bold rounded-xl text-white"
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
      tone: 'bg-[#EAF7EF] text-[#2D806B] border-[#CDE5D6]',
      link: '/admin/students',
    },
    {
      title: 'Active Students',
      value: data.activeStudents,
      sub: 'Currently enrolled',
      icon: UserCheck,
      tone: 'bg-[#EAF7EF] text-[#2D9B70] border-[#CDE5D6]',
      link: '/admin/students',
    },
    {
      title: 'Pending Reviews',
      value: data.submissionsAwaitingReview,
      sub: 'Submissions awaiting evaluation',
      icon: FileCheck2,
      tone: 'bg-[#FFF8EA] text-[#D88918] border-[#FCE6BD]',
      link: '/admin/reviews',
    },
    {
      title: 'Approved Today',
      value: data.tasksApprovedToday,
      sub: 'Verified submissions today',
      icon: Award,
      tone: 'bg-[#EAF7EF] text-[#2D9B70] border-[#CDE5D6]',
    },
    {
      title: 'Tasks Published',
      value: data.tasksPublished,
      sub: 'Dynamic daily tasks',
      icon: CheckSquare,
      tone: 'bg-[#EAF7EF] text-[#2D806B] border-[#CDE5D6]',
      link: '/admin/tasks',
    },
    {
      title: 'Overdue Tasks',
      value: data.overdueCount,
      sub: 'Passed deadline',
      icon: Clock,
      tone: 'bg-[#FFF0ED] text-[#E86A5B] border-[#FAD3CC]',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#064E45] flex items-center gap-2">
            <span>Mentor Control Center</span>
            <Sparkles className="w-5 h-5 text-[#2D806B]" />
          </h1>
          <p className="text-sm text-[#71817B] mt-1">
            Real-time monitoring of AI Engineer roadmap student submissions and daily assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/tasks"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-[#064E45] hover:bg-[#085f54] text-white transition-all"
          >
            + Create New Task
          </Link>
          <Link
            to="/admin/reviews"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-white hover:bg-[#EAF7EF] text-[#064E45] border border-[#DDE8DF] transition-all flex items-center gap-1.5"
          >
            <span>Review Queue</span>
            {data.submissionsAwaitingReview > 0 && (
              <span className="min-w-5 h-5 px-1 rounded-full bg-[#064E45] text-white font-bold text-[10px] flex items-center justify-center">
                {data.submissionsAwaitingReview}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const CardContent = (
            <div className="p-5 rounded-2xl bg-white border border-[#DDE8DF] h-full flex flex-col justify-between hover:border-[#CDE5D6] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#71817B]">
                  {card.title}
                </span>
                <span className={`w-8 h-8 rounded-xl border flex items-center justify-center ${card.tone}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-[#064E45]">{card.value}</div>
                <div className="text-[11px] text-[#71817B] mt-0.5">{card.sub}</div>
              </div>
            </div>
          );

          return card.link ? (
            <Link key={idx} to={card.link} className="hover:-translate-y-0.5 transition-transform">
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
              className="text-xs font-bold text-[#2D806B] hover:text-[#064E45] flex items-center gap-1"
            >
              <span>View Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {data.recentlySubmitted.length === 0 ? (
            <p className="text-sm text-[#71817B] text-center py-8">
              No recent student submissions.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentlySubmitted.map((sub) => (
                <div
                  key={sub._id}
                  className="p-3.5 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF] flex items-center justify-between gap-3 hover:border-[#CDE5D6] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#064E45]">
                        {sub.student?.name}
                      </span>
                      <span className="text-[10px] text-[#71817B] font-mono">
                        ({sub.student?.registerNumber})
                      </span>
                      <Badge status={sub.status} />
                    </div>
                    <p className="text-xs text-[#2D806B] truncate mt-0.5 font-medium">
                      Task #{sub.task?.taskNumber}: {sub.task?.title} (v{sub.version})
                    </p>
                    <span className="text-[10px] text-[#71817B] block mt-0.5">
                      Submitted{' '}
                      {new Date(sub.submittedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#064E45] hover:bg-[#085f54] text-white transition-all shrink-0"
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
          subtitle="Overdue tasks, requested corrections, or inactive for > 3 days"
          action={
            <Link
              to="/admin/students"
              className="text-xs font-bold text-[#2D806B] hover:text-[#064E45] flex items-center gap-1"
            >
              <span>All Students</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {data.fallingBehindStudents.length === 0 ? (
            <div className="py-8 text-center text-[#71817B]">
              <div className="w-10 h-10 rounded-full bg-[#EAF7EF] border border-[#CDE5D6] flex items-center justify-center mx-auto mb-2 text-[#2D9B70] font-bold">
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
                  className="p-3.5 rounded-xl bg-[#FFF0ED]/50 border border-[#FAD3CC] flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#064E45]">
                        {item.student?.name}
                      </span>
                      <span className="text-[10px] text-[#71817B] font-mono">
                        {item.student?.registerNumber}
                      </span>
                    </div>
                    <p className="text-xs text-[#172E2A] mt-0.5">
                      Stuck on Task #{item.currentTaskNumber}
                    </p>
                    <span className="text-[10px] text-[#E86A5B] font-semibold inline-block mt-0.5">
                      Reason: {item.reason}
                    </span>
                  </div>

                  <Link
                    to={`/admin/students/${item.student?._id}`}
                    className="p-2 rounded-lg text-[#71817B] hover:text-[#064E45] hover:bg-white transition-colors"
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
