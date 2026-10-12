import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import apiClient from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { User, Hash, Lock, AlertCircle } from 'lucide-react';
import { Github } from '../common/Icons';

export const CreateStudentModal = ({ isOpen, onClose, onCreated }) => {
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [initialPassword, setInitialPassword] = useState('WelcomeAI2026!');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !registerNumber.trim() || !initialPassword) {
      setFormError('Name, register number, and initial password are required');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/students', {
        name: name.trim(),
        registerNumber: registerNumber.trim().toUpperCase(),
        githubRepoUrl: githubRepoUrl.trim(),
        initialPassword,
      });

      if (res.data?.success) {
        success(`Student ${registerNumber.toUpperCase()} created successfully!`);
        setName('');
        setRegisterNumber('');
        setGithubRepoUrl('');
        setInitialPassword('WelcomeAI2026!');
        onClose();
        if (onCreated) onCreated();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create student account';
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
      title="Create Student Account"
      subtitle="Register a new student for the AI Engineer roadmap"
      maxWidth="max-w-lg"
    >
      {formError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Student Full Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Register / Student ID <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              required
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              placeholder="e.g. AI2026005"
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Used as the login username. Must be unique.
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Student GitHub Repository URL
          </label>
          <div className="relative">
            <Github className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="url"
              value={githubRepoUrl}
              onChange={(e) => setGithubRepoUrl(e.target.value)}
              placeholder="https://github.com/username/ai-engineer-roadmap"
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Initial Temporary Password <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              required
              minLength={6}
              value={initialPassword}
              onChange={(e) => setInitialPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 font-mono"
            />
          </div>
          <span className="text-[10px] text-amber-400/90 mt-1 block">
            Student will be required to change this password on their first login.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating...' : 'Create Student'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
