import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { CreateTaskModal } from '../../components/admin/CreateTaskModal';
import { EditTaskModal } from '../../components/admin/EditTaskModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  CheckSquare,
  Plus,
  Calendar,
  Send,
  Edit2,
  Trash2,
  Users,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const TasksPage = () => {
  const { success, error } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [publishTaskTarget, setPublishTaskTarget] = useState(null);
  const [publishingLoading, setPublishingLoading] = useState(false);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Eligible students modal
  const [eligiblePreviewTask, setEligiblePreviewTask] = useState(null);
  const [eligibleStudentsList, setEligibleStudentsList] = useState([]);
  const [loadingEligible, setLoadingEligible] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/tasks');
      if (res.data?.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handlePublishConfirm = async () => {
    if (!publishTaskTarget) return;
    setPublishingLoading(true);
    try {
      const res = await apiClient.post(`/tasks/${publishTaskTarget._id}/publish`);
      if (res.data?.success) {
        success(res.data.message || 'Task published successfully!');
        setPublishTaskTarget(null);
        fetchTasks();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to publish task');
    } finally {
      setPublishingLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTaskTarget) return;
    setDeleteLoading(true);
    try {
      const res = await apiClient.delete(`/tasks/${deleteTaskTarget._id}`);
      if (res.data?.success) {
        success(res.data.message || 'Task deleted successfully from database');
        setDeleteTaskTarget(null);
        fetchTasks();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePreviewEligible = async (task) => {
    setEligiblePreviewTask(task);
    setLoadingEligible(true);
    try {
      const res = await apiClient.get(`/tasks/${task._id}/eligible-students`);
      if (res.data?.success) {
        setEligibleStudentsList(res.data.data);
      }
    } catch (err) {
      error('Failed to load eligible students');
    } finally {
      setLoadingEligible(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-purple-400" />
            <span>Dynamic Daily Practical Tasks</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Author sequential practical tasks. Publishing assigns tasks strictly to students who completed preceding work.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">
            No Tasks Created Yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Get started by creating Task #1 to initiate the AI Engineer practical roadmap for your students.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white rounded-xl"
          >
            Create Task #1
          </button>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const stats = task.stats || {};
            const isDraft = task.status === 'draft';

            return (
              <Card
                key={task._id}
                className={`transition-all ${
                  isDraft
                    ? 'border-dashed border-slate-700/80 bg-slate-900/60'
                    : 'border-slate-800 bg-slate-900/90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded-md border border-purple-800/40">
                        Task #{task.taskNumber}
                      </span>
                      <Badge status={task.status} />
                      {task.deadline && (
                        <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-950/50 px-2.5 py-0.5 rounded-md border border-slate-800">
                          <Calendar className="w-3.5 h-3.5" />
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">
                      {task.title}
                    </h2>
                  </div>

                  {/* Task Management Actions */}
                  <div className="flex items-center gap-2 self-start lg:self-auto">
                    {isDraft ? (
                      <>
                        <button
                          onClick={() => handlePreviewEligible(task)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Eligible Students ({stats.eligibleCount || 0})</span>
                        </button>

                        <button
                          onClick={() => setPublishTaskTarget(task)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish Task</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-emerald-400/90 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/40 flex items-center gap-1.5 font-medium">
                        <span>Published</span>
                      </span>
                    )}

                    <button
                      onClick={() => setEditTask(task)}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-300 hover:bg-slate-800 transition-colors"
                      title="Edit Task Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteTaskTarget(task)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Task from Database"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description & Instructions Preview */}
                <div className="py-4 space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {task.description}
                  </p>
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-300 block mb-1">
                      Instructions Preview
                    </span>
                    <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap line-clamp-3">
                      {task.instructions}
                    </pre>
                  </div>
                </div>

                {/* Statistics Footer */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-500 mr-1.5">Assigned:</span>
                    <span className="font-semibold text-slate-200">
                      {stats.totalAssigned || 0} students
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 mr-1.5">Awaiting Review:</span>
                    <span className="font-semibold text-amber-400">
                      {stats.totalPending || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 mr-1.5">Approved:</span>
                    <span className="font-semibold text-emerald-400">
                      {stats.totalApproved || 0}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchTasks}
      />

      {editTask && (
        <EditTaskModal
          isOpen={!!editTask}
          onClose={() => setEditTask(null)}
          task={editTask}
          onUpdated={fetchTasks}
        />
      )}

      {publishTaskTarget && (
        <ConfirmationModal
          isOpen={!!publishTaskTarget}
          onClose={() => setPublishTaskTarget(null)}
          onConfirm={handlePublishConfirm}
          title={`Publish Task #${publishTaskTarget.taskNumber}?`}
          message={`Publishing "${publishTaskTarget.title}" will automatically assign and unlock this task for all eligible students who have successfully completed Task #${publishTaskTarget.taskNumber - 1}. Students still working on previous tasks will unlock it once their work is approved.`}
          confirmText="Publish & Assign"
          loading={publishingLoading}
        />
      )}

      {deleteTaskTarget && (
        <ConfirmationModal
          isOpen={!!deleteTaskTarget}
          onClose={() => setDeleteTaskTarget(null)}
          onConfirm={handleDeleteConfirm}
          title={`Delete Task #${deleteTaskTarget.taskNumber}?`}
          message={`Are you sure you want to permanently delete "${deleteTaskTarget.title}" from the database? This will also remove any student assignments and submissions associated with it.`}
          confirmText="Delete Task"
          confirmVariant="danger"
          loading={deleteLoading}
        />
      )}

      {/* Eligible Students Preview Modal */}
      {eligiblePreviewTask && (
        <Modal
          isOpen={!!eligiblePreviewTask}
          onClose={() => setEligiblePreviewTask(null)}
          title={`Eligible Students for Task #${eligiblePreviewTask.taskNumber}`}
          subtitle="Students who have satisfied all preceding requirements"
          maxWidth="max-w-lg"
        >
          {loadingEligible ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          ) : eligibleStudentsList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
              <p>No students are currently eligible for this task.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Students must have their previous task approved before receiving this task.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {eligibleStudentsList.map((st) => (
                <div
                  key={st._id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-100">
                      {st.name}
                    </span>
                    <span className="text-[11px] font-mono text-purple-400 ml-2">
                      ({st.registerNumber})
                    </span>
                  </div>
                  <Badge status="active" />
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

