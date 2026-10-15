import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { AuthorizedImage } from '../../components/common/AuthorizedImage';
import { ReviewSubmissionModal } from '../../components/admin/ReviewSubmissionModal';
import { ImageModal } from '../../components/common/ImageModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { FileCheck2, Clock, ExternalLink, Loader2, RefreshCw, CheckCircle2, AlertTriangle, CheckCheck, XCircle } from 'lucide-react';
import { Github } from '../../components/common/Icons';

export const ReviewsPage = () => {
  const { error, success } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  // Modal states
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [zoomImageId, setZoomImageId] = useState(null);
  const [bulkAction, setBulkAction] = useState(null); // 'approve' | 'reject' | null
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchPendingReviews = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/reviews/pending');
      if (res.data?.success) {
        setSubmissions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch pending reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReview = async () => {
    if (!bulkAction) return;
    const submissionIds = submissions.map((s) => s._id);
    setBulkLoading(true);
    try {
      const res = await apiClient.post(`/reviews/bulk/${bulkAction}`, { submissionIds });
      if (res.data?.success) {
        success(res.data.message || 'Bulk review completed');
        setBulkAction(null);
        await fetchPendingReviews();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Bulk review failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkCount = submissions.length;
  const hasPending = activeTab === 'pending' && !loading && bulkCount > 0;

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const tabs = [
    { key: 'pending', label: 'Pending', icon: Clock, count: submissions.length },
    { key: 'approved', label: 'Approved', icon: CheckCircle2 },
    { key: 'changes', label: 'Changes Requested', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#064E45] flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[#2D806B]" />
            <span>Submission Review Queue</span>
          </h1>
          <p className="text-sm text-[#71817B] mt-1">
            Review student practical submissions, verify proof images, and approve task completions
            to unlock subsequent roadmap stages.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {hasPending && (
            <>
              <button
                onClick={() => setBulkAction('approve')}
                disabled={bulkLoading}
                className="px-3.5 py-2 rounded-xl bg-[#2D9B70] hover:bg-[#268a63] text-white font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Accept all ({bulkCount})</span>
              </button>
              <button
                onClick={() => setBulkAction('reject')}
                disabled={bulkLoading}
                className="px-3.5 py-2 rounded-xl bg-[#E86A5B] hover:bg-[#d45849] text-white font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Decline all</span>
              </button>
            </>
          )}
          <button
            onClick={fetchPendingReviews}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#EAF7EF] text-[#064E45] font-bold text-xs border border-[#DDE8DF] transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#2D806B]" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#DDE8DF] w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#064E45] text-white'
                  : 'text-[#71817B] hover:text-[#064E45] hover:bg-[#EAF7EF]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    isActive ? 'bg-white/70 text-[#172E2A]' : 'bg-[#EAF7EF] text-[#2D806B]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Queue Content */}
      {activeTab !== 'pending' ? (
        <Card className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-[#EAF7EF] border border-[#CDE5D6] flex items-center justify-center mx-auto mb-3 text-[#2D806B]">
            {activeTab === 'approved' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-base font-bold text-[#064E45]">
            {activeTab === 'approved' ? 'Approved Submissions' : 'Changes Requested'}
          </h3>
          <p className="text-xs text-[#71817B] mt-1 max-w-sm mx-auto">
            This view lists {activeTab === 'approved' ? 'approved' : 'correction-requested'}{' '}
            submissions. Process items in the Pending queue — decisions appear here once recorded.
          </p>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D806B]" />
        </div>
      ) : submissions.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-[#EAF7EF] border border-[#CDE5D6] flex items-center justify-center mx-auto mb-3 text-[#2D9B70] font-bold">
            ✓
          </div>
          <h3 className="text-base font-bold text-[#064E45]">All Caught Up!</h3>
          <p className="text-xs text-[#71817B] mt-1 max-w-sm mx-auto">
            There are no student submissions pending evaluation at the moment.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((sub) => (
            <Card
              key={sub._id}
              className="bg-white hover:border-[#CDE5D6] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#DDE8DF]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#064E45]">{sub.student?.name}</span>
                      <span className="text-[10px] text-[#71817B] font-mono">
                        ({sub.student?.registerNumber})
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#2D806B] block">
                      Task #{sub.task?.taskNumber}: {sub.task?.title}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-[#2D806B] bg-[#EAF7EF] px-2 py-0.5 rounded-full border border-[#CDE5D6] block">
                      Version {sub.version}
                    </span>
                    <span className="text-[10px] text-[#71817B] mt-1 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {new Date(sub.submittedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#71817B] block mb-0.5">
                    Student Explanation
                  </span>
                  <p className="text-xs text-[#172E2A] line-clamp-2 italic bg-[#FAF8F0] p-2.5 rounded-lg border border-[#DDE8DF]">
                    "{sub.explanation}"
                  </p>
                </div>

                {/* Thumbnail & GitHub Link */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-[#DDE8DF] bg-white shrink-0">
                    <AuthorizedImage
                      fileId={sub.fileId}
                      alt="Proof preview"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setZoomImageId(sub.fileId)}
                    />
                  </div>

                  {sub.githubUrl && (
                    <a
                      href={sub.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#2D806B] hover:underline flex items-center gap-1 truncate font-semibold"
                    >
                      <Github className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[180px]">{sub.githubUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Evaluate Button */}
              <div className="mt-4 pt-3 border-t border-[#DDE8DF] flex justify-end">
                <button
                  onClick={() => setSelectedSubmission(sub)}
                  className="w-full py-2 rounded-xl text-xs font-bold text-white bg-[#064E45] hover:bg-[#085f54] transition-all flex items-center justify-center gap-1.5"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Evaluate Submission</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedSubmission && (
        <ReviewSubmissionModal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          submission={selectedSubmission}
          onReviewed={fetchPendingReviews}
          onImageZoom={(id) => setZoomImageId(id)}
        />
      )}

      {/* Image Zoom Modal */}
      <ImageModal
        isOpen={!!zoomImageId}
        onClose={() => setZoomImageId(null)}
        fileId={zoomImageId}
      />

      {/* Bulk Confirmation */}
      <ConfirmationModal
        isOpen={!!bulkAction}
        onClose={() => !bulkLoading && setBulkAction(null)}
        onConfirm={handleBulkReview}
        danger={bulkAction === 'reject'}
        loading={bulkLoading}
        title={bulkAction === 'reject' ? 'Decline all submissions?' : 'Accept all submissions?'}
        confirmText={bulkAction === 'reject' ? 'Decline all' : 'Accept all'}
        message={
          bulkAction === 'reject'
            ? `This will reject all ${bulkCount} pending submission${bulkCount === 1 ? '' : 's'} with the default reason "Does not meet requirements yet." This action cannot be undone.`
            : `This will approve all ${bulkCount} pending submission${bulkCount === 1 ? '' : 's'} and unlock the next task for each student.`
        }
      />
    </div>
  );
};
