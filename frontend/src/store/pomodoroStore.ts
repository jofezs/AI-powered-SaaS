import { create } from 'zustand';

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLong: number;
  autoStartBreaks: boolean;
}

interface PomodoroState {
  mode: PomodoroMode;
  secondsLeft: number;
  isRunning: boolean;
  completedSessions: number;
  totalSessionsToday: number;
  totalFocusMinutesToday: number;
  settings: PomodoroSettings;
  intervalId: ReturnType<typeof setInterval> | null;

  // Actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  setMode: (mode: PomodoroMode) => void;
  tick: () => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLong: 4,
  autoStartBreaks: false,
};

function getModeSeconds(mode: PomodoroMode, settings: PomodoroSettings): number {
  switch (mode) {
    case 'work': return settings.workMinutes * 60;
    case 'shortBreak': return settings.shortBreakMinutes * 60;
    case 'longBreak': return settings.longBreakMinutes * 60;
  }
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  mode: 'work',
  secondsLeft: DEFAULT_SETTINGS.workMinutes * 60,
  isRunning: false,
  completedSessions: 0,
  totalSessionsToday: 0,
  totalFocusMinutesToday: 0,
  settings: DEFAULT_SETTINGS,
  intervalId: null,

  start: () => {
    const state = get();
    if (state.isRunning) return;

    const intervalId = setInterval(() => {
      get().tick();
    }, 1000);

    set({ isRunning: true, intervalId });
  },

  pause: () => {
    const state = get();
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }
    set({ isRunning: false, intervalId: null });
  },

  reset: () => {
    const state = get();
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }
    set({
      secondsLeft: getModeSeconds(state.mode, state.settings),
      isRunning: false,
      intervalId: null,
    });
  },

  skip: () => {
    const state = get();
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }

    let nextMode: PomodoroMode;
    let newCompleted = state.completedSessions;
    let newTotal = state.totalSessionsToday;
    let newMinutes = state.totalFocusMinutesToday;

    if (state.mode === 'work') {
      newCompleted += 1;
      newTotal += 1;
      newMinutes += state.settings.workMinutes;
      if (newCompleted >= state.settings.sessionsBeforeLong) {
        nextMode = 'longBreak';
        newCompleted = 0;
      } else {
        nextMode = 'shortBreak';
      }
    } else {
      nextMode = 'work';
    }

    set({
      mode: nextMode,
      secondsLeft: getModeSeconds(nextMode, state.settings),
      isRunning: false,
      intervalId: null,
      completedSessions: newCompleted,
      totalSessionsToday: newTotal,
      totalFocusMinutesToday: newMinutes,
    });
  },

  setMode: (mode: PomodoroMode) => {
    const state = get();
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }
    set({
      mode,
      secondsLeft: getModeSeconds(mode, state.settings),
      isRunning: false,
      intervalId: null,
    });
  },

  tick: () => {
    const state = get();
    if (state.secondsLeft <= 1) {
      // Timer completed
      if (state.intervalId) {
        clearInterval(state.intervalId);
      }

      // Play notification sound
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 660;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.5);
      } catch {
        // Audio not available
      }

      let nextMode: PomodoroMode;
      let newCompleted = state.completedSessions;
      let newTotal = state.totalSessionsToday;
      let newMinutes = state.totalFocusMinutesToday;

      if (state.mode === 'work') {
        newCompleted += 1;
        newTotal += 1;
        newMinutes += state.settings.workMinutes;
        if (newCompleted >= state.settings.sessionsBeforeLong) {
          nextMode = 'longBreak';
          newCompleted = 0;
        } else {
          nextMode = 'shortBreak';
        }
      } else {
        nextMode = 'work';
      }

      const shouldAutoStart = state.mode === 'work' && state.settings.autoStartBreaks;

      set({
        mode: nextMode,
        secondsLeft: getModeSeconds(nextMode, state.settings),
        isRunning: false,
        intervalId: null,
        completedSessions: newCompleted,
        totalSessionsToday: newTotal,
        totalFocusMinutesToday: newMinutes,
      });

      if (shouldAutoStart) {
        // Small delay to let state settle, then auto-start
        setTimeout(() => get().start(), 100);
      }
    } else {
      set({ secondsLeft: state.secondsLeft - 1 });
    }
  },

  updateSettings: (newSettings: Partial<PomodoroSettings>) => {
    const state = get();
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }
    const merged = { ...state.settings, ...newSettings };
    set({
      settings: merged,
      secondsLeft: getModeSeconds(state.mode, merged),
      isRunning: false,
      intervalId: null,
    });
  },
}));
