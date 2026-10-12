import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { AuthorizedImage } from '../common/AuthorizedImage';
import { optimizeImage, formatFileSize } from '../../utils/imageCompressor';
import {
  Calendar,
  UploadCloud,
  CheckSquare,
  Square,
  AlertCircle,
  MessageSquare,
  Clock,
  Sparkles,
  ExternalLink,
  Eye,
  Trash2,
  Loader2,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Github } from '../common/Icons';

export const TaskCard = ({
  studentTask,
  onSubmitWork,
  onToggleCheckbox,
  onImageClick,
  submitting = false,
  uploadProgress = 0,
}) => {
  const { task, status, isStudentCompleted, submissions = [] } = studentTask;
  const latestSubmission = submissions[0] || null;

  // Form states for submission
  const [explanation, setExplanation] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const [optimizedResult, setOptimizedResult] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [preserveLossless, setPreserveLossless] = useState(false);
  const [validationError, setValidationError] = useState('');

  const isApproved = status === 'approved';
  const isSubmitted = status === 'submitted';
  const isCorrections = status === 'changes_requested';
  const isRejected = status === 'rejected';

  const processFile = async (file, forceLossless = preserveLossless) => {
    setValidationError('');
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setValidationError('Unsupported format. Please select a valid PNG, JPEG, or WebP screenshot.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setValidationError('Image file is too large (max 20MB before compression).');
      return;
    }

    setRawFile(file);
    setOptimizing(true);
    try {
      const result = await optimizeImage(file, { forceLosslessPng: forceLossless });
      setOptimizedResult(result);
    } catch (err) {
      console.error('Client compression failed:', err);
      // If client compression fails, fallback gracefully to original if under 3MB
      if (file.size <= 3 * 1024 * 1024) {
        setOptimizedResult({
          file,
          previewUrl: URL.createObjectURL(file),
          originalSize: file.size,
          compressedSize: file.size,
          savedPercentage: 0,
          format: file.type.split('/')[1]?.toUpperCase() || 'IMAGE',
          width: 0,
          height: 0,
        });
      } else {
        setValidationError(err.message || 'Image compression failed. Please choose another image.');
      }
    } finally {
      setOptimizing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, preserveLossless);
    }
  };

  const handleToggleLossless = (newVal) => {
    setPreserveLossless(newVal);
    if (rawFile) {
      processFile(rawFile, newVal);
    }
  };

  const handleClearImage = () => {
    setRawFile(null);
    setOptimizedResult(null);
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!optimizedResult?.file) {
      setValidationError('Please attach a proof screenshot image');
      return;
    }

    onSubmitWork({
      studentTaskId: studentTask._id,
      explanation: explanation.trim(),
      preserveLossless,
      file: optimizedResult.file,
    });
  };

  return (
    <Card className="border-purple-900/30 bg-slate-900/90 shadow-2xl">
      {/* Task Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded-md border border-purple-800/40">
              Task #{task.taskNumber}
            </span>
            <Badge status={status} />
          </div>
          <h2 className="text-xl font-bold text-slate-100">{task.title}</h2>
        </div>

        {task.deadline && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Due: {new Date(task.deadline).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Task Description & Practical Instructions */}
      <div className="py-5 space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Overview
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {task.description}
          </p>
        </div>

        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Practical Instructions
          </h4>
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
            {task.instructions}
          </pre>
        </div>
      </div>

      {/* Mentor Feedback Banner (if corrections requested or rejected) */}
      {(isCorrections || isRejected) && latestSubmission?.reviews?.[0] && (
        <div className="p-4 rounded-xl mb-5 bg-rose-950/40 border border-rose-800/50 text-rose-200">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Mentor Feedback on Version {latestSubmission.version}</span>
          </div>
          <p className="text-sm text-rose-100 italic">
            "{latestSubmission.reviews[0].feedback}"
          </p>
          <span className="text-[11px] text-rose-400 mt-2 block">
            Please make the required changes and submit a new version below.
          </span>
        </div>
      )}

      {/* Practical Work Checklist */}
      <div className="py-3 px-4 rounded-xl bg-slate-950/50 border border-slate-800 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isApproved || isSubmitted}
            onClick={() => onToggleCheckbox(studentTask._id, !isStudentCompleted)}
            className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
          >
            {isStudentCompleted ? (
              <CheckSquare className="w-5 h-5 text-emerald-400" />
            ) : (
              <Square className="w-5 h-5 text-slate-500" />
            )}
          </button>
          <div>
            <p className="text-xs font-medium text-slate-200">
              I have completed all the practical tasks and verified locally
            </p>
            <p className="text-[11px] text-slate-500">
              Note: Checking this box acknowledges your completion; formal approval requires mentor review.
            </p>
          </div>
        </div>
        {isStudentCompleted && (
          <span className="text-[11px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40">
            Checked
          </span>
        )}
      </div>

      {/* Pending Review State or Approved State View */}
      {isApproved ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center text-emerald-300 font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-200">
                  Task #{task.taskNumber} Completed & Approved!
                </h4>
                <p className="text-xs text-emerald-300/80">
                  Your work was verified and approved by your mentor.
                </p>
              </div>
            </div>
            {latestSubmission?.reviews?.[0] && (
              <span className="text-[11px] text-emerald-400 font-medium px-2.5 py-1 rounded-full bg-emerald-900/50 border border-emerald-700/50">
                Reviewed {new Date(latestSubmission.reviews[0].reviewedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Mentor Feedback Banner */}
          {latestSubmission?.reviews?.[0]?.feedback && (
            <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-800/40 text-xs">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Mentor Feedback:
              </span>
              <p className="text-slate-200 italic pl-5">"{latestSubmission.reviews[0].feedback}"</p>
            </div>
          )}

          {/* Completed Task Submission Details: Description & Image */}
          {latestSubmission && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Submitted Proof Image */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Approved Proof Image
                  </span>
                  {latestSubmission.format && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50 uppercase">
                      {latestSubmission.format}
                    </span>
                  )}
                </div>
                <div
                  className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-900 cursor-pointer min-h-[160px] flex items-center justify-center"
                  onClick={() => onImageClick && onImageClick(latestSubmission.fileId)}
                  title="Click to view full-resolution image"
                >
                  <AuthorizedImage
                    fileId={latestSubmission.fileId}
                    alt="Approved Proof"
                    className="max-h-52 w-auto object-contain rounded"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Version {latestSubmission.version}</span>
                  {latestSubmission.compressedSize ? (
                    <span>{formatFileSize(latestSubmission.compressedSize)}</span>
                  ) : null}
                </div>
              </div>

              {/* Submitted Description */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    My Submitted Description & Notes
                  </span>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200 leading-relaxed min-h-[120px] whitespace-pre-wrap">
                    {latestSubmission.explanation ? (
                      latestSubmission.explanation
                    ) : (
                      <span className="text-slate-500 italic">No additional implementation description provided.</span>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span>Submitted: {new Date(latestSubmission.submittedAt).toLocaleString()}</span>
                  {latestSubmission.githubUrl && (
                    <a
                      href={latestSubmission.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <Github className="w-3 h-3" />
                      <span>Repo Link</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : isSubmitted ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-900/50 border border-amber-700/60 flex items-center justify-center text-amber-300 font-bold shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-200">
                  Submission in Review Queue (Version {latestSubmission?.version || 1})
                </h4>
                <p className="text-xs text-amber-300/80">
                  Your mentor will review your proof screenshot and description shortly.
                </p>
              </div>
            </div>
            <span className="text-[11px] text-amber-400 font-medium px-2.5 py-1 rounded-full bg-amber-900/50 border border-amber-700/50">
              Pending Mentor Review
            </span>
          </div>

          {/* Submitted Task Details: Description & Image */}
          {latestSubmission && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Submitted Proof Image */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Submitted Proof Image
                  </span>
                  {latestSubmission.format && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50 uppercase">
                      {latestSubmission.format}
                    </span>
                  )}
                </div>
                <div
                  className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-900 cursor-pointer min-h-[160px] flex items-center justify-center"
                  onClick={() => onImageClick && onImageClick(latestSubmission.fileId)}
                  title="Click to view full-resolution image"
                >
                  <AuthorizedImage
                    fileId={latestSubmission.fileId}
                    alt="Submitted Proof"
                    className="max-h-52 w-auto object-contain rounded"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Version {latestSubmission.version}</span>
                  {latestSubmission.compressedSize ? (
                    <span>{formatFileSize(latestSubmission.compressedSize)}</span>
                  ) : null}
                </div>
              </div>

              {/* Submitted Description */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    My Submitted Description & Notes
                  </span>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200 leading-relaxed min-h-[120px] whitespace-pre-wrap">
                    {latestSubmission.explanation ? (
                      latestSubmission.explanation
                    ) : (
                      <span className="text-slate-500 italic">No additional implementation description provided.</span>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span>Submitted: {new Date(latestSubmission.submittedAt).toLocaleString()}</span>
                  {latestSubmission.githubUrl && (
                    <a
                      href={latestSubmission.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <Github className="w-3 h-3" />
                      <span>Repo Link</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Submission Form (for initial submission or resubmission after corrections) */
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-sm font-semibold text-slate-200 mb-1">
              {latestSubmission ? `Submit Revision (Version ${latestSubmission.version + 1})` : 'Submit Work for Mentor Review'}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Upload proof of execution. Images are automatically resized and compressed to 150–300 KB for fast loading while preserving sharp text.
            </p>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Description Text Box (shown while submitting) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Task Description & Implementation Steps Taken</span>
              </label>
              <span className="text-[11px] text-slate-500 font-normal">(Optional notes for mentor)</span>
            </div>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              disabled={submitting}
              placeholder="Describe your solution, steps taken, test verification, or any notes for your mentor..."
              className="w-full p-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 leading-relaxed disabled:opacity-50"
            />
          </div>

          {/* Proof Image Upload & Optimization Zone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Proof Screenshot / Execution Evidence <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Max 1600&times;1600 &bull; Auto-optimized to 150&ndash;300 KB
              </span>
            </div>

            {/* Dropzone when no file selected */}
            {!optimizedResult && !optimizing && (
              <label className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-xl p-6 flex flex-col items-center justify-center w-full bg-slate-950/40 hover:bg-slate-950/70 transition-all text-center group">
                <UploadCloud className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs font-semibold text-slate-200">
                  Select Proof Screenshot
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  PNG, JPEG, WebP &bull; Drag &amp; drop or click to browse
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}

            {/* Optimizing Spinner State */}
            {optimizing && (
              <div className="p-6 rounded-xl border border-purple-800/40 bg-purple-950/20 flex flex-col items-center justify-center text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                <p className="text-xs font-semibold text-purple-200">
                  Optimizing screenshot...
                </p>
                <p className="text-[11px] text-slate-400">
                  Resizing to 1600px max and tuning compression for sharp code readability
                </p>
              </div>
            )}

            {/* Optimized Result Display */}
            {optimizedResult && !optimizing && (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="relative group rounded-lg overflow-hidden border border-slate-700 w-24 h-20 shrink-0 bg-slate-900 cursor-pointer"
                      onClick={() => onImageClick && onImageClick(optimizedResult.previewUrl)}
                      title="Click to view full preview"
                    >
                      <img
                        src={optimizedResult.previewUrl}
                        alt="Optimized preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
                          {optimizedResult.file.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50">
                          {optimizedResult.format}
                        </span>
                        {optimizedResult.savedPercentage > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {optimizedResult.savedPercentage}% saved
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                        <span>Original: <strong className="text-slate-300">{formatFileSize(optimizedResult.originalSize)}</strong></span>
                        <span>&rarr;</span>
                        <span>Optimized: <strong className="text-emerald-400 font-semibold">{formatFileSize(optimizedResult.compressedSize)}</strong></span>
                        {optimizedResult.width > 0 && (
                          <span>&bull; {optimizedResult.width}&times;{optimizedResult.height}px</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-800 transition-colors self-end sm:self-auto"
                    title="Remove and choose another image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                </div>

                {/* Lossless Toggle for code screenshots */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={preserveLossless}
                      onChange={(e) => handleToggleLossless(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                    />
                    <span>Preserve lossless PNG (Recommended for code screenshots)</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Target budget: 150&ndash;300 KB
                  </span>
                </div>
              </div>
            )}

            {/* Upload Progress Bar (during submission) */}
            {submitting && (
              <div className="p-3.5 rounded-xl border border-purple-800/40 bg-purple-950/30 space-y-2 mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300 font-medium flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {uploadProgress < 100
                      ? `Uploading optimized proof (${uploadProgress}%)...`
                      : 'Processing on server & storing in GridFS...'}
                  </span>
                  <span className="font-mono text-purple-200 font-semibold">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-200 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || optimizing || !optimizedResult}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2 ${
                submitting || optimizing || !optimizedResult ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>{submitting ? 'Submitting Work...' : 'Submit for Review'}</span>
            </button>
          </div>
        </form>
      )}
    </Card>
  );
};
