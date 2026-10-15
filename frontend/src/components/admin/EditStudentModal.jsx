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
          <label className="block text-xs font-bold text-[#233DFF] mb-1.5">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-[#233DFF]" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F5F0E8] border border-[#D6CEC1] rounded-xl text-sm text-[#242424] placeholder-[#9A9890] focus:outline-none focus:ring-2 focus:ring-[#233DFF]/30 focus:border-[#233DFF]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#233DFF] mb-1.5">
            GitHub Repository URL{' '}
            <span className="text-[#77766F] font-medium">(optional)</span>
          </label>
          <div className="relative">
            <Github className="w-4 h-4 absolute left-3 top-3 text-[#233DFF]" />
            <input
              type="url"
              value={githubRepoUrl}
              onChange={(e) => setGithubRepoUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full pl-9 pr-3 py-2 bg-[#F5F0E8] border border-[#D6CEC1] rounded-xl text-sm text-[#242424] placeholder-[#9A9890] focus:outline-none focus:ring-2 focus:ring-[#233DFF]/30 focus:border-[#233DFF]"
            />
          </div>
          <span className="text-[10px] text-[#77766F] mt-1 block">
            Student can also add or update this from their profile page.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#233DFF] mb-1.5">Account Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2.5 bg-[#F5F0E8] border border-[#D6CEC1] rounded-xl text-sm text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#233DFF]/30 focus:border-[#233DFF]"
          >
            <option value="active">Active (Can log in & submit tasks)</option>
            <option value="inactive">Deactivated (Access revoked)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D6CEC1]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-bold text-[#77766F] hover:text-[#233DFF] hover:bg-[#E5DED2] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#233DFF] hover:bg-[#1B2FCC] transition-all ${
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
