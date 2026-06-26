import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import TaskCard from '../components/tasks/TaskCard';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import { TaskStatus, TaskPriority } from '../types';
import type { Task, TaskStatus as TaskStatusType, TaskPriority as TaskPriorityType } from '../types';

type FilterStatus = TaskStatusType | 'all';
type FilterPriority = TaskPriorityType | 'all';

const TasksPage = () => {
  const { tasks, fetchTasks, isLoading, updateTask } = useTaskStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleSubtaskToggle = async (taskId: string, subtaskIndex: number) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;
    const updatedSubtasks = task.subtasks.map((s, i) =>
      i === subtaskIndex ? { ...s, completed: !s.completed } : s
    );
    await updateTask(taskId, { subtasks: updatedSubtasks });
    setSelectedTask((prev) =>
      prev ? { ...prev, subtasks: updatedSubtasks } : null
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            {filterStatus !== 'all' || filterPriority !== 'all' || search ? ' found' : ' total'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            className="input pl-9 py-2 text-sm"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <select
          className="input w-auto py-2 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
        >
          <option value="all">All Statuses</option>
          <option value={TaskStatus.TODO}>To Do</option>
          <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
          <option value={TaskStatus.DONE}>Done</option>
        </select>

        {/* Priority filter */}
        <select
          className="input w-auto py-2 text-sm"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
        >
          <option value="all">All Priorities</option>
          <option value={TaskPriority.HIGH}>High</option>
          <option value={TaskPriority.MEDIUM}>Medium</option>
          <option value={TaskPriority.LOW}>Low</option>
        </select>
      </div>

      {/* Task Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-dark-hover" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-gray-400 font-medium mb-1">No tasks found</p>
          <p className="text-gray-600 text-sm mb-4">
            {search || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'Try adjusting your filters.'
              : 'Create your first task to get started.'}
          </p>
          {!search && filterStatus === 'all' && filterPriority === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={15} />
              New Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={handleTaskClick} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-dark-border">
              <h2 className="text-white font-semibold text-lg">{selectedTask.title}</h2>
              {selectedTask.description && (
                <p className="text-gray-400 text-sm mt-2">{selectedTask.description}</p>
              )}
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div className="flex gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Status</p>
                  <span className={`badge-${selectedTask.status.replace('_', '-')}`}>
                    {selectedTask.status === TaskStatus.TODO
                      ? 'To Do'
                      : selectedTask.status === TaskStatus.IN_PROGRESS
                      ? 'In Progress'
                      : 'Done'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Priority</p>
                  <span className={`badge-${selectedTask.priority}`}>
                    {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                  </span>
                </div>
                {selectedTask.dueDate && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Due Date</p>
                    <p className="text-gray-300 text-sm">
                      {new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Subtasks */}
              {selectedTask.subtasks.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs mb-2">
                    Subtasks ({selectedTask.subtasks.filter((s) => s.completed).length}/
                    {selectedTask.subtasks.length})
                  </p>
                  <div className="space-y-2">
                    {selectedTask.subtasks.map((subtask, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => handleSubtaskToggle(selectedTask._id, i)}
                          className="w-4 h-4 rounded accent-indigo-500"
                        />
                        <span
                          className={`text-sm transition-colors ${
                            subtask.completed
                              ? 'text-gray-600 line-through'
                              : 'text-gray-300'
                          }`}
                        >
                          {subtask.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setSelectedTask(null)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;