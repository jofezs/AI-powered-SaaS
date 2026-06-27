import { Calendar, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import toast from 'react-hot-toast';
import ConfirmationModal from '../ui/ConfirmationModal';

interface Props {
  task: Task;
}

const priorityColor: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-green-600',
};

const ProjectTaskCard = ({ task }: Props) => {
  const { updateTask, deleteTask } = useTaskStore();
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const completedCount = task.subtasks.filter((s) => s.completed).length;
  const total = task.subtasks.length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const taskId = task.id ?? '';
  
  const handleSubtaskToggle = async (index: number) => {
    const updated = task.subtasks.map((s, i) =>
      i === index ? { ...s, completed: !s.completed } : s
    );
    try {
      await updateTask(taskId, { subtasks: updated });
    } catch {
      toast.error('Failed to update subtask');
    }
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateTask(taskId, { status: 'done' });
      toast.success('Task completed');
    } catch {
      toast.error('Failed to complete task');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      className={`card-task border-l-4 ${priorityColor[task.priority] ?? 'border-l-bark-mid'} group`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs font-serif font-semibold text-bark-darkest leading-snug flex-1">
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
          <button
            onClick={handleComplete}
            className="text-bark-pale hover:text-green-600 transition-colors"
            title="Mark completed"
          >
            <Check size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="text-bark-pale hover:text-red-600 transition-colors"
            title="Delete task"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        <span className={`badge-${task.priority}`}>{task.priority}</span>
        {task.dueDate && (
          <span
            className={`flex items-center gap-1 text-[10px] font-sans px-2 py-0.5 rounded-full ${
              isOverdue
                ? 'bg-red-100 text-red-700'
                : 'bg-parchment-dark text-bark-mid'
            }`}
          >
            <Calendar size={9} />
            {formatDate(task.dueDate)}
          </span>
        )}
        {task.status === 'done' && (
          <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-green-100 text-green-800">
            done
          </span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-[9px] font-sans text-bark-pale">
              {completedCount}/{total} subtasks
            </span>
            <span className="text-[9px] font-sans text-bark-light font-semibold">
              {progress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-parchment-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-bark-light rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtasks toggle */}
      {total > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] text-bark-pale hover:text-bark-light font-sans mt-1 transition-colors"
        >
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {expanded ? 'hide' : 'show'} subtasks
        </button>
      )}

      {expanded && (
        <div className="mt-2 space-y-1.5 pl-1 border-l border-parchment-border">
          {task.subtasks.map((sub, i) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sub.completed}
                onChange={() => handleSubtaskToggle(i)}
                className="w-3 h-3 accent-bark-light"
              />
              <span
                className={`text-[11px] font-serif ${
                  sub.completed ? 'line-through text-bark-pale' : 'text-bark-darkest'
                }`}
              >
                {sub.title}
              </span>
            </label>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default ProjectTaskCard;