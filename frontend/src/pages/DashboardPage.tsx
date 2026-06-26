import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { TaskStatus, TaskPriority } from '../types';

const DashboardPage = () => {
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === TaskStatus.TODO).length;
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const doneTasks = tasks.filter((t) => t.status === TaskStatus.DONE).length;
  const highPriorityTasks = tasks.filter(
    (t) => t.priority === TaskPriority.HIGH && t.status !== TaskStatus.DONE
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: CheckSquare,
      color: 'text-accent-light',
      bg: 'bg-accent/10',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-900/20',
    },
    {
      label: 'High Priority',
      value: highPriorityTasks,
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-900/20',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-900/20',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here's an overview of your tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${bg} p-3 rounded-lg`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium">{label}</p>
              <p className="text-white text-2xl font-bold">{isLoading ? '—' : value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Overall Progress</h2>
          <span className="text-gray-500 text-xs">{doneTasks} of {totalTasks} completed</span>
        </div>
        <div className="w-full bg-dark-hover rounded-full h-1.5">
          <div
            className="bg-accent h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-xs text-gray-500">
          <span>{todoTasks} to do</span>
          <span>{inProgressTasks} in progress</span>
          <span>{doneTasks} done</span>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Recent Tasks</h2>
          <button
            onClick={() => navigate('/tasks')}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            View all
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-dark-hover rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No tasks yet.</p>
            <button
              onClick={() => navigate('/tasks')}
              className="btn-primary mt-3 text-sm"
            >
              Create your first task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTasks.map((task) => (
              <div
                key={task._id}
                onClick={() => navigate('/tasks')}
                className="flex items-center justify-between p-3 rounded-lg bg-dark-hover hover:bg-dark-border cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      task.status === TaskStatus.DONE
                        ? 'bg-emerald-400'
                        : task.status === TaskStatus.IN_PROGRESS
                        ? 'bg-accent-light'
                        : 'bg-gray-600'
                    }`}
                  />
                  <span className="text-gray-300 text-sm truncate">{task.title}</span>
                </div>
                <span
                  className={`text-xs shrink-0 ml-3 ${
                    task.priority === TaskPriority.HIGH
                      ? 'text-red-400'
                      : task.priority === TaskPriority.MEDIUM
                      ? 'text-amber-400'
                      : 'text-gray-600'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;