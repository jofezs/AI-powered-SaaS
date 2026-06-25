import { Trash2, Calendar, ChevronRight } from 'lucide-react';
import type { Task } from '../../types';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { useTaskStore } from '../../store/taskStore';
import toast from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const { deleteTask } = useTaskStore();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteTask(task._id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  return (
    <div
      onClick={() => onClick(task)}
      className="card hover:border-accent/40 hover:bg-dark-hover cursor-pointer transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-gray-100 font-medium text-sm leading-snug flex-1">
          {task.title}
        </h3>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all duration-200 shrink-0"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-dark-border">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Calendar size={12} />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          {task.subtasks.length > 0 && (
            <span className="text-gray-500 text-xs">
              {completedSubtasks}/{task.subtasks.length} subtasks
            </span>
          )}
        </div>
        <ChevronRight
          size={14}
          className="text-gray-600 group-hover:text-accent transition-colors duration-200"
        />
      </div>
    </div>
  );
};

export default TaskCard;