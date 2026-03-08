import { useState, useMemo } from 'react';
import { Footprints, Moon, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { useHealthConnect } from '../hooks/useHealthConnect';
import { useActivityStore } from '../stores/useActivityStore';
import { Capacitor } from '@capacitor/core';

const SLEEP_QUALITY: { min: number; label: string; color: string }[] = [
  { min: 480, label: 'Excellent', color: 'text-lime-400' },
  { min: 420, label: 'Good', color: 'text-blue-400' },
  { min: 360, label: 'Fair', color: 'text-yellow-400' },
  { min: 0, label: 'Poor', color: 'text-red-400' },
];

function sleepQuality(minutes: number) {
  return SLEEP_QUALITY.find((q) => minutes >= q.min) ?? SLEEP_QUALITY[SLEEP_QUALITY.length - 1];
}

function fmtDuration(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 3);
}

const today = new Date().toISOString().slice(0, 10);

export function ActivityPage() {
  const hc = useHealthConnect();
  const sleepLog = useActivityStore((s) => s.sleepLog);
  const stepGoal = useActivityStore((s) => s.stepGoal);
  const logSleep = useActivityStore((s) => s.logSleep);
  const removeSleep = useActivityStore((s) => s.removeSleep);
  const setStepGoal = useActivityStore((s) => s.setStepGoal);

  const [sleepDate, setSleepDate] = useState(today);
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [stepGoalInput, setStepGoalInput] = useState(String(stepGoal));
  const [showGoalEdit, setShowGoalEdit] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  // Last 7 nights of sleep
  const weeklySleep = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      const entry = sleepLog.find((e) => e.date === date);
      result.push({ date, minutes: entry?.durationMinutes ?? 0, label: dayLabel(date) });
    }
    return result;
  }, [sleepLog]);

  const todaySleep = sleepLog.find((e) => e.date === today);
  const avgSleep = useMemo(() => {
    const logged = weeklySleep.filter((d) => d.minutes > 0);
    return logged.length > 0 ? Math.round(logged.reduce((a, b) => a + b.minutes, 0) / logged.length) : null;
  }, [weeklySleep]);

  const stepPct = hc.steps !== null ? Math.min((hc.steps / stepGoal) * 100, 100) : 0;
  const stepCalsBurned = hc.steps !== null ? Math.round(hc.steps * 0.04) : null;

  return (
    <div className="flex flex-col gap-4">

      {/* Steps from Health Connect */}
      <Card className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Footprints size={16} className="text-lime-400" />
            <h2 className="text-sm font-semibold text-gray-300">Steps Today</h2>
          </div>
          <div className="flex items-center gap-2">
            {isNative && hc.available && hc.permissionsGranted && (
              <button onClick={hc.refresh} className="text-gray-500 hover:text-gray-300 transition-colors">
                <RefreshCw size={14} className={hc.loading ? 'animate-spin' : ''} />
              </button>
            )}
            {showGoalEdit ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={stepGoalInput}
                  onChange={(e) => setStepGoalInput(e.target.value)}
                  className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-2 py-0.5 text-xs text-gray-100 text-center focus:outline-none focus:border-lime-400"
                />
                <button
                  onClick={() => { setStepGoal(parseInt(stepGoalInput) || 10000); setShowGoalEdit(false); }}
                  className="text-xs text-lime-400 font-medium"
                >
                  Set
                </button>
              </div>
            ) : (
              <button onClick={() => setShowGoalEdit(true)} className="text-xs text-gray-500 hover:text-gray-300">
                Goal: {stepGoal.toLocaleString()}
              </button>
            )}
          </div>
        </div>

        {/* Not native or HC not available */}
        {(!isNative || !hc.available) && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <WifiOff size={32} className="text-gray-600" />
            <p className="text-sm text-gray-500">
              {!isNative
                ? 'Steps sync requires the Android app'
                : 'Health Connect is not installed on this device'}
            </p>
            {isNative && !hc.available && (
              <a
                href="market://details?id=com.google.android.apps.healthdata"
                className="text-xs text-lime-400 underline"
              >
                Install Health Connect
              </a>
            )}
          </div>
        )}

        {/* Available but no permission */}
        {isNative && hc.available && !hc.permissionsGranted && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Wifi size={32} className="text-gray-600" />
            <p className="text-sm text-gray-400">Connect Health Connect to sync your steps</p>
            <button
              onClick={hc.requestPermissions}
              className="px-5 py-2 bg-lime-400 text-gray-950 rounded-xl text-sm font-semibold"
            >
              Connect Health Connect
            </button>
          </div>
        )}

        {/* Steps data */}
        {isNative && hc.available && hc.permissionsGranted && (
          <>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-3xl font-bold text-lime-400">
                  {hc.steps !== null ? hc.steps.toLocaleString() : '—'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">of {stepGoal.toLocaleString()} steps</div>
              </div>
              {stepCalsBurned !== null && (
                <div className="text-xs text-gray-500 pb-1">≈ {stepCalsBurned} kcal burned</div>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime-400 rounded-full transition-all"
                style={{ width: `${stepPct}%` }}
              />
            </div>
            <div className="text-xs text-gray-600 text-right">{Math.round(stepPct)}% of daily goal</div>
          </>
        )}

        {hc.error && (
          <p className="text-xs text-red-400">{hc.error}</p>
        )}
      </Card>

      {/* 7-day steps chart */}
      {isNative && hc.permissionsGranted && hc.weeklySteps.length > 0 && (
        <Card className="p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-300">7-Day Steps</h2>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={hc.weeklySteps} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tickFormatter={(d) => dayLabel(d)}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [Number(v).toLocaleString(), 'Steps']}
                labelFormatter={(d) => new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
              />
              <ReferenceLine y={stepGoal} stroke="#a3e635" strokeDasharray="3 3" strokeOpacity={0.4} />
              <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
                {hc.weeklySteps.map((entry) => (
                  <Cell key={entry.date} fill={entry.steps >= stepGoal ? '#a3e635' : '#374151'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className="w-3 h-2 rounded-sm bg-lime-400" />
            <span>Goal reached</span>
            <div className="w-3 h-2 rounded-sm bg-gray-700 ml-2" />
            <span>Below goal</span>
          </div>
        </Card>
      )}

      {/* Sleep */}
      <Card className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Moon size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-gray-300">Sleep</h2>
          </div>
          {avgSleep !== null && (
            <span className="text-xs text-gray-500">7-day avg: {fmtDuration(avgSleep)}</span>
          )}
        </div>

        {/* Today's sleep summary */}
        {todaySleep ? (
          <div className="bg-gray-800 rounded-xl p-3 flex justify-between items-center">
            <div>
              <div className={`text-lg font-bold ${sleepQuality(todaySleep.durationMinutes).color}`}>
                {fmtDuration(todaySleep.durationMinutes)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {todaySleep.bedtime} → {todaySleep.wakeTime} · {sleepQuality(todaySleep.durationMinutes).label}
              </div>
            </div>
            <button
              onClick={() => removeSleep(todaySleep.id)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500">No sleep logged for today yet.</p>
        )}

        {/* Log sleep form */}
        <div className="flex flex-col gap-2">
          <div className="text-xs text-gray-500 font-medium">Log sleep</div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Date (woke up)</div>
              <input
                type="date"
                value={sleepDate}
                max={today}
                onChange={(e) => setSleepDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-100 focus:outline-none focus:border-lime-400"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Bedtime</div>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-100 focus:outline-none focus:border-lime-400"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Wake time</div>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-100 focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>
          <button
            onClick={() => logSleep(sleepDate, bedtime, wakeTime)}
            className="w-full py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-colors"
          >
            Save Sleep
          </button>
        </div>
      </Card>

      {/* 7-day sleep chart */}
      {weeklySleep.some((d) => d.minutes > 0) && (
        <Card className="p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-300">7-Day Sleep</h2>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklySleep} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${Math.floor(v / 60)}h`}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [fmtDuration(Number(v)), 'Sleep']}
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
              />
              <ReferenceLine y={480} stroke="#60a5fa" strokeDasharray="3 3" strokeOpacity={0.4} />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {weeklySleep.map((entry) => (
                  <Cell
                    key={entry.date}
                    fill={entry.minutes >= 480 ? '#60a5fa' : entry.minutes >= 360 ? '#facc15' : entry.minutes > 0 ? '#f87171' : '#374151'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
            <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm bg-blue-400" /><span>8h+</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm bg-yellow-400" /><span>6–8h</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm bg-red-400" /><span>&lt;6h</span></div>
          </div>
        </Card>
      )}

      {/* Play Store note */}
      <div className="text-xs text-gray-700 text-center px-2 pb-2">
        Steps synced from Android Health Connect. Samsung Health and Google Fit both sync to Health Connect automatically.
      </div>
    </div>
  );
}
