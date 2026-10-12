import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { AuthorizedImage } from '../../components/common/AuthorizedImage';
import { ReviewSubmissionModal } from '../../components/admin/ReviewSubmissionModal';
import { ImageModal } from '../../components/common/ImageModal';
import { useToast } from '../../context/ToastContext';
import {
  FileCheck2,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Github } from '../../components/common/Icons';

export const ReviewsPage = () => {
  const { success, error } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [zoomImageId, setZoomImageId] = useState(null);

  const fetchPendingReviews = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/reviews/pending');
      if (res.data?.success) {
        setSubmissions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load pending reviews:', err);
      error('Failed to load pending review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-purple-400" />
            <span>Submission Review Queue</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review student practical submissions, verify proof images, and approve task completions to unlock subsequent roadmap stages.
          </p>
        </div>

        <button
          onClick={fetchPendingReviews}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Queue Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : submissions.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center mx-auto mb-3 text-emerald-400">
            ✓
          </div>
          <h3 className="text-base font-bold text-slate-200">
            All Caught Up!
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are no student submissions pending evaluation at the moment.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((sub) => (
            <Card
              key={sub._id}
              className="border-purple-900/20 bg-slate-900/80 hover:border-purple-600/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-100">
                        {sub.student?.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({sub.student?.registerNumber})
                      </span>
                    </div>
                    <span className="text-xs font-bold text-purple-400 block">
                      Task #{sub.task?.taskNumber}: {sub.task?.title}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40 block">
                      Version {sub.version}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Student Explanation
                  </span>
                  <p className="text-xs text-slate-300 line-clamp-2 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    "{sub.explanation}"
                  </p>
                </div>

                {/* Thumbnail & GitHub Link */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
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
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 truncate font-medium"
                    >
                      <Github className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[180px]">{sub.githubUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Evaluate Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedSubmission(sub)}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-1.5"
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
        imgSrc={zoomImageId ? `/api/v1/files/${zoomImageId}` : null}
      />
    </div>
  );
};
