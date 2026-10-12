import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import apiClient from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { BookOpen, Calendar, AlertCircle, Sparkles } from 'lucide-react';

export const CreateTaskModal = ({ isOpen, onClose, onCreated }) => {
  const { success, error } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('draft'); // draft or published
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !description.trim() || !instructions.trim()) {
      setFormError('Title, description, and practical instructions are required');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/tasks', {
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        deadline: deadline ? new Date(deadline) : null,
        status,
      });

      if (res.data?.success) {
        success(res.data.message || 'Task created successfully!');
        setTitle('');
        setDescription('');
        setInstructions('');
        setDeadline('');
        setStatus('draft');
        onClose();
        if (onCreated) onCreated();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create task';
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
      title="Create Dynamic Practical Task"
      subtitle="Define daily AI Engineer tasks with clear steps and guidelines"
      maxWidth="max-w-2xl"
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
            Task Title <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <BookOpen className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement LoRA Fine-Tuning for Llama-3"
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            High-Level Objective & Overview <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={2}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly explain the practical objective of this task..."
            className="w-full p-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Detailed Step-by-Step Instructions & Proof Requirements <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="1. Clone repository...\n2. Run benchmark script...\n3. Take a screenshot showing tensor dimensions and execution latency."
            className="w-full p-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Deadline (Optional)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            >
              <option value="draft">Save as Draft (Private to mentor)</option>
              <option value="published">Publish Now (Assign to eligible students)</option>
            </select>
          </div>
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
            {loading ? 'Creating Task...' : status === 'published' ? 'Create & Publish' : 'Save Draft'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

