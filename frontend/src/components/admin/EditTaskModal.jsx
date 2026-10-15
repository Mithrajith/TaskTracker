import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import apiClient from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { BookOpen, Calendar, AlertCircle } from 'lucide-react';

export const EditTaskModal = ({ isOpen, onClose, task, onUpdated }) => {
  const { success, error } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setInstructions(task.instructions || '');
      setDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '');
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !description.trim() || !instructions.trim()) {
      setFormError('Title, description, and instructions are required');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.put(`/tasks/${task._id}`, {
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        deadline: deadline ? new Date(deadline) : null,
      });

      if (res.data?.success) {
        success('Task updated successfully');
        onClose();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update task';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Task #${task.taskNumber}`}
      subtitle="Amend task details with submission history protection"
      maxWidth="max-w-2xl"
    >
      {formError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFF0ED] border border-[#FAD3CC] text-[#E86A5B] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#E86A5B]" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#064E45] mb-1.5">Task Title</label>
          <div className="relative">
            <BookOpen className="w-4 h-4 absolute left-3 top-3 text-[#2D806B]" />
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#A3B2AC] focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#064E45] mb-1.5">Description</label>
          <textarea
            rows={2}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] placeholder-[#A3B2AC] focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B] leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#064E45] mb-1.5">Instructions</label>
          <textarea
            rows={4}
            required
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-3 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-xs font-mono text-[#172E2A] placeholder-[#A3B2AC] focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B] leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#064E45] mb-1.5">Deadline</label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-3 text-[#2D806B]" />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F0] border border-[#DDE8DF] rounded-xl text-sm text-[#172E2A] focus:outline-none focus:ring-2 focus:ring-[#2D806B]/30 focus:border-[#2D806B]"
            />
          </div>
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
            className={`px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#064E45] hover:bg-[#085f54] transition-all ${
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
