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
        <Loader2 className="w-8 h-8 animate-spin text-[#2D806B]" />
      </div>
    );
  }

  const labelClass = 'text-[10px] font-bold uppercase tracking-wider text-[#71817B]';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#064E45] flex items-center gap-2">
          <History className="w-6 h-6 text-[#2D806B]" />
          <span>My Submission History &amp; Mentor Reviews</span>
        </h1>
        <p className="text-sm text-[#71817B] mt-1">
          Review all your submitted practical versions, execution proof screenshots, and historical
          mentor feedback.
        </p>
      </div>

      {assignedTasks.length === 0 ? (
        <Card className="text-center py-12 text-[#71817B]">No tasks assigned yet.</Card>
      ) : (
        <div className="space-y-6">
          {assignedTasks.map((st) => (
            <Card key={st._id}>
              {/* Task Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE8DF]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2D806B] bg-[#EAF7EF] px-2.5 py-0.5 rounded-md border border-[#CDE5D6]">
                      Task #{st.task?.taskNumber}
                    </span>
                    <Badge status={st.status} />
                  </div>
                  <h3 className="text-lg font-bold text-[#064E45]">{st.task?.title}</h3>
                </div>

                <div className="text-xs text-[#71817B] flex items-center gap-2 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#2D806B]" />
                  <span>Unlocked: {new Date(st.unlockedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Submissions List */}
              <div className="pt-4 space-y-4">
                {!st.submissions || st.submissions.length === 0 ? (
                  <p className="text-xs text-[#8C9B95] italic py-2">
                    No submissions made yet for this task.
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
                              className="inline-flex items-center gap-1.5 text-xs text-[#2D806B] hover:underline font-semibold"
                            >
                              <Github className="w-3.5 h-3.5" />
                              <span className="truncate max-w-sm">{sub.githubUrl}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {sub.explanation && (
                            <div>
                              <span className={`${labelClass} block mb-0.5`}>My Explanation</span>
                              <p className="text-xs text-[#172E2A] leading-relaxed bg-white p-2.5 rounded-lg border border-[#DDE8DF]">
                                {sub.explanation}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Proof Image */}
                        <div>
                          <span className={`${labelClass} block mb-1`}>Proof Image</span>
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

                      {/* Mentor Feedback Notes */}
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
                                    Mentor Decision: {rev.decision.toUpperCase()}
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
          ))}
        </div>
      )}

      {/* Proof zoom modal */}
      <ImageModal
        isOpen={!!zoomImageId}
        onClose={() => setZoomImageId(null)}
        fileId={zoomImageId}
      />
    </div>
  );
};
