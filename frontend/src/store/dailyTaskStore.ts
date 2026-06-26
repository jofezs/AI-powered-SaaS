import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
}

interface DailyTaskState {
  tasks: DailyTask[];
  lastReset: string; // ISO date string YYYY-MM-DD
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  resetIfNewDay: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const useDailyTaskStore = create<DailyTaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      lastReset: today(),

      resetIfNewDay: () => {
        const t = today();
        if (get().lastReset !== t) {
          set({
            tasks: get().tasks.map((task) => ({ ...task, completed: false })),
            lastReset: t,
          });
        }
      },

      addTask: (title) => {
        if (get().tasks.length >= 10) return;
        set((s) => ({
          tasks: [
            ...s.tasks,
            { id: crypto.randomUUID(), title, completed: false },
          ],
        }));
      },

      toggleTask: (id) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      },
    }),
    { name: 'daily-tasks' }
  )
);