import { useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ExerciseProgressModalProps {
  exerciseId: string;
  exerciseName: string;
  onClose: () => void;
}

type Metric = 'weight' | 'volume';
type Range = '1M' | '3M' | 'All';

function subMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

export function ExerciseProgressModal({ exerciseId, exerciseName, onClose }: ExerciseProgressModalProps) {
  const sessions = useWorkoutStore((s) => s.sessions);
  const [metric, setMetric] = useState<Metric>('weight');
  const [range, setRange] = useState<Range>('3M');

  const allData = useMemo(() => {
    const points: { date: string; weight: number; volume: number }[] = [];
    for (const session of sessions) {
      const ex = session.exercises.find((e) => e.exercise.id === exerciseId);
      if (!ex) continue;
      const completedSets = ex.sets.filter((s) => s.completed && s.weight > 0 && s.reps > 0);
      if (completedSets.length === 0) continue;
      const maxWeight = Math.max(...completedSets.map((s) => s.weight));
      const totalVolume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      points.push({ date: session.date, weight: maxWeight, volume: Math.round(totalVolume) });
    }
    return points.sort((a, b) => a.date.localeCompare(b.date));
  }, [sessions, exerciseId]);

  const filtered = useMemo(() => {
    if (range === 'All') return allData;
    const cutoff = range === '1M' ? subMonths(new Date(), 1) : subMonths(new Date(), 3);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return allData.filter((d) => d.date >= cutoffStr);
  }, [allData, range]);

  const chartData = filtered.map((d) => ({
    date: d.date.slice(5), // MM-DD
    value: metric === 'weight' ? d.weight : d.volume,
  }));

  return (
    <Modal open onClose={onClose} title={exerciseName}>
      <div className="p-4 flex flex-col gap-4">
        {/* Metric toggle */}
        <div className="flex gap-2">
          {(['weight', 'volume'] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                metric === m
                  ? 'bg-lime-400 text-gray-950'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {m === 'weight' ? 'Max Weight (kg)' : 'Total Volume (kg)'}
            </button>
          ))}
        </div>

        {/* Range toggle */}
        <div className="flex gap-2">
          {(['1M', '3M', 'All'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-gray-700 text-gray-100'
                  : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Chart or empty state */}
        {chartData.length < 2 ? (
          <div className="py-10 text-center text-sm text-gray-600">
            {chartData.length === 0
              ? 'No data yet. Log this exercise in a workout to see progress.'
              : 'Need at least 2 sessions to show a chart.'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#9ca3af', fontSize: 11 }}
                itemStyle={{ color: '#a3e635', fontSize: 12 }}
                formatter={(v: number) => [`${v} ${metric === 'weight' ? 'kg' : 'kg vol'}`, '']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#a3e635"
                strokeWidth={2}
                dot={{ fill: '#a3e635', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Summary stats */}
        {chartData.length >= 1 && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="text-base font-bold text-lime-400">{Math.max(...chartData.map((d) => d.value))}</div>
              <div className="text-gray-500 mt-0.5">{metric === 'weight' ? 'Best kg' : 'Best vol'}</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="text-base font-bold text-blue-400">{chartData.length}</div>
              <div className="text-gray-500 mt-0.5">Sessions</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <div className={`text-base font-bold ${
                chartData.length >= 2 && chartData[chartData.length - 1].value > chartData[0].value
                  ? 'text-green-400' : 'text-gray-400'
              }`}>
                {chartData.length >= 2
                  ? `${chartData[chartData.length - 1].value > chartData[0].value ? '+' : ''}${chartData[chartData.length - 1].value - chartData[0].value}`
                  : '—'}
              </div>
              <div className="text-gray-500 mt-0.5">Progress</div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
