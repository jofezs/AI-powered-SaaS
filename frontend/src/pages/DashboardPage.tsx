import { useEffect, useState } from 'react';
import { Plus, MessageCircle } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DailyTasksColumn from '../components/dashboard/DailyTasksColumn';
import ProjectTaskCard from '../components/dashboard/ProjectTaskCard';
import CreateTaskModal from '../components/dashboard/CreateTaskModal';
import AIChatPanel from '../components/dashboard/AIChatPanel';
import { useTaskStore } from '../store/taskStore';

const DashboardPage = () => {
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Only non-done tasks shown as cards, sorted by priority then due date
  const projectTasks = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 };
      const pd = (pOrder[a.priority] ?? 1) - (pOrder[b.priority] ?? 1);
      if (pd !== 0) return pd;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return 0;
    });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main content area (offset sidebar) */}
      <div className="flex flex-1 ml-52 overflow-hidden lined-paper">

        {/* Daily tasks — equal half */}
        <div className="flex-1 overflow-y-auto border-r border-parchment-border">
          <DailyTasksColumn />
        </div>

        {/* Project tasks */}
        <div className={`flex-1 overflow-y-auto px-5 py-5 transition-all duration-300 ${aiOpen ? 'mr-80' : ''}`}>
          <div className="bg-white/70 rounded-lg px-3 py-3">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-parchment-border">
            <div>
              <h2 className="font-serif font-bold text-bark-dark text-sm italic">Project Tasks</h2>
              <p className="text-[10px] text-bark-pale font-sans mt-0.5">{projectTasks.length} tasks</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-bark flex items-center gap-1.5 text-xs py-1.5 px-3"
            >
              <Plus size={13} />
              New Task
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-parchment-dark rounded animate-pulse" />
              ))}
            </div>
          ) : projectTasks.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-serif italic text-bark-pale text-sm">No project tasks yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-bark mt-3 text-xs py-1.5 px-4 flex items-center gap-1.5 mx-auto"
              >
                <Plus size={13} />
                Create your first task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {projectTasks.map((task) => (
                <ProjectTaskCard key={task.id} task={task} />  // ← was task._id
              ))}
            </div>
          )}
          </div>
        </div>

        {/* AI Chat Panel */}
        {aiOpen && (
          <div className="w-80 flex-shrink-0 fixed right-0 top-0 h-full z-40">
            <AIChatPanel onClose={() => setAiOpen(false)} />
          </div>
        )}

        {/* AI Bubble */}
        {!aiOpen && (
          <button
            onClick={() => setAiOpen(true)}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-bark-dark hover:bg-bark-darkest text-bark-cream font-serif text-xs px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 border border-bark-mid"
          >
            <MessageCircle size={14} />
            Ask AI
            <span className="w-2 h-2 bg-bark-pale rounded-full animate-pulse" />
          </button>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default DashboardPage;