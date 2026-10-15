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
  ArrowRight,
  RefreshCw,
  FileText,
  Users,
  Loader2,
  KeyRound,
  ExternalLink,
  Info,
} from 'lucide-react';
import { PasswordInput } from '../../components/common/PasswordInput';

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
    const normalizedHeaders = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    const headerMap = {};
    normalizedHeaders.forEach((h, idx) => {
      if (h.includes('reg') || h.includes('roll')) headerMap.registerNumber = idx;
      else if (h.includes('name')) headerMap.name = idx;
      else if (h.includes('git') || h.includes('repo') || h.includes('url') || h.includes('link'))
        headerMap.githubRepoUrl = idx;
      else if (h.includes('pass')) headerMap.password = idx;
    });

    if (headerMap.registerNumber === undefined && rawHeaders.length >= 1) headerMap.registerNumber = 0;
    if (headerMap.name === undefined && rawHeaders.length >= 2) headerMap.name = 1;
    if (headerMap.githubRepoUrl === undefined && rawHeaders.length >= 3) headerMap.githubRepoUrl = 2;

    const rows = [];
    const seenRegs = new Set();
    let validCount = 0;
    let invalidCount = 0;

    for (let r = 1; r < lines.length; r++) {
      const row = lines[r];
      const regNo = (row[headerMap.registerNumber] || '').trim().toUpperCase();
      const name = (row[headerMap.name] || '').trim();
      const github = (row[headerMap.githubRepoUrl] || '').trim();
      const pass = headerMap.password !== undefined ? (row[headerMap.password] || '').trim() : '';

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
      const msg = err.response?.data?.message || err.message || 'Failed to import CSV';
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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D806B] mb-1">
            <Link
              to="/admin/students"
              className="hover:underline flex items-center gap-1 text-[#71817B] hover:text-[#064E45]"
            >
              <Users className="w-3.5 h-3.5" /> Students
            </Link>
            <span>/</span>
            <span>Bulk CSV Import</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#064E45] flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#2D806B]" />
            <span>Import Students via CSV</span>
          </h1>
          <p className="text-sm text-[#71817B] mt-1">
            Bulk-enroll students using a CSV file containing register numbers, names, and optional
            GitHub links.
          </p>
        </div>

        <button
          onClick={downloadSampleTemplate}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#EAF7EF] text-[#064E45] border border-[#DDE8DF] font-bold text-xs transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#2D806B]" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-4 rounded-2xl bg-[#EAF7EF] border border-[#CDE5D6] text-xs text-[#2D806B] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#2D806B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#064E45]">CSV Format Requirements:</p>
          <p className="text-[#2D806B]/90 leading-relaxed">
            Your file must have a header row with columns:{' '}
            <code className="bg-white px-1.5 py-0.5 rounded text-[#064E45] font-mono border border-[#CDE5D6]">
              register_number
            </code>
            ,{' '}
            <code className="bg-white px-1.5 py-0.5 rounded text-[#064E45] font-mono border border-[#CDE5D6]">
              name
            </code>
            , and optional{' '}
            <code className="bg-white px-1.5 py-0.5 rounded text-[#064E45] font-mono border border-[#CDE5D6]">
              github_link
            </code>
            . Header names are flexible (e.g. <span className="font-mono">reg_no</span>,{' '}
            <span className="font-mono">name</span>, <span className="font-mono">github</span>).
          </p>
        </div>
      </div>

      {/* Upload & Configuration Card */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-[#DDE8DF] gap-4">
            <button
              onClick={() => {
                setActiveTab('file');
                handleReset();
              }}
              className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'file'
                  ? 'border-[#2D806B] text-[#064E45]'
                  : 'border-transparent text-[#71817B] hover:text-[#064E45]'
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
              className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'paste'
                  ? 'border-[#2D806B] text-[#064E45]'
                  : 'border-transparent text-[#71817B] hover:text-[#064E45]'
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
                  ? 'border-[#2D806B] bg-[#EAF7EF]'
                  : selectedFile
                  ? 'border-[#2D9B70]/60 bg-[#EAF7EF]'
                  : 'border-[#CDE5D6] hover:border-[#2D806B] bg-[#FAF8F0] hover:bg-[#EAF7EF]'
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
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#CDE5D6] flex items-center justify-center text-[#2D9B70]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[#064E45]">{selectedFile.name}</p>
                  <p className="text-xs text-[#71817B]">
                    {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click or drag to replace
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#CDE5D6] flex items-center justify-center text-[#2D806B]">
                    <UploadCloud className="w-6 h-6 text-[#2D806B]" />
                  </div>
                  <p className="text-sm font-medium text-[#172E2A]">
                    Drag and drop your student CSV file here, or{' '}
                    <span className="text-[#2D806B] underline font-bold">browse</span>
                  </p>
                  <p className="text-xs text-[#71817B]">Supports .csv files up to 5MB</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Paste Raw CSV */}
          {activeTab === 'paste' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#064E45]">
                Paste CSV Rows with Header
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder="register_number,name,github_link&#10;AI2026001,Aarav Patel,https://github.com/aarav&#10;AI2026002,Diya Sharma,https://github.com/diya"
                rows={6}
                className="w-full px-4 py-3 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl font-mono text-xs text-[#172E2A] focus:outline-none focus:border-[#2D806B] focus:ring-2 focus:ring-[#2D806B]/20"
              />
            </div>
          )}

          {/* Configuration Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#DDE8DF]">
            <div>
              <label className="text-xs font-bold text-[#064E45] block mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#2D806B]" />
                <span>Default Initial Password</span>
              </label>
              <PasswordInput
                value={defaultPassword}
                onChange={(e) => setDefaultPassword(e.target.value)}
                placeholder="Student@123"
                autoComplete="new-password"
                className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF] text-xs text-[#172E2A] font-mono focus:outline-none focus:border-[#2D806B] focus:ring-2 focus:ring-[#2D806B]/20"
              />
              <p className="text-[11px] text-[#71817B] mt-1">
                Used if no password column is present in the CSV. Students must change this password
                on their first login.
              </p>
            </div>

            <div className="space-y-3 flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={updateExisting}
                  onChange={(e) => setUpdateExisting(e.target.checked)}
                  className="rounded border-[#CDE5D6] bg-white text-[#2D806B] focus:ring-[#2D806B] h-4 w-4"
                />
                <span className="text-xs text-[#172E2A]">
                  Update existing students if register number already exists
                </span>
              </label>
              <p className="text-[11px] text-[#71817B]">
                When unchecked, existing register numbers are safely skipped without overwriting
                existing data.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Live Preview Section */}
      {previewRows.length > 0 && !importResult && (
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE8DF]">
            <div>
              <h2 className="text-base font-bold text-[#064E45] flex items-center gap-2">
                <span>CSV Preview</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF7EF] text-[#2D806B] border border-[#CDE5D6]">
                  {parseStats.total} rows detected
                </span>
              </h2>
              <p className="text-xs text-[#71817B] mt-0.5">
                Review data before importing into your database.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#EAF7EF] text-[#064E45] border border-[#DDE8DF] text-xs font-bold transition-colors"
              >
                Clear
              </button>

              <button
                onClick={handleImport}
                disabled={importing || parseStats.valid === 0}
                className="px-5 py-2 rounded-xl bg-[#064E45] hover:bg-[#085f54] disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-2"
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
          <div className="overflow-x-auto rounded-xl border border-[#DDE8DF] max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#FAF8F0] border-b border-[#DDE8DF] text-[11px] font-bold uppercase tracking-wider text-[#71817B]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Register Number</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">GitHub Repository</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBF2EC] text-[#172E2A]">
                {previewRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-[#F4FAF6] ${
                      row.status === 'invalid'
                        ? 'bg-[#FFF0ED]'
                        : row.status === 'duplicate'
                        ? 'bg-[#FFF8EA]'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-[#71817B]">{row.rowNumber}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#2D806B]">
                      {row.registerNumber || <span className="text-[#E86A5B] italic">Missing</span>}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#172E2A]">
                      {row.name || <span className="text-[#E86A5B] italic">Missing</span>}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#71817B]">
                      {row.githubRepoUrl ? (
                        <span className="truncate max-w-xs block text-[#172E2A]">
                          {row.githubRepoUrl}
                        </span>
                      ) : (
                        <span className="text-[#A3B2AC] italic">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {row.status === 'valid' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D9B70] bg-[#EAF7EF] px-2 py-0.5 rounded border border-[#CDE5D6]">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E86A5B] bg-[#FFF0ED] px-2 py-0.5 rounded border border-[#FAD3CC]">
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
        <Card className="p-6 space-y-6 border-[#CDE5D6]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE8DF]">
            <div>
              <h2 className="text-lg font-bold text-[#064E45] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#2D9B70]" />
                <span>CSV Import Complete</span>
              </h2>
              <p className="text-xs text-[#71817B] mt-1">
                Processed {importResult.totalProcessed} records from CSV.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF7EF] text-[#064E45] border border-[#DDE8DF] text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Import Another File</span>
              </button>

              <button
                onClick={() => navigate('/admin/students')}
                className="px-4 py-2 rounded-xl bg-[#064E45] hover:bg-[#085f54] text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>View Students</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#EAF7EF] border border-[#CDE5D6] text-center">
              <p className="text-2xl font-bold text-[#2D9B70]">{importResult.createdCount}</p>
              <p className="text-xs text-[#2D9B70]/80 font-medium mt-0.5">Students Created</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#EAF7EF] border border-[#CDE5D6] text-center">
              <p className="text-2xl font-bold text-[#2D806B]">{importResult.updatedCount}</p>
              <p className="text-xs text-[#2D806B]/80 font-medium mt-0.5">Updated</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF8EA] border border-[#FCE6BD] text-center">
              <p className="text-2xl font-bold text-[#D88918]">{importResult.skippedCount}</p>
              <p className="text-xs text-[#D88918]/80 font-medium mt-0.5">Skipped (Duplicates)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF0ED] border border-[#FAD3CC] text-center">
              <p className="text-2xl font-bold text-[#E86A5B]">{importResult.errorCount}</p>
              <p className="text-xs text-[#E86A5B]/80 font-medium mt-0.5">Errors</p>
            </div>
          </div>

          {/* Created Students List */}
          {importResult.created.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D9B70]">
                Newly Added Students ({importResult.created.length})
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-1.5 rounded-xl border border-[#DDE8DF] bg-[#FAF8F0] p-2 text-xs">
                {importResult.created.map((s) => (
                  <div
                    key={s._id}
                    className="p-2.5 rounded-lg bg-white border border-[#DDE8DF] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#2D806B]">{s.registerNumber}</span>
                      <span className="font-medium text-[#172E2A]">{s.name}</span>
                    </div>
                    {s.githubRepoUrl && (
                      <a
                        href={s.githubRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#71817B] hover:text-[#2D806B] flex items-center gap-1 font-mono text-[11px]"
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#D88918]">
                Skipped Rows ({importResult.skipped.length})
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-[#FCE6BD] bg-[#FFF8EA] p-2 text-xs">
                {importResult.skipped.map((sk, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-white border border-[#FCE6BD] text-[#A86B0F] flex items-center justify-between"
                  >
                    <span>
                      Row {sk.row}: <strong className="font-mono">{sk.registerNumber}</strong> (
                      {sk.name})
                    </span>
                    <span className="text-[11px] text-[#D88918] font-medium">{sk.reason}</span>
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
