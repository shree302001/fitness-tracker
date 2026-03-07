import { Droplets, Undo2 } from 'lucide-react';
import { useWaterStore } from '../../stores/useWaterStore';
import { useGoalsStore } from '../../stores/useGoalsStore';
import { useSelectedDate } from '../../hooks/useSelectedDate';

const QUICK_ADD = [250, 500, 750, 1000];

export function WaterWidget() {
  const { selectedDate } = useSelectedDate();
  const waterLog = useWaterStore((s) => s.waterLog);
  const addWater = useWaterStore((s) => s.addWater);
  const removeWater = useWaterStore((s) => s.removeWater);
  const waterGoalMl = useGoalsStore((s) => s.settings.waterGoalMl ?? 2500);

  const todayEntries = waterLog.filter((e) => e.date === selectedDate);
  const total = todayEntries.reduce((sum, e) => sum + e.amount, 0);
  const pct = Math.min(total / waterGoalMl, 1);
  const lastEntry = todayEntries[todayEntries.length - 1];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-gray-300">Water</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            <span className={total >= waterGoalMl ? 'text-lime-400 font-semibold' : 'text-blue-400 font-semibold'}>
              {total >= 1000 ? `${(total / 1000).toFixed(1)}L` : `${total}ml`}
            </span>
            <span className="text-gray-600"> / {waterGoalMl >= 1000 ? `${(waterGoalMl / 1000).toFixed(1)}L` : `${waterGoalMl}ml`}</span>
          </span>
          {lastEntry && (
            <button
              onClick={() => removeWater(lastEntry.id)}
              className="text-gray-600 hover:text-gray-400 transition-colors"
              title="Undo last"
            >
              <Undo2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full transition-all duration-300"
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      {/* Quick add */}
      <div className="flex gap-2">
        {QUICK_ADD.map((ml) => (
          <button
            key={ml}
            onClick={() => addWater(selectedDate, ml)}
            className="flex-1 py-1.5 rounded-xl text-xs font-medium bg-gray-800 text-blue-400 hover:bg-blue-400/10 border border-gray-700 hover:border-blue-400/30 transition-colors"
          >
            +{ml >= 1000 ? `${ml / 1000}L` : `${ml}`}
          </button>
        ))}
      </div>
    </div>
  );
}
