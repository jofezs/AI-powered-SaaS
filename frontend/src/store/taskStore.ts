import { create } from 'zustand';
import api from '../lib/axios';
import type { Task, TaskStatus, TaskPriority } from '../types';

interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

interface UpdateTaskInput extends Partial<CreateTaskInput> {
  subtasks?: { title: string; completed: boolean }[];
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/tasks');
      set({ tasks: res.data.data.tasks, isLoading: false });
    } catch {
      set({ error: 'Failed to fetch tasks', isLoading: false });
    }
  },

  createTask: async (input) => {
    try {
      const res = await api.post('/tasks', input);
      set((state) => ({
        tasks: [res.data.data.task, ...state.tasks],
      }));
    } catch {
      set({ error: 'Failed to create task' });
      throw new Error('Failed to create task');
    }
  },

  updateTask: async (id, input) => {
    try {
      const res = await api.patch(`/tasks/${id}`, input);
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t._id === id ? res.data.data.task : t
        ),
      }));
    } catch {
      set({ error: 'Failed to update task' });
      throw new Error('Failed to update task');
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t._id !== id),
      }));
    } catch {
      set({ error: 'Failed to delete task' });
      throw new Error('Failed to delete task');
    }
  },
}));