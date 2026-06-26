import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { TaskStatus, TaskPriority } from '../../types';
import type { TaskPriority as TP, TaskStatus as TS } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
}

const CreateTaskModal = ({ onClose }: Props) => {
  const { createTask } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [form, setForm] = useState<{
    title: string;
    description: string;
    priority: TP;
    status: TS;
    dueDate: string;
    subtasks: string[];
  }>({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    dueDate: '',
    subtasks: [],
  });

  const addSubtask = () => {
    const t = subtaskInput.trim();
    if (!t) return;
    setForm((f) => ({ ...f, subtasks: [...f.subtasks, t] }));
    setSubtaskInput('');
  };

  const removeSubtask = (i: number) => {
    setForm((f) => ({ ...f, subtasks: f.subtasks.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setIsLoading(true);
    try {
      await createTask({
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || undefined,
        subtasks: form.subtasks.map((t) => ({ title: t, completed: false })),
      });
      toast.success('Task created');
      onClose();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-bark-darkest/50 flex items-center justify-center z-50 p-4">
      <div className="bg-parchment border border-parchment-border rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-parchment-border">
          <h2 className="font-serif font-bold text-bark-dark text-base italic">
            New Project Task
          </h2>
          <button onClick={onClose} className="text-bark-pale hover:text-bark-dark">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-serif text-bark-mid mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input-parchment"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-serif text-bark-mid mb-1">Description</label>
            <textarea
              className="input-parchment resize-none"
              rows={2}
              placeholder="Optional details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-serif text-bark-mid mb-1">Priority</label>
              <select
                className="input-parchment"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TP })}
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-serif text-bark-mid mb-1">Due Date</label>
              <input
                type="date"
                className="input-parchment"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-serif text-bark-mid mb-1">
              Subtasks (progress auto-calculated)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="input-parchment flex-1 text-xs py-1.5"
                placeholder="Add a subtask..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
              />
              <button type="button" onClick={addSubtask} className="btn-bark px-2 py-1">
                <Plus size={14} />
              </button>
            </div>
            {form.subtasks.length > 0 && (
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {form.subtasks.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-parchment-dark rounded px-2 py-1">
                    <span className="flex-1 text-[11px] font-serif text-bark-darkest">{s}</span>
                    <button type="button" onClick={() => removeSubtask(i)} className="text-bark-pale hover:text-red-600">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-bark-outline flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-bark flex-1 disabled:opacity-50">
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;