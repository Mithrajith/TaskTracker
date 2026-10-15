import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { AuthorizedImage } from '../common/AuthorizedImage';
import { useAuth } from '../../context/AuthContext';
import { optimizeImage, formatFileSize } from '../../utils/imageCompressor';
import {
  Calendar,
  UploadCloud,
  AlertCircle,
  MessageSquare,
  Clock,
  Sparkles,
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
  onImageClick,
  submitting = false,
  uploadProgress = 0,
}) => {
  const { user } = useAuth();
  const { task, status, submissions = [] } = studentTask;
  const latestSubmission = submissions[0] || null;

  // Form states for submission
  const [explanation, setExplanation] = useState('');
  const [githubUrl, setGithubUrl] = useState(user?.githubRepoUrl || '');
  const [rawFile, setRawFile] = useState(null);
  const [optimizedResult, setOptimizedResult] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [preserveLossless, setPreserveLossless] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Sync GitHub URL from profile so "Current Practical Task" reflects latest value
  React.useEffect(() => {
    if (user?.githubRepoUrl !== undefined) {
      setGithubUrl(user.githubRepoUrl || '');
    }
  }, [user]);

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

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, preserveLossless);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
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
      githubUrl: githubUrl.trim(),
      explanation: explanation.trim(),
      preserveLossless,
      file: optimizedResult.file,
    });
  };

  const labelClass = 'text-xs font-bold uppercase tracking-wider text-[#71817B]';
  const inputClass =
    'w-full px-3.5 py-2.5 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B] transition-all';

  return (
    <Card className="border-[#DDE8DF]">
      {/* Task Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#DDE8DF]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D806B] bg-[#EAF7EF] px-2.5 py-0.5 rounded-md border border-[#CDE5D6]">
              Task #{task.taskNumber}
            </span>
            <Badge status={status} />
          </div>
          <h2 className="text-xl font-extrabold text-[#064E45]">{task.title}</h2>
        </div>

        {task.deadline && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#71817B] bg-[#FAF8F0] px-3 py-1.5 rounded-xl border border-[#DDE8DF]">
            <Calendar className="w-3.5 h-3.5 text-[#2D806B]" />
            <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Task Description & Practical Instructions */}
      <div className="py-5 space-y-4">
        <div>
          <h4 className={`${labelClass} mb-1`}>Overview</h4>
          <p className="text-sm text-[#172E2A] leading-relaxed">{task.description}</p>
        </div>

        <div className="bg-[#EAF7EF] rounded-xl p-4 border border-[#D1E8D9]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#064E45] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#2D806B]" />
            Practical Instructions
          </h4>
          <pre className="text-xs text-[#172E2A] font-mono whitespace-pre-wrap leading-relaxed">
            {task.instructions}
          </pre>
        </div>
      </div>

      {/* Mentor Feedback Banner (if corrections requested or rejected) */}
      {(isCorrections || isRejected) && latestSubmission?.reviews?.[0] && (
        <div className="p-4 rounded-xl mb-5 bg-[#FFF0ED] border border-[#FAD3CC] text-[#172E2A]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E86A5B] mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Mentor Feedback on Version {latestSubmission.version}</span>
          </div>
          <p className="text-sm text-[#172E2A] italic">
            "{latestSubmission.reviews[0].feedback}"
          </p>
          <span className="text-[11px] text-[#E86A5B] mt-2 block">
            Please make the required changes and submit a new version below.
          </span>
        </div>
      )}

      {/* Approved State View */}
      {isApproved ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#EAF7EF] border border-[#CDE5D6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#CDE5D6] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#2D9B70]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#064E45]">
                  Task #{task.taskNumber} Completed &amp; Approved!
                </h4>
                <p className="text-xs text-[#71817B]">
                  Your work was verified and approved by your mentor.
                </p>
              </div>
            </div>
            {latestSubmission?.reviews?.[0] && (
              <span className="text-[11px] font-semibold text-[#2D9B70] px-2.5 py-1 rounded-full bg-white border border-[#CDE5D6]">
                Reviewed {new Date(latestSubmission.reviews[0].reviewedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {latestSubmission?.reviews?.[0]?.feedback && (
            <div className="p-3.5 rounded-xl bg-white border border-[#DDE8DF] text-xs">
              <span className="font-bold text-[#2D9B70] flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3.5 h-3.5" />
                Mentor Feedback:
              </span>
              <p className="text-[#172E2A] italic pl-5">"{latestSubmission.reviews[0].feedback}"</p>
            </div>
          )}

          {/* Completed Task Submission Details: Description & Image */}
          {latestSubmission && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF] space-y-2">
                <div className="flex items-center justify-between">
                  <span className={labelClass}>Approved Proof Image</span>
                  {latestSubmission.format && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[#2D806B] border border-[#CDE5D6] uppercase">
                      {latestSubmission.format}
                    </span>
                  )}
                </div>
                <div
                  className="relative group rounded-lg overflow-hidden border border-[#DDE8DF] bg-white cursor-pointer min-h-[160px] flex items-center justify-center"
                  onClick={() => onImageClick && onImageClick(latestSubmission.fileId)}
                  title="Click to view full-resolution image"
                >
                  <AuthorizedImage
                    fileId={latestSubmission.fileId}
                    alt="Approved Proof"
                    className="max-h-52 w-auto object-contain rounded"
                  />
                  <div className="absolute inset-0 bg-[#064E45]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#71817B] pt-1">
                  <span>Version {latestSubmission.version}</span>
                  {latestSubmission.compressedSize ? (
                    <span>{formatFileSize(latestSubmission.compressedSize)}</span>
                  ) : null}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF] flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className={`${labelClass} flex items-center gap-1.5`}>
                    <FileText className="w-3.5 h-3.5 text-[#2D806B]" />
                    My Submitted Description &amp; Notes
                  </span>
                  <div className="p-3 rounded-lg bg-white border border-[#DDE8DF] text-xs text-[#172E2A] leading-relaxed min-h-[120px] whitespace-pre-wrap">
                    {latestSubmission.explanation ? (
                      latestSubmission.explanation
                    ) : (
                      <span className="text-[#8C9B95] italic">
                        No additional implementation description provided.
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-[#71817B] pt-2 border-t border-[#DDE8DF] flex items-center justify-between">
                  <span>Submitted: {new Date(latestSubmission.submittedAt).toLocaleString()}</span>
                  {latestSubmission.githubUrl && (
                    <a
                      href={latestSubmission.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2D806B] hover:underline flex items-center gap-1 font-semibold"
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
        /* Pending Review State */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFF8EA] border border-[#FCE6BD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#FCE6BD] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#D88918]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#064E45]">
                  Submission in Review Queue (Version {latestSubmission?.version || 1})
                </h4>
                <p className="text-xs text-[#71817B]">
                  Your mentor will review your proof screenshot and description shortly.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#D88918] px-2.5 py-1 rounded-full bg-white border border-[#FCE6BD]">
              Pending Mentor Review
            </span>
          </div>

          {latestSubmission && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF] space-y-2">
                <div className="flex items-center justify-between">
                  <span className={labelClass}>Submitted Proof Image</span>
                  {latestSubmission.format && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[#2D806B] border border-[#CDE5D6] uppercase">
                      {latestSubmission.format}
                    </span>
                  )}
                </div>
                <div
                  className="relative group rounded-lg overflow-hidden border border-[#DDE8DF] bg-white cursor-pointer min-h-[160px] flex items-center justify-center"
                  onClick={() => onImageClick && onImageClick(latestSubmission.fileId)}
                  title="Click to view full-resolution image"
                >
                  <AuthorizedImage
                    fileId={latestSubmission.fileId}
                    alt="Submitted Proof"
                    className="max-h-52 w-auto object-contain rounded"
                  />
                  <div className="absolute inset-0 bg-[#064E45]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#71817B] pt-1">
                  <span>Version {latestSubmission.version}</span>
                  {latestSubmission.compressedSize ? (
                    <span>{formatFileSize(latestSubmission.compressedSize)}</span>
                  ) : null}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF] flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className={`${labelClass} flex items-center gap-1.5`}>
                    <FileText className="w-3.5 h-3.5 text-[#2D806B]" />
                    My Submitted Description &amp; Notes
                  </span>
                  <div className="p-3 rounded-lg bg-white border border-[#DDE8DF] text-xs text-[#172E2A] leading-relaxed min-h-[120px] whitespace-pre-wrap">
                    {latestSubmission.explanation ? (
                      latestSubmission.explanation
                    ) : (
                      <span className="text-[#8C9B95] italic">
                        No additional implementation description provided.
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-[#71817B] pt-2 border-t border-[#DDE8DF] flex items-center justify-between">
                  <span>Submitted: {new Date(latestSubmission.submittedAt).toLocaleString()}</span>
                  {latestSubmission.githubUrl && (
                    <a
                      href={latestSubmission.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2D806B] hover:underline flex items-center gap-1 font-semibold"
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
        /* Submission Form (initial submission or resubmission after corrections) */
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="border-t border-[#DDE8DF] pt-4">
            <h4 className="text-sm font-bold text-[#064E45] mb-1">
              {latestSubmission
                ? `Submit Revision (Version ${latestSubmission.version + 1})`
                : 'Submit Work for Mentor Review'}
            </h4>
            <p className="text-xs text-[#71817B] mb-4">
              Upload proof of execution. Images are automatically resized and compressed to
              150–300 KB for fast loading while preserving sharp text.
            </p>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFF0ED] border border-[#FAD3CC] text-[#E86A5B] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Description Text Box (visible while submitting) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`${labelClass} flex items-center gap-1.5`}>
                <FileText className="w-3.5 h-3.5 text-[#2D806B]" />
                <span>Task Description &amp; Implementation Steps</span>
              </label>
              <span className="text-[11px] text-[#71817B] font-medium">(Optional notes for mentor)</span>
            </div>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              disabled={submitting}
              placeholder="Describe your solution, steps taken, test verification, or any notes for your mentor..."
              className={`${inputClass} leading-relaxed disabled:opacity-50`}
            />
          </div>

          {/* GitHub Repository URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`${labelClass} flex items-center gap-1.5`}>
                <Github className="w-3.5 h-3.5 text-[#2D806B]" />
                <span>GitHub Repository</span>
              </label>
              <span className="text-[11px] text-[#71817B] font-medium">(Auto-filled from profile)</span>
            </div>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              disabled
              readOnly
              placeholder="https://github.com/username/repository"
              className={`${inputClass} bg-[#F4FAF6] text-[#71817B] disabled:opacity-70`}
            />
            <span className="text-[11px] text-[#71817B] mt-1 block">
              Update your GitHub link in Profile &amp; Settings to change this.
            </span>
          </div>

          {/* Proof Image Upload & Optimization Zone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClass}>
                Proof Screenshot / Execution Evidence <span className="text-[#E86A5B]">*</span>
              </label>
              <span className="text-[11px] text-[#71817B]">
                Max 1600&times;1600 &bull; Auto-optimized to 150&ndash;300 KB
              </span>
            </div>

            {/* Dropzone when no file selected */}
            {!optimizedResult && !optimizing && (
              <label
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center w-full transition-all text-center group ${
                  dragActive
                    ? 'border-[#2D806B] bg-[#EAF7EF]'
                    : 'border-[#DDE8DF] bg-[#FAF8F0] hover:border-[#2D806B] hover:bg-[#EAF7EF]/60'
                }`}
              >
                <UploadCloud className="w-8 h-8 text-[#2D806B] group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs font-bold text-[#064E45]">
                  Select or drop your proof screenshot
                </span>
                <span className="text-[11px] text-[#71817B] mt-1">
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
              <div className="p-6 rounded-xl border border-[#CDE5D6] bg-[#EAF7EF] flex flex-col items-center justify-center text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#2D806B]" />
                <p className="text-xs font-bold text-[#064E45]">Optimizing screenshot...</p>
                <p className="text-[11px] text-[#71817B]">
                  Resizing to 1600px max and tuning compression for sharp code readability
                </p>
              </div>
            )}

            {/* Optimized Result Display */}
            {optimizedResult && !optimizing && (
              <div className="p-4 rounded-xl border border-[#DDE8DF] bg-[#FAF8F0] space-y-3">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="relative group rounded-lg overflow-hidden border border-[#DDE8DF] w-24 h-20 shrink-0 bg-white cursor-pointer"
                      onClick={() => onImageClick && onImageClick(optimizedResult.previewUrl)}
                      title="Click to view full preview"
                    >
                      <img
                        src={optimizedResult.previewUrl}
                        alt="Optimized preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[#064E45]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#064E45] truncate max-w-[200px]">
                          {optimizedResult.file.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[#2D806B] border border-[#CDE5D6]">
                          {optimizedResult.format}
                        </span>
                        {optimizedResult.savedPercentage > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[#2D9B70] border border-[#CDE5D6] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {optimizedResult.savedPercentage}% saved
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-[#71817B] flex items-center gap-2 flex-wrap">
                        <span>
                          Original:{' '}
                          <strong className="text-[#172E2A]">
                            {formatFileSize(optimizedResult.originalSize)}
                          </strong>
                        </span>
                        <span>&rarr;</span>
                        <span>
                          Optimized:{' '}
                          <strong className="text-[#2D9B70] font-semibold">
                            {formatFileSize(optimizedResult.compressedSize)}
                          </strong>
                        </span>
                        {optimizedResult.width > 0 && (
                          <span>
                            &bull; {optimizedResult.width}&times;{optimizedResult.height}px
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="text-xs font-semibold text-[#71817B] hover:text-[#E86A5B] flex items-center gap-1 p-1.5 rounded-lg hover:bg-[#FFF0ED] transition-colors self-end sm:self-auto"
                    title="Remove and choose another image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                </div>

                {/* Lossless Toggle for code screenshots */}
                <div className="pt-2 border-t border-[#DDE8DF] flex items-center justify-between text-xs flex-wrap gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#172E2A]">
                    <input
                      type="checkbox"
                      checked={preserveLossless}
                      onChange={(e) => handleToggleLossless(e.target.checked)}
                      className="rounded border-[#CBDDD0] bg-white text-[#2D806B] focus:ring-[#2D806B] h-3.5 w-3.5"
                    />
                    <span>Preserve lossless PNG (recommended for code screenshots)</span>
                  </label>
                  <span className="text-[11px] text-[#71817B]">Target budget: 150&ndash;300 KB</span>
                </div>
              </div>
            )}

            {/* Upload Progress Bar (during submission) */}
            {submitting && (
              <div className="p-3.5 rounded-xl border border-[#CDE5D6] bg-[#EAF7EF] space-y-2 mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#064E45] font-semibold flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2D806B]" />
                    {uploadProgress < 100
                      ? `Uploading optimized proof (${uploadProgress}%)...`
                      : 'Processing on server & storing securely...'}
                  </span>
                  <span className="font-mono text-[#064E45] font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2D9B70] transition-all duration-200 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit action while submitting stays visible */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting || optimizing || !optimizedResult}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#064E45] hover:bg-[#085f54] transition-all flex items-center gap-2 ${
                  submitting || optimizing || !optimizedResult ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>{submitting ? 'Submitting Work...' : 'Submit for Review'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </Card>
  );
};
