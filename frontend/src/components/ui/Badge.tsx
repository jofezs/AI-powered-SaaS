import { TaskStatus, TaskPriority } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
}

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const map: Record<TaskStatus, string> = {
    todo: 'badge-todo',
    in_progress: 'badge-in-progress',
    done: 'badge-done',
  };

  const labels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
  };

  return <span className={map[status]}>{labels[status]}</span>;
};

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const map: Record<TaskPriority, string> = {
    low: 'badge-low',
    medium: 'badge-medium',
    high: 'badge-high',
  };

  const labels: Record<TaskPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  return <span className={map[priority]}>{labels[priority]}</span>;
};