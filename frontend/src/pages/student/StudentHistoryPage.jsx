import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { AuthorizedImage } from '../../components/common/AuthorizedImage';
import { ImageModal } from '../../components/common/ImageModal';
import {
  History,
  ExternalLink,
  MessageSquare,
  Clock,
  Loader2,
  Calendar,
} from 'lucide-react';
import { Github } from '../../components/common/Icons';

export const StudentHistoryPage = () => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomImageId, setZoomImageId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/student-tasks');
      if (res.data?.success) {
        setAssignedTasks(res.data.data.assignedTasks || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <History className="w-6 h-6 text-purple-400" />
          <span>My Submission History & Mentor Reviews</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review all your submitted practical versions, execution proof screenshots, and historical mentor feedback.
        </p>
      </div>

      {assignedTasks.length === 0 ? (
        <Card className="text-center py-12 text-slate-500">
          No tasks assigned yet.
        </Card>
      ) : (
        <div className="space-y-6">
          {assignedTasks.map((st) => (
            <Card key={st._id} className="border-slate-800">
              {/* Task Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded-md border border-purple-800/40">
                      Task #{st.task?.taskNumber}
                    </span>
                    <Badge status={st.status} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">
                    {st.task?.title}
                  </h3>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Unlocked: {new Date(st.unlockedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Submissions List */}
              <div className="pt-4 space-y-4">
                {(!st.submissions || st.submissions.length === 0) ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No submissions made yet for this task.
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
                          {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>

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
                                My Explanation
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                                {sub.explanation}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Proof Image */}
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                            Proof Image
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

                      {/* Mentor Feedback Notes */}
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
                                    Mentor Decision: {rev.decision.toUpperCase()}
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
          ))}
        </div>
      )}

      {/* Proof zoom modal */}
      <ImageModal
        isOpen={!!zoomImageId}
        onClose={() => setZoomImageId(null)}
        imgSrc={zoomImageId ? `/api/v1/files/${zoomImageId}` : null}
      />
    </div>
  );
};
