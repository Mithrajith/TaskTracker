import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import apiClient from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { User, AlertCircle } from 'lucide-react';
import { Github } from '../common/Icons';

export const EditStudentModal = ({ isOpen, onClose, student, onUpdated }) => {
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setGithubRepoUrl(student.githubRepoUrl || '');
      setStatus(student.status || 'active');
    }
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Student name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.put(`/students/${student._id}`, {
        name: name.trim(),
        githubRepoUrl: githubRepoUrl.trim(),
        status,
      });

      if (res.data?.success) {
        success('Student updated successfully');
        onClose();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update student';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Student: ${student.registerNumber}`}
      subtitle="Update student details and account status"
      maxWidth="max-w-lg"
    >
      {formError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFF0ED] border border-[#FAD3CC] text-[#E86A5B] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#E86A5B]" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#064E45] mb-1.5">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-[#064E45]" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#064E45]/20 focus:border-[#064E45]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#064E45] mb-1.5">
            GitHub Repository URL{' '}
            <span className="text-[#71817B] font-medium">(optional)</span>
          </label>
          <div className="relative">
            <Github className="w-4 h-4 absolute left-3 top-3 text-[#064E45]" />
            <input
              type="url"
              value={githubRepoUrl}
              onChange={(e) => setGithubRepoUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#064E45]/20 focus:border-[#064E45]"
            />
          </div>
          <span className="text-[10px] text-[#71817B] mt-1 block">
            Student can also add or update this from their profile page.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#064E45] mb-1.5">Account Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2.5 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] focus:outline-none focus:ring-2 focus:ring-[#064E45]/20 focus:border-[#064E45]"
          >
            <option value="active">Active (Can log in & submit tasks)</option>
            <option value="inactive">Deactivated (Access revoked)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DDE8DF]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-bold text-[#71817B] hover:text-[#064E45] hover:bg-[#EAF7EF] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#064E45] hover:bg-[#053d36] transition-all shadow-sm ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
