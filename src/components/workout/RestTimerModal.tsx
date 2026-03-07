import { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';

interface RestTimerModalProps {
  onClose: () => void;
}

const PRESETS = [
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '2m', seconds: 120 },
  { label: '3m', seconds: 180 },
];

export function RestTimerModal({ onClose }: RestTimerModalProps) {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }

  function start(secs: number) {
    clearTimer();
    setDone(false);
    setRemaining(secs);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r === null || r <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          navigator.vibrate?.([200, 100, 200]);
          setDone(true);
          setIsRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  function reset() {
    clearTimer();
    setRemaining(null);
    setDone(false);
  }

  useEffect(() => {
    return clearTimer;
  }, []);

  // Auto-close 2s after done
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [done, onClose]);

  const mins = remaining !== null ? Math.floor(remaining / 60) : Math.floor(duration / 60);
  const secs = remaining !== null ? remaining % 60 : duration % 60;
  const displayTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const progress = remaining !== null && !done ? remaining / duration : 1;

  return (
    <Modal open onClose={() => { reset(); onClose(); }} title="Rest Timer">
      <div className="p-6 flex flex-col items-center gap-6">
        {/* Countdown display */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#1f2937" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={done ? '#4ade80' : '#a3e635'}
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progress)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="text-center">
            {done ? (
              <div className="text-2xl font-bold text-green-400">✓ Done!</div>
            ) : (
              <div className="text-3xl font-bold text-gray-100 tabular-nums">{displayTime}</div>
            )}
          </div>
        </div>

        {/* Preset buttons */}
        {!isRunning && !done && (
          <div className="flex gap-2">
            {PRESETS.map(({ label, seconds }) => (
              <button
                key={label}
                onClick={() => { setDuration(seconds); setRemaining(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  duration === seconds && remaining === null
                    ? 'bg-lime-400 text-gray-950'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Custom input */}
        {!isRunning && !done && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Custom (sec):</span>
            <input
              type="number"
              inputMode="numeric"
              value={duration}
              min={10}
              max={600}
              onChange={(e) => { setDuration(parseInt(e.target.value) || 60); setRemaining(null); }}
              className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-100 text-center focus:outline-none focus:border-lime-400"
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          {!isRunning && !done && (
            <button
              onClick={() => start(remaining ?? duration)}
              className="px-6 py-2.5 rounded-xl bg-lime-400 text-gray-950 text-sm font-semibold hover:bg-lime-300 transition-colors"
            >
              {remaining !== null ? 'Resume' : 'Start'}
            </button>
          )}
          {isRunning && (
            <button
              onClick={() => { clearTimer(); setRemaining((r) => r); }}
              className="px-6 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              Pause
            </button>
          )}
          {remaining !== null && !done && (
            <button
              onClick={reset}
              className="px-6 py-2.5 rounded-xl bg-gray-800 text-gray-400 text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
