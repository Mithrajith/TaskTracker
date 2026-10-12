import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import {
  UploadCloud,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  FileText,
  Users,
  Loader2,
  KeyRound,
  ExternalLink,
  Info,
} from 'lucide-react';

export const ImportStudentsPage = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef(null);

  // Input states
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'paste'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Settings
  const [defaultPassword, setDefaultPassword] = useState('Student@123');
  const [updateExisting, setUpdateExisting] = useState(false);

  // Parsed Preview
  const [previewRows, setPreviewRows] = useState([]);
  const [parseStats, setParseStats] = useState({ total: 0, valid: 0, invalid: 0 });

  // Processing state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Client-side CSV parser for instant preview
  const parseClientCSV = (csvText) => {
    if (!csvText || typeof csvText !== 'string') return [];

    const lines = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f !== '')) lines.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }

    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f !== '')) lines.push(currentRow);
    }

    if (lines.length === 0) return [];

    // Header mapping
    const rawHeaders = lines[0];
    const normalizedHeaders = rawHeaders.map((h) =>
      h.toLowerCase().replace(/[^a-z0-9]/g, '')
    );

    const headerMap = {};
    normalizedHeaders.forEach((h, idx) => {
      if (h.includes('reg') || h.includes('roll')) headerMap.registerNumber = idx;
      else if (h.includes('name')) headerMap.name = idx;
      else if (
        h.includes('git') ||
        h.includes('repo') ||
        h.includes('url') ||
        h.includes('link')
      )
        headerMap.githubRepoUrl = idx;
      else if (h.includes('pass')) headerMap.password = idx;
    });

    if (headerMap.registerNumber === undefined && rawHeaders.length >= 1)
      headerMap.registerNumber = 0;
    if (headerMap.name === undefined && rawHeaders.length >= 2)
      headerMap.name = 1;
    if (headerMap.githubRepoUrl === undefined && rawHeaders.length >= 3)
      headerMap.githubRepoUrl = 2;

    const rows = [];
    const seenRegs = new Set();
    let validCount = 0;
    let invalidCount = 0;

    for (let r = 1; r < lines.length; r++) {
      const row = lines[r];
      const regNo = (row[headerMap.registerNumber] || '').trim().toUpperCase();
      const name = (row[headerMap.name] || '').trim();
      const github = (row[headerMap.githubRepoUrl] || '').trim();
      const pass =
        headerMap.password !== undefined
          ? (row[headerMap.password] || '').trim()
          : '';

      if (!regNo && !name && !github) continue;

      let status = 'valid';
      let error = '';

      if (!regNo) {
        status = 'invalid';
        error = 'Missing register number';
      } else if (!name) {
        status = 'invalid';
        error = 'Missing name';
      } else if (seenRegs.has(regNo)) {
        status = 'duplicate';
        error = 'Duplicate in file';
      }

      if (regNo) seenRegs.add(regNo);

      if (status === 'valid') validCount++;
      else invalidCount++;

      rows.push({
        rowNumber: r + 1,
        registerNumber: regNo,
        name,
        githubRepoUrl: github,
        password: pass,
        status,
        error,
      });
    }

    setParseStats({ total: rows.length, valid: validCount, invalid: invalidCount });
    return rows;
  };

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      toastError('Please choose a valid .csv file');
      return;
    }
    setSelectedFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        const parsed = parseClientCSV(text);
        setPreviewRows(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (text) => {
    setPastedText(text);
    setImportResult(null);
    if (!text.trim()) {
      setPreviewRows([]);
      setParseStats({ total: 0, valid: 0, invalid: 0 });
      return;
    }
    const parsed = parseClientCSV(text);
    setPreviewRows(parsed);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      'register_number,name,github_link\n' +
      'AI2026001,Aarav Patel,https://github.com/aarav-ai\n' +
      'AI2026002,Diya Sharma,https://github.com/diya-ml\n' +
      'AI2026003,Rohan Gupta,https://github.com/rohan-gupta\n' +
      'AI2026004,Meera Nair,https://github.com/meera-ai\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'students_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success('Sample CSV template downloaded!');
  };

  const handleImport = async () => {
    if (previewRows.length === 0) {
      toastError('No student records to import. Please upload a CSV first.');
      return;
    }

    setImporting(true);
    try {
      let res;
      if (activeTab === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('defaultPassword', defaultPassword);
        formData.append('updateExisting', String(updateExisting));

        res = await apiClient.post('/students/import-csv', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await apiClient.post('/students/import-csv', {
          csvText: pastedText,
          defaultPassword,
          updateExisting,
        });
      }

      if (res.data?.success) {
        setImportResult(res.data.data);
        success(res.data.message || 'Students imported successfully!');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Failed to import CSV';
      toastError(msg);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPastedText('');
    setPreviewRows([]);
    setImportResult(null);
    setParseStats({ total: 0, valid: 0, invalid: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
            <Link
              to="/admin/students"
              className="hover:underline flex items-center gap-1 text-slate-400 hover:text-slate-200"
            >
              <Users className="w-3.5 h-3.5" /> Students
            </Link>
            <span>/</span>
            <span>Bulk CSV Import</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-purple-400" />
            <span>Import Students via CSV</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Bulk-enroll students using a CSV file containing register numbers, names, and optional GitHub links.
          </p>
        </div>

        <button
          onClick={downloadSampleTemplate}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Download className="w-4 h-4 text-purple-400" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-purple-100">
            CSV Format Requirements:
          </p>
          <p className="text-purple-300/90 leading-relaxed">
            Your file must have a header row with columns: <code className="bg-purple-900/60 px-1.5 py-0.5 rounded text-purple-200 font-mono">register_number</code>, <code className="bg-purple-900/60 px-1.5 py-0.5 rounded text-purple-200 font-mono">name</code>, and optional <code className="bg-purple-900/60 px-1.5 py-0.5 rounded text-purple-200 font-mono">github_link</code>. Header names are flexible (e.g. <span className="font-mono">reg_no</span>, <span className="font-mono">name</span>, <span className="font-mono">github</span>).
          </p>
        </div>
      </div>

      {/* Upload & Configuration Card */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 gap-4">
            <button
              onClick={() => {
                setActiveTab('file');
                handleReset();
              }}
              className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'file'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload CSV File</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('paste');
                handleReset();
              }}
              className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'paste'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste CSV Content</span>
            </button>
          </div>

          {/* Tab 1: File Upload */}
          {activeTab === 'file' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-purple-500 bg-purple-950/20'
                  : selectedFile
                  ? 'border-emerald-500/60 bg-emerald-950/10'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click or drag to replace
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <UploadCloud className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    Drag and drop your student CSV file here, or{' '}
                    <span className="text-purple-400 underline font-semibold">browse</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Supports .csv files up to 5MB
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Paste Raw CSV */}
          {activeTab === 'paste' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Paste CSV Rows with Header
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder="register_number,name,github_link&#10;AI2026001,Aarav Patel,https://github.com/aarav&#10;AI2026002,Diya Sharma,https://github.com/diya"
                rows={6}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {/* Configuration Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                <span>Default Initial Password</span>
              </label>
              <input
                type="text"
                value={defaultPassword}
                onChange={(e) => setDefaultPassword(e.target.value)}
                placeholder="Student@123"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Used if no password column is present in the CSV. Students must change this password on their first login.
              </p>
            </div>

            <div className="space-y-3 flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={updateExisting}
                  onChange={(e) => setUpdateExisting(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span className="text-xs text-slate-300">
                  Update existing students if register number already exists
                </span>
              </label>
              <p className="text-[11px] text-slate-500">
                When unchecked, existing register numbers are safely skipped without overwriting existing data.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Live Preview Section */}
      {previewRows.length > 0 && !importResult && (
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>CSV Preview</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-800/40">
                  {parseStats.total} rows detected
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review data before importing into your database.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Clear
              </button>

              <button
                onClick={handleImport}
                disabled={importing || parseStats.valid === 0}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Import {parseStats.valid} Students</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Register Number</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">GitHub Repository</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {previewRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-800/40 ${
                      row.status === 'invalid'
                        ? 'bg-rose-950/20'
                        : row.status === 'duplicate'
                        ? 'bg-amber-950/20'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {row.rowNumber}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-purple-300">
                      {row.registerNumber || <span className="text-rose-400 italic">Missing</span>}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      {row.name || <span className="text-rose-400 italic">Missing</span>}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {row.githubRepoUrl ? (
                        <span className="truncate max-w-xs block text-slate-300">
                          {row.githubRepoUrl}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {row.status === 'valid' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40">
                          <AlertTriangle className="w-3 h-3" /> {row.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Import Results Report */}
      {importResult && (
        <Card className="p-6 space-y-6 border-purple-800/60 bg-slate-900/90 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>CSV Import Complete</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Processed {importResult.totalProcessed} records from CSV.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Import Another File</span>
              </button>

              <button
                onClick={() => navigate('/admin/students')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all flex items-center gap-1.5"
              >
                <span>View Students</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {importResult.createdCount}
              </p>
              <p className="text-xs text-emerald-300/80 font-medium mt-0.5">
                Students Created
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-center">
              <p className="text-2xl font-bold text-blue-400">
                {importResult.updatedCount}
              </p>
              <p className="text-xs text-blue-300/80 font-medium mt-0.5">
                Updated
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-center">
              <p className="text-2xl font-bold text-amber-400">
                {importResult.skippedCount}
              </p>
              <p className="text-xs text-amber-300/80 font-medium mt-0.5">
                Skipped (Duplicates)
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-center">
              <p className="text-2xl font-bold text-rose-400">
                {importResult.errorCount}
              </p>
              <p className="text-xs text-rose-300/80 font-medium mt-0.5">
                Errors
              </p>
            </div>
          </div>

          {/* Created Students List */}
          {importResult.created.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Newly Added Students ({importResult.created.length})
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-1.5 rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-xs">
                {importResult.created.map((s) => (
                  <div
                    key={s._id}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-purple-300">
                        {s.registerNumber}
                      </span>
                      <span className="font-medium text-slate-200">
                        {s.name}
                      </span>
                    </div>
                    {s.githubRepoUrl && (
                      <a
                        href={s.githubRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-purple-300 flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skipped Details */}
          {importResult.skipped.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Skipped Rows ({importResult.skipped.length})
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-xs">
                {importResult.skipped.map((sk, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-amber-950/20 border border-amber-900/40 text-amber-200 flex items-center justify-between"
                  >
                    <span>
                      Row {sk.row}: <strong className="font-mono">{sk.registerNumber}</strong> ({sk.name})
                    </span>
                    <span className="text-[11px] text-amber-400 font-medium">
                      {sk.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

