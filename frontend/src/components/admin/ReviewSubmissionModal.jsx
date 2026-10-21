import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { AuthorizedImage } from '../common/AuthorizedImage';
import apiClient from '../../api/client';
import { useToast } from '../../context/ToastContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  MessageSquare,
  History,
  AlertCircle,
} from 'lucide-react';
import { Github } from '../common/Icons';

export const ReviewSubmissionModal = ({
  isOpen,
  onClose,
  submission,
  onReviewed,
  onImageZoom,
}) => {
  const { success, error } = useToast();
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' | 'changes' | 'reject'
  const [formError, setFormError] = useState('');

  if (!submission) return null;

  const handleAction = async (type) => {
    setFormError('');
    setActionType(type);

    if (type !== 'approve' && (!feedback.trim() || feedback.trim().length < 5)) {
      setFormError('Meaningful mentor feedback (at least 5 characters) is required when requesting corrections or rejecting.');
      return;
    }

    setLoading(true);
    try {
      let endpoint = `/reviews/${submission._id}/approve`;
      if (type === 'changes') {
        endpoint = `/reviews/${submission._id}/request-changes`;
      } else if (type === 'reject') {
        endpoint = `/reviews/${submission._id}/reject`;
      }

      const res = await apiClient.post(endpoint, {
        feedback: feedback.trim() || 'Work verified and approved.',
      });

      if (res.data?.success) {
        success(res.data.message || 'Review submitted successfully!');
        setFeedback('');
        onClose();
        if (onReviewed) onReviewed();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit review';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Submission: Task #${submission.task?.taskNumber} (Version ${submission.version})`}
      subtitle={`Student: ${submission.student?.name} (${submission.student?.registerNumber})`}
      maxWidth="max-w-3xl"
    >
      {formError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFF0ED] border border-[#FAD3CC] text-[#E86A5B] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#E86A5B]" />
          <span>{formError}</span>
        </div>
      )}

      {/* Task & Instructions Summary */}
      <div className="p-3.5 rounded-xl bg-[#EAF7EF] border border-[#DDE8DF]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1">
          {submission.task?.title}
        </h4>
        <p className="text-xs text-[#71817B] line-clamp-2">{submission.task?.instructions}</p>
      </div>

      {/* Proof Screenshot & GitHub Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Proof Image Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#71817B]">
            Submitted Proof Image
          </label>
          <div className="relative group rounded-xl border border-[#DDE8DF] bg-[#FAF8F0] p-2 flex items-center justify-center min-h-[160px]">
            <AuthorizedImage
              fileId={submission.fileId}
              alt="Student Proof"
              className="max-h-48 w-auto rounded-lg cursor-zoom-in"
              onClick={() => onImageZoom && onImageZoom(submission.fileId)}
            />
          </div>
          <span className="text-[10px] text-[#71817B] block text-center">
            Click image to view in full resolution
          </span>
        </div>

        {/* Student Explanation & GitHub Link */}
        <div className="space-y-3 flex flex-col justify-between">
          {submission.githubUrl ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#71817B] block mb-1.5">
                GitHub Repository / Commit
              </label>
              <a
                href={submission.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#DDE8DF] text-[#064E45] hover:underline text-xs font-medium transition-colors shadow-sm"
              >
                <Github className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1">{submission.githubUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[#71817B]" />
              </a>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#71817B] block mb-1.5">
                GitHub Link
              </label>
              <span className="text-xs text-[#71817B] italic">Not provided</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#71817B] block mb-1.5">
              Student's Explanation
            </label>
            <div className="p-3 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF] text-xs text-[#172E2A] leading-relaxed max-h-28 overflow-y-auto">
              {submission.explanation || (
                <span className="text-[#71817B] italic">No additional explanation provided.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Previous Review Notes if Version > 1 */}
      {submission.previousReviews && submission.previousReviews.length > 0 && (
        <div className="space-y-2 border-t border-[#DDE8DF] pt-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#71817B]">
            <History className="w-3.5 h-3.5 text-[#71817B]" />
            <span>Previous Review Feedback</span>
          </div>
          <div className="space-y-2 max-h-28 overflow-y-auto">
            {submission.previousReviews.map((pr) => (
              <div
                key={pr._id}
                className="p-2.5 rounded-lg bg-[#FAF8F0] border border-[#DDE8DF] text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge status={pr.decision} />
                  <span className="text-[10px] text-[#71817B]">
                    {new Date(pr.reviewedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[#172E2A] text-[11px] italic">"{pr.feedback}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentor Feedback Input */}
      <div className="border-t border-[#DDE8DF] pt-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#064E45] mb-1.5 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#064E45]" />
          <span>Mentor Feedback / Correction Notes</span>
        </label>
        <textarea
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide encouraging and constructive feedback, highlight edge cases, or explain exactly what must be corrected..."
          className="w-full p-3 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-xs text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#064E45]/20 focus:border-[#064E45] leading-relaxed"
        />
      </div>

      {/* Review Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DDE8DF]">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-xs font-bold text-[#71817B] hover:text-[#064E45] hover:bg-[#EAF7EF] transition-colors"
        >
          Close
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAction('reject')}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#E86A5B] bg-[#FFF0ED] hover:bg-[#FDE2DC] border border-[#FAD3CC] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('changes')}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#D88918] bg-[#FFF8EA] hover:bg-[#FDEFD3] border border-[#FCE6BD] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Request Changes</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2D9B70] hover:bg-[#268a63] transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Processing...' : 'Approve & Unlock Next'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
