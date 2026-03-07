import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Dumbbell, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { useSelectedDate } from '../hooks/useSelectedDate';
import { useDailyTotals } from '../hooks/useDailyTotals';
import { useGoalsStore } from '../stores/useGoalsStore';
import { useWorkoutStore } from '../stores/useWorkoutStore';
import { useBodyWeightStore } from '../stores/useBodyWeightStore';
import { useFoodStore } from '../stores/useFoodStore';
import { MacroRing } from '../components/dashboard/MacroRing';
import { WaterWidget } from '../components/dashboard/WaterWidget';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Card } from '../components/ui/Card';
import { scaleMacros } from '../utils/macroCalc';
import { isToday } from '../utils/dateUtils';

type TrendRange = '7D' | '14D' | '30D';
type TrendMetric = 'Calories' | 'Protein' | 'Carbs' | 'Fat';

const TREND_DAYS: Record<TrendRange, number> = { '7D': 7, '14D': 14, '30D': 30 };
const METRIC_COLORS: Record<TrendMetric, string> = {
  Calories: '#a3e635',
  Protein: '#60a5fa',
  Carbs: '#facc15',
  Fat: '#fb923c',
};

export function DashboardPage() {
  const { selectedDate } = useSelectedDate();
  const totals = useDailyTotals(selectedDate);
  const goals = useGoalsStore((s) => s.settings.macroGoals);
  const goalType = useGoalsStore((s) => s.settings.goalType);

  // Select raw arrays — never call functions inside Zustand selectors
  const allSessions = useWorkoutStore((s) => s.sessions);
  const weightEntries = useBodyWeightStore((s) => s.entries);
  const foodLog = useFoodStore((s) => s.foodLog);

  const sessions = useMemo(
    () => allSessions.filter((s) => s.date === selectedDate),
    [allSessions, selectedDate]
  );
  const entries = useMemo(
    () => foodLog.filter((e) => e.date === selectedDate),
    [foodLog, selectedDate]
  );
  const latestWeight = weightEntries[weightEntries.length - 1];

  const remaining = {
    calories: goals.calories - totals.calories,
    protein: Math.round((goals.protein - totals.protein) * 10) / 10,
    carbs: Math.round((goals.carbs - totals.carbs) * 10) / 10,
    fat: Math.round((goals.fat - totals.fat) * 10) / 10,
  };

  const [trendRange, setTrendRange] = useState<TrendRange>('7D');
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('Calories');

  const trendData = useMemo(() => {
    const days = TREND_DAYS[trendRange];
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().split('T')[0];
      const dayEntries = foodLog.filter((e) => e.date === date);
      const totalsForDay = dayEntries.reduce(
        (acc, entry) => {
          const s = scaleMacros(entry.foodItem.macrosPerServing, entry.servings);
          return {
            calories: acc.calories + s.calories,
            protein: Math.round((acc.protein + s.protein) * 10) / 10,
            carbs: Math.round((acc.carbs + s.carbs) * 10) / 10,
            fat: Math.round((acc.fat + s.fat) * 10) / 10,
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      result.push({
        label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        value: trendMetric === 'Calories' ? totalsForDay.calories
          : trendMetric === 'Protein' ? totalsForDay.protein
          : trendMetric === 'Carbs' ? totalsForDay.carbs
          : totalsForDay.fat,
        isToday: date === new Date().toISOString().split('T')[0],
      });
    }
    return result;
  }, [foodLog, trendRange, trendMetric]);

  const trendGoal = trendMetric === 'Calories' ? goals.calories
    : trendMetric === 'Protein' ? goals.protein
    : trendMetric === 'Carbs' ? goals.carbs
    : goals.fat;

  const goalBadgeColor: Record<string, string> = {
    bulk: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    cut: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    maintain: 'bg-lime-500/10 text-lime-400 border-lime-500/30',
    custom: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Goal badge */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${goalBadgeColor[goalType] ?? goalBadgeColor.custom}`}>
          {goalType.charAt(0).toUpperCase() + goalType.slice(1)}
        </span>
        {latestWeight && (
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <Scale size={14} />
            {latestWeight.weight} kg
          </span>
        )}
      </div>

      {/* Calorie ring */}
      <Card className="p-5 flex flex-col items-center gap-4">
        <MacroRing consumed={totals.calories} goal={goals.calories} />

        <div className="w-full grid grid-cols-3 gap-3 pt-1 border-t border-gray-800">
          {[
            { label: 'Remaining', value: remaining.calories, unit: 'kcal', color: 'text-gray-300' },
            { label: 'Consumed', value: totals.calories, unit: 'kcal', color: 'text-lime-400' },
            { label: 'Goal', value: goals.calories, unit: 'kcal', color: 'text-gray-400' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="text-center">
              <div className={`text-base font-bold ${color}`}>{Math.abs(value)}</div>
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-xs text-gray-600">{unit}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Macro bars */}
      <Card className="p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-300">Macros</h2>
        <ProgressBar
          value={totals.protein}
          max={goals.protein}
          color="bg-blue-400"
          label="Protein"
          sublabel={`${totals.protein}g / ${goals.protein}g`}
          height="h-2.5"
        />
        <ProgressBar
          value={totals.carbs}
          max={goals.carbs}
          color="bg-yellow-400"
          label="Carbs"
          sublabel={`${totals.carbs}g / ${goals.carbs}g`}
          height="h-2.5"
        />
        <ProgressBar
          value={totals.fat}
          max={goals.fat}
          color="bg-orange-400"
          label="Fat"
          sublabel={`${totals.fat}g / ${goals.fat}g`}
          height="h-2.5"
        />
      </Card>

      {/* Trends chart */}
      <Card className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300">Trends</h2>
          <div className="flex gap-1">
            {(['7D', '14D', '30D'] as TrendRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTrendRange(r)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  trendRange === r ? 'bg-lime-400/20 text-lime-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['Calories', 'Protein', 'Carbs', 'Fat'] as TrendMetric[]).map((m) => (
            <button
              key={m}
              onClick={() => setTrendMetric(m)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                trendMetric === m
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              style={trendMetric === m ? { backgroundColor: METRIC_COLORS[m] } : {}}
            >
              {m}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={trendData} barSize={trendRange === '30D' ? 6 : trendRange === '14D' ? 10 : 18} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#4b5563', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={trendRange === '30D' ? 6 : trendRange === '14D' ? 3 : 0}
            />
            <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#9ca3af', fontSize: 11 }}
              itemStyle={{ color: METRIC_COLORS[trendMetric], fontSize: 12 }}
              formatter={(v) => [`${v} ${trendMetric === 'Calories' ? 'kcal' : 'g'}`, trendMetric]}
            />
            <ReferenceLine y={trendGoal} stroke="#6b7280" strokeDasharray="3 3" />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {trendData.map((entry, i) => (
                <Cell key={i} fill={entry.isToday ? METRIC_COLORS[trendMetric] : `${METRIC_COLORS[trendMetric]}66`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-600 text-center">Dashed line = goal · Bright bar = today</p>
      </Card>

      {/* Water */}
      <WaterWidget />

      {/* Today's Food */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">Today's Food</h2>
          <Link to="/food" className="text-xs text-lime-400 hover:text-lime-300">View all →</Link>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-3">No food logged yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.slice(-3).reverse().map((entry) => {
              const scaled = scaleMacros(entry.foodItem.macrosPerServing, entry.servings);
              return (
                <div key={entry.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-200">{entry.foodItem.name}</span>
                    <span className="text-xs text-gray-500 ml-1.5">{entry.servings}×</span>
                  </div>
                  <span className="text-gray-400 text-xs">{scaled.calories} kcal</span>
                </div>
              );
            })}
          </div>
        )}
        <Link
          to="/food"
          className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-dashed border-gray-700 text-sm text-gray-500 hover:border-lime-400 hover:text-lime-400 transition-colors"
        >
          <Plus size={14} /> Log food
        </Link>
      </Card>

      {/* Workouts */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">Workout</h2>
          <Link to="/workout" className="text-xs text-lime-400 hover:text-lime-300">Go to workout →</Link>
        </div>
        {sessions.length === 0 ? (
          <Link
            to="/workout"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-gray-700 text-sm text-gray-500 hover:border-lime-400 hover:text-lime-400 transition-colors"
          >
            <Dumbbell size={14} /> {isToday(selectedDate) ? 'Start a workout' : 'No workout logged'}
          </Link>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => (
              <div key={s.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-200">{s.name}</span>
                <span className="text-xs text-gray-500">{s.exercises.length} exercises</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
