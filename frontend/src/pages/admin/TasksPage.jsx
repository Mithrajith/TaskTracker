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

  // Backfill state
  const [backfillTarget, setBackfillTarget] = useState(null);
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillResult, setBackfillResult] = useState(null);

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

  const handleBackfillConfirm = async () => {
    if (!backfillTarget) return;
    setBackfillLoading(true);
    try {
      const res = await apiClient.post(`/tasks/${backfillTarget._id}/backfill`);
      if (res.data?.success) {
        setBackfillResult(res.data.data);
        setBackfillTarget(null);
        fetchTasks();
        success(res.data.message);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Backfill failed');
    } finally {
      setBackfillLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#064E45] flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#064E45]" />
            <span>Dynamic Daily Practical Tasks</span>
          </h1>
          <p className="text-sm text-[#71817B] mt-1">
            Author sequential practical tasks. Publishing assigns tasks strictly to students who
            completed preceding work.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#064E45] hover:bg-[#053d36] text-white font-bold text-xs transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#064E45]" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-[#DDE8DF] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#064E45]">No Tasks Created Yet</h3>
          <p className="text-xs text-[#71817B] mt-1 max-w-sm mx-auto">
            Get started by creating Task #1 to initiate the AI Engineer practical roadmap for your
            students.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-[#064E45] hover:bg-[#053d36] text-xs font-bold text-white rounded-xl shadow-sm"
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
                  isDraft ? 'border-dashed border-[#DDE8DF] bg-[#FAF8F0]' : 'bg-white'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DDE8DF]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#064E45] bg-[#EAF7EF] px-2.5 py-0.5 rounded-md border border-[#DDE8DF]">
                        Task #{task.taskNumber}
                      </span>
                      <Badge status={task.status} />
                      {task.deadline && (
                        <span className="text-xs text-[#71817B] font-medium flex items-center gap-1 bg-[#FAF8F0] px-2.5 py-0.5 rounded-md border border-[#DDE8DF]">
                          <Calendar className="w-3.5 h-3.5 text-[#064E45]" />
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-[#064E45]">{task.title}</h2>
                  </div>

                  {/* Task Management Actions */}
                  <div className="flex items-center gap-2 self-start lg:self-auto">
                    {isDraft ? (
                      <>
                        <button
                          onClick={() => handlePreviewEligible(task)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-[#EAF7EF] text-[#064E45] border border-[#DDE8DF] flex items-center gap-1.5 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 text-[#064E45]" />
                          <span>Eligible ({stats.eligibleCount || 0})</span>
                        </button>

                        <button
                          onClick={() => setPublishTaskTarget(task)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FFA77E] hover:bg-[#ff9668] text-[#172E2A] flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish Task</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-[#2D9B70] bg-[#EAF7EF] px-3 py-1.5 rounded-xl border border-[#DDE8DF] flex items-center gap-1.5">
                          <span>Published</span>
                        </span>
                        <button
                          onClick={() => setBackfillTarget(task)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-[#FFF8EA] text-[#A86B0F] border border-[#FCE6BD] flex items-center gap-1.5 transition-colors"
                          title="Re-assign this task to all active students who don't have it yet"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Re-assign to All</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setEditTask(task)}
                      className="p-2 rounded-xl text-[#71817B] hover:text-[#064E45] hover:bg-[#EAF7EF] transition-colors"
                      title="Edit Task Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteTaskTarget(task)}
                      className="p-2 rounded-xl text-[#71817B] hover:text-[#E86A5B] hover:bg-[#FFF0ED] transition-colors"
                      title="Delete Task from Database"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description & Instructions Preview */}
                <div className="py-4 space-y-3">
                  <p className="text-xs text-[#172E2A] leading-relaxed">{task.description}</p>
                  <div className="bg-[#EAF7EF] rounded-xl p-3 border border-[#DDE8DF]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#064E45] block mb-1">
                      Instructions Preview
                    </span>
                    <pre className="text-xs font-mono text-[#172E2A] whitespace-pre-wrap line-clamp-3">
                      {task.instructions}
                    </pre>
                  </div>
                </div>

                {/* Statistics Footer */}
                <div className="pt-3 border-t border-[#DDE8DF] flex flex-wrap items-center gap-6 text-xs text-[#71817B]">
                  <div>
                    <span className="font-medium mr-1.5">Assigned:</span>
                    <span className="font-bold text-[#064E45]">
                      {stats.totalAssigned || 0} students
                    </span>
                  </div>
                  <div>
                    <span className="font-medium mr-1.5">Awaiting Review:</span>
                    <span className="font-bold text-[#F3B74F]">{stats.totalPending || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium mr-1.5">Approved:</span>
                    <span className="font-bold text-[#2D9B70]">{stats.totalApproved || 0}</span>
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
          danger={true}
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
              <Loader2 className="w-6 h-6 animate-spin text-[#064E45]" />
            </div>
          ) : eligibleStudentsList.length === 0 ? (
            <div className="text-center py-8 text-[#71817B] text-xs">
              <AlertCircle className="w-8 h-8 text-[#F3B74F] mx-auto mb-2" />
              <p>No students are currently eligible for this task.</p>
              <p className="text-[11px] text-[#71817B] mt-1">
                Students must have their previous task approved before receiving this task.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {eligibleStudentsList.map((st) => (
                <div
                  key={st._id}
                  className="p-3 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#064E45]">{st.name}</span>
                    <span className="text-[11px] font-mono text-[#2D806B] ml-2">
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

      {/* Backfill Confirmation Modal */}
      {backfillTarget && (
        <ConfirmationModal
          isOpen={!!backfillTarget}
          onClose={() => setBackfillTarget(null)}
          onConfirm={handleBackfillConfirm}
          title={`Re-assign Task #${backfillTarget.taskNumber} to All Students?`}
          message={`This will assign "${backfillTarget.title}" to every active student who doesn't have it yet. Students who already have this task (including those who submitted or were approved) will NOT be affected — their progress is fully preserved.`}
          confirmText="Re-assign to All"
          loading={backfillLoading}
        />
      )}

      {/* Backfill Result Modal */}
      {backfillResult && (
        <Modal
          isOpen={!!backfillResult}
          onClose={() => setBackfillResult(null)}
          title={`Backfill Complete — Task #${backfillResult.taskNumber}`}
          subtitle={backfillResult.taskTitle}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-[#EAF7EF] border border-[#DDE8DF] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#71817B] block">Total Students</span>
                <span className="text-2xl font-extrabold text-[#064E45]">{backfillResult.totalStudents}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#EAF7EF] border border-[#DDE8DF] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D9B70] block">Newly Assigned</span>
                <span className="text-2xl font-extrabold text-[#2D9B70]">{backfillResult.newlyAssigned}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F0] border border-[#DDE8DF] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#71817B] block">Already Had It</span>
                <span className="text-2xl font-extrabold text-[#71817B]">{backfillResult.alreadyHad}</span>
              </div>
            </div>

            {/* Newly Assigned List */}
            {backfillResult.newlyAssigned > 0 && (
              <div>
                <p className="text-xs font-bold text-[#064E45] mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2D9B70] inline-block" />
                  Newly Assigned ({backfillResult.newlyAssigned})
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-[#DDE8DF] bg-white p-2">
                  {backfillResult.newlyAssignedList.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#EAF7EF] text-xs">
                      <span className="font-semibold text-[#172E2A]">{s.name}</span>
                      <span className="font-mono text-[#064E45] text-[11px]">{s.registerNumber}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {backfillResult.newlyAssigned === 0 && (
              <div className="text-center py-4 text-xs text-[#71817B]">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-[#F3B74F]" />
                All active students already had this task assigned.
              </div>
            )}

            {backfillResult.failed > 0 && (
              <p className="text-xs text-[#E86A5B] font-medium">
                ⚠ {backfillResult.failed} assignment(s) failed. Check server logs.
              </p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setBackfillResult(null)}
                className="px-4 py-2 rounded-xl bg-[#064E45] text-white text-xs font-bold hover:bg-[#053d36] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
