import { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings,
  Coffee,
  Brain,
  Flame,
  Timer,
  X,
  Check,
  Volume2,
  VolumeX,
  Info,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { usePomodoroStore } from '../store/pomodoroStore';
import type { PomodoroMode } from '../store/pomodoroStore';

/* ── helpers ─────────────────────────────────────────────────── */
function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

const MODE_LABELS: Record<PomodoroMode, string> = {
  work: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

const MODE_ICONS: Record<PomodoroMode, React.ReactNode> = {
  work: <Brain size={18} />,
  shortBreak: <Coffee size={18} />,
  longBreak: <Coffee size={18} />,
};

/* ── main component ──────────────────────────────────────────── */
const PomodoroPage = () => {
  const {
    mode,
    secondsLeft,
    isRunning,
    completedSessions,
    totalSessionsToday,
    totalFocusMinutesToday,
    settings,
    start,
    pause,
    reset,
    skip,
    setMode,
    updateSettings,
  } = usePomodoroStore();

  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Settings form state
  const [formWork, setFormWork] = useState(settings.workMinutes);
  const [formShort, setFormShort] = useState(settings.shortBreakMinutes);
  const [formLong, setFormLong] = useState(settings.longBreakMinutes);
  const [formSessions, setFormSessions] = useState(settings.sessionsBeforeLong);
  const [formAutoStart, setFormAutoStart] = useState(settings.autoStartBreaks);

  // Sync settings form when panel opens
  useEffect(() => {
    if (showSettings) {
      setFormWork(settings.workMinutes);
      setFormShort(settings.shortBreakMinutes);
      setFormLong(settings.longBreakMinutes);
      setFormSessions(settings.sessionsBeforeLong);
      setFormAutoStart(settings.autoStartBreaks);
    }
  }, [showSettings, settings]);

  // Update document title
  useEffect(() => {
    document.title = `${formatTime(secondsLeft)} — ${MODE_LABELS[mode]} | WorkspaceAI`;
    return () => {
      document.title = 'WorkspaceAI';
    };
  }, [secondsLeft, mode]);

  const handleSaveSettings = useCallback(() => {
    updateSettings({
      workMinutes: formWork,
      shortBreakMinutes: formShort,
      longBreakMinutes: formLong,
      sessionsBeforeLong: formSessions,
      autoStartBreaks: formAutoStart,
    });
    setShowSettings(false);
  }, [formWork, formShort, formLong, formSessions, formAutoStart, updateSettings]);

  // Calculate progress for the ring
  const totalSeconds =
    mode === 'work'
      ? settings.workMinutes * 60
      : mode === 'shortBreak'
        ? settings.shortBreakMinutes * 60
        : settings.longBreakMinutes * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  // SVG ring dimensions
  const ringSize = 240;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Mode colors
  const modeColorMap: Record<PomodoroMode, { ring: string; bg: string; accent: string }> = {
    work: {
      ring: '#8b5e2a',
      bg: 'from-bark-light/5 to-bark-pale/10',
      accent: 'text-bark-light',
    },
    shortBreak: {
      ring: '#5a9e6f',
      bg: 'from-green-800/5 to-green-600/10',
      accent: 'text-green-700',
    },
    longBreak: {
      ring: '#4a7fb5',
      bg: 'from-blue-800/5 to-blue-600/10',
      accent: 'text-blue-700',
    },
  };

  const currentColor = modeColorMap[mode];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 ml-52 overflow-hidden lined-paper">
        {/* Main timer area */}
        <div className="flex-1 flex flex-col items-center justify-start relative px-6 pt-14 pb-6 overflow-hidden h-screen">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2">
              <Timer size={16} className="text-bark-mid" />
              <h1 className="font-serif font-bold text-bark-dark text-sm italic">
                Pomodoro Timer
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-full text-bark-pale hover:text-bark-dark hover:bg-white/50 transition-all duration-200"
                title={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              <div className="relative group">
                <button
                  className="p-2 rounded-full text-bark-pale hover:text-bark-dark hover:bg-white/50 transition-all duration-200"
                >
                  <Info size={15} />
                </button>
                {/* Tooltip */}
                <div className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-sm border border-parchment-border rounded-lg shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <h4 className="font-serif font-bold text-bark-dark text-xs mb-2 flex items-center gap-1.5">
                    <Brain size={12} className="text-bark-light" />
                    How Pomodoro Works
                  </h4>
                  <ol className="space-y-1.5 text-[10px] font-sans text-bark-mid list-none">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-bark-light/15 text-bark-light flex items-center justify-center text-[9px] font-bold mt-0.5">1</span>
                      <span><strong className="text-bark-dark">Focus</strong> — Work on a task for 25 minutes with full concentration.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-green-600/15 text-green-700 flex items-center justify-center text-[9px] font-bold mt-0.5">2</span>
                      <span><strong className="text-bark-dark">Short Break</strong> — Rest for 5 minutes. Stretch, hydrate, breathe.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-bark-light/15 text-bark-light flex items-center justify-center text-[9px] font-bold mt-0.5">3</span>
                      <span><strong className="text-bark-dark">Repeat</strong> — Complete 4 focus sessions to build a streak.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-600/15 text-blue-700 flex items-center justify-center text-[9px] font-bold mt-0.5">4</span>
                      <span><strong className="text-bark-dark">Long Break</strong> — After 4 sessions, take a 15–30 min break to recharge.</span>
                    </li>
                  </ol>
                  <p className="text-[9px] text-bark-pale font-sans mt-2.5 pt-2 border-t border-parchment-border italic">
                    Tip: Resist the urge to check your phone during focus sessions!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-full text-bark-pale hover:text-bark-dark hover:bg-white/50 transition-all duration-200"
                title="Settings"
              >
                <Settings size={15} />
              </button>
            </div>
          </div>

          {/* Mode selector tabs */}
          <div className="flex items-center bg-white/60 rounded-full p-1 mb-6 border border-parchment-border shadow-sm">
            {(['work', 'shortBreak', 'longBreak'] as PomodoroMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-serif transition-all duration-200 ${
                  mode === m
                    ? 'bg-bark-dark text-bark-cream shadow-md'
                    : 'text-bark-mid hover:text-bark-dark hover:bg-white/80'
                }`}
              >
                {MODE_ICONS[m]}
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Timer ring */}
          <div className={`relative bg-gradient-to-br ${currentColor.bg} rounded-full p-4 mb-3`}>
            {/* Glow effect */}
            {isRunning && (
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${currentColor.ring}15 0%, transparent 70%)`,
                }}
              />
            )}

            <svg
              width={ringSize}
              height={ringSize}
              className="transform -rotate-90"
            >
              {/* Background ring */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="#d4b89640"
                strokeWidth={strokeWidth}
              />
              {/* Progress ring */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke={currentColor.ring}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>

            {/* Timer text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-[9px] font-sans font-semibold uppercase tracking-widest mb-1 ${currentColor.accent}`}>
                {MODE_LABELS[mode]}
              </span>
              <span className="font-serif text-bark-darkest tracking-tight" style={{ fontSize: '2.8rem', lineHeight: 1 }}>
                {formatTime(secondsLeft)}
              </span>
              <span className="text-[9px] text-bark-pale font-sans mt-1">
                Session {completedSessions + 1} of {settings.sessionsBeforeLong}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={reset}
              className="p-2.5 rounded-full bg-white/60 border border-parchment-border text-bark-mid hover:text-bark-dark hover:bg-white/80 transition-all duration-200 shadow-sm"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={isRunning ? pause : start}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-bark-dark hover:bg-bark-darkest text-bark-cream font-serif text-xs shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {isRunning ? (
                <>
                  <Pause size={14} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={14} />
                  Start
                </>
              )}
            </button>
            <button
              onClick={skip}
              className="p-2.5 rounded-full bg-white/60 border border-parchment-border text-bark-mid hover:text-bark-dark hover:bg-white/80 transition-all duration-200 shadow-sm"
              title="Skip to next"
            >
              <SkipForward size={14} />
            </button>
          </div>

          {/* Session progress dots */}
          <div className="flex items-center gap-2 mb-3">
            {Array.from({ length: settings.sessionsBeforeLong }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                  i < completedSessions
                    ? 'bg-bark-light border-bark-light scale-110'
                    : i === completedSessions && mode === 'work'
                      ? 'border-bark-light bg-bark-light/20 animate-pulse'
                      : 'border-parchment-border bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Stats cards */}
          <div className="flex items-stretch gap-4">
            <div className="bg-white/70 border border-parchment-border rounded-lg px-5 py-3.5 text-center min-w-[120px] shadow-sm">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Flame size={12} className="text-bark-light" />
                <span className="text-[9px] font-sans text-bark-pale uppercase tracking-wider font-semibold">
                  Sessions
                </span>
              </div>
              <span className="font-serif text-bark-darkest text-lg font-bold">
                {totalSessionsToday}
              </span>
            </div>
            <div className="bg-white/70 border border-parchment-border rounded-lg px-5 py-3.5 text-center min-w-[120px] shadow-sm">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Timer size={12} className="text-bark-light" />
                <span className="text-[9px] font-sans text-bark-pale uppercase tracking-wider font-semibold">
                  Focus Time
                </span>
              </div>
              <span className="font-serif text-bark-darkest text-lg font-bold">
                {totalFocusMinutesToday}
                <span className="text-xs text-bark-pale ml-0.5">min</span>
              </span>
            </div>
            <div className="bg-white/70 border border-parchment-border rounded-lg px-5 py-3.5 text-center min-w-[120px] shadow-sm">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Brain size={12} className="text-bark-light" />
                <span className="text-[9px] font-sans text-bark-pale uppercase tracking-wider font-semibold">
                  Streak
                </span>
              </div>
              <span className="font-serif text-bark-darkest text-lg font-bold">
                {completedSessions}
                <span className="text-xs text-bark-pale ml-0.5">/ {settings.sessionsBeforeLong}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-bark-darkest/40 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />

          {/* Modal */}
          <div className="relative bg-parchment border border-parchment-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-parchment-border">
              <div className="flex items-center gap-2">
                <Settings size={15} className="text-bark-mid" />
                <h3 className="font-serif font-bold text-bark-dark text-sm">
                  Timer Settings
                </h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-full text-bark-pale hover:text-bark-dark hover:bg-white/50 transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-5">
              {/* Duration inputs */}
              <div>
                <label className="text-[10px] font-sans text-bark-pale uppercase tracking-wider font-semibold block mb-2">
                  Durations (minutes)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-serif text-bark-mid block mb-1">Focus</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={formWork}
                      onChange={(e) => setFormWork(Number(e.target.value))}
                      className="input-parchment text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-serif text-bark-mid block mb-1">Short Break</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={formShort}
                      onChange={(e) => setFormShort(Number(e.target.value))}
                      className="input-parchment text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-serif text-bark-mid block mb-1">Long Break</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={formLong}
                      onChange={(e) => setFormLong(Number(e.target.value))}
                      className="input-parchment text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Sessions before long break */}
              <div>
                <label className="text-[10px] font-sans text-bark-pale uppercase tracking-wider font-semibold block mb-2">
                  Sessions before long break
                </label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={formSessions}
                  onChange={(e) => setFormSessions(Number(e.target.value))}
                  className="input-parchment w-20 text-center"
                />
              </div>

              {/* Auto-start toggle */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-serif text-bark-mid">
                  Auto-start breaks
                </label>
                <button
                  type="button"
                  onClick={() => setFormAutoStart(!formAutoStart)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                    formAutoStart ? 'bg-bark-light' : 'bg-parchment-border'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      formAutoStart ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-parchment-border flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="btn-bark-outline text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="btn-bark flex items-center gap-1.5 text-xs py-2 px-4"
              >
                <Check size={13} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroPage;
