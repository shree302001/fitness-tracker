import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { Card } from '../ui/Card';

type Range = '1M' | '3M' | 'All';
const RANGE_DAYS: Record<Range, number | null> = { '1M': 30, '3M': 90, 'All': null };

export function WorkoutVolumeChart() {
  const sessions = useWorkoutStore((s) => s.sessions);
  const [range, setRange] = useState<Range>('1M');

  const chartData = useMemo(() => {
    const days = RANGE_DAYS[range];
    const cutoff = days
      ? new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
      : null;

    const filtered = sessions
      .filter((s) => !cutoff || s.date >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date));

    return filtered.map((s) => {
      const volume = s.exercises.reduce((total, ex) => {
        return total + ex.sets
          .filter((set) => set.completed && set.weight > 0 && set.reps > 0)
          .reduce((sum, set) => sum + set.weight * set.reps, 0);
      }, 0);
      const d = new Date(s.date);
      return {
        label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        volume: Math.round(volume),
        name: s.name,
      };
    });
  }, [sessions, range]);

  if (sessions.length === 0) return null;

  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300">Volume Trend</h2>
        <div className="flex gap-1">
          {(['1M', '3M', 'All'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                range === r ? 'bg-lime-400/20 text-lime-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {chartData.length < 2 ? (
        <p className="text-xs text-gray-600 text-center py-4">
          Log at least 2 workouts to see your volume trend.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={chartData} barSize={range === 'All' ? 6 : range === '3M' ? 8 : 14} margin={{ top: 4, right: 0, left: -22, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: '#4b5563', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={range === 'All' ? Math.floor(chartData.length / 5) : range === '3M' ? 'preserveStartEnd' : 0}
              />
              <YAxis
                tick={{ fill: '#4b5563', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
              />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#9ca3af', fontSize: 11 }}
                itemStyle={{ color: '#a3e635', fontSize: 12 }}
                formatter={(v, _, props) => [`${v} kg`, props.payload.name]}
              />
              <Bar dataKey="volume" fill="#a3e63566" radius={[3, 3, 0, 0]} activeBar={{ fill: '#a3e635' }} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-600 text-center">Total lifted per session (kg)</p>
        </>
      )}
    </Card>
  );
}
