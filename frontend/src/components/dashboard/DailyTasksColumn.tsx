import { useEffect, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useDailyTaskStore } from '../../store/dailyTaskStore';

const DailyTasksColumn = () => {
  const { tasks, addTask, toggleTask, deleteTask, resetIfNewDay } = useDailyTaskStore();
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    resetIfNewDay();
  }, [resetIfNewDay]);

  const handleAdd = () => {
    const t = newTitle.trim();
    if (!t) return;
    addTask(t);
    setNewTitle('');
    setAdding(false);
  };

  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div className="px-4 py-5 overflow-y-auto h-full">
      <div className="bg-white/70 rounded-lg px-3 py-3">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-parchment-border">
        <h2 className="text-bark-dark font-serif font-bold text-sm italic">
          Today's Tasks
        </h2>
        <p className="text-bark-pale text-[10px] font-sans mt-0.5">
          {completed}/{tasks.length} done ·{' '}
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Task list */}
      <div className="space-y-0.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 py-1.5 border-b border-parchment-line group"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="w-3.5 h-3.5 accent-bark-light flex-shrink-0 cursor-pointer"
            />
            <span
              className={`flex-1 text-xs font-serif leading-snug ${
                task.completed
                  ? 'line-through text-bark-pale'
                  : 'text-bark-darkest'
              }`}
            >
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-bark-pale hover:text-red-600 transition-all"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>

      {/* Add task */}
      {tasks.length < 10 && (
        <div className="mt-3">
          {adding ? (
            <div className="space-y-1.5">
              <input
                autoFocus
                type="text"
                className="input-parchment text-xs py-1.5"
                placeholder="Task name..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setAdding(false);
                }}
              />
              <div className="flex gap-1.5">
                <button onClick={handleAdd} className="btn-bark text-xs py-1 px-3">
                  Add
                </button>
                <button
                  onClick={() => setAdding(false)}
                  className="btn-bark-outline text-xs py-1 px-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-[11px] text-bark-pale hover:text-bark-light font-serif italic mt-1 transition-colors"
            >
              <Plus size={12} />
              add daily task ({10 - tasks.length} left)
            </button>
          )}
        </div>
      )}

      {tasks.length >= 10 && (
        <p className="text-[10px] text-bark-pale italic mt-3 font-serif">
          Daily limit of 10 reached.
        </p>
      )}
      </div>
    </div>
  );
};

export default DailyTasksColumn;