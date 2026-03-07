import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Dumbbell, Scale } from 'lucide-react';
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
