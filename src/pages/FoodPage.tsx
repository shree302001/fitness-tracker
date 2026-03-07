import { useState, useMemo } from 'react';
import { Plus, Copy } from 'lucide-react';
import { useSelectedDate } from '../hooks/useSelectedDate';
import { useDailyTotals } from '../hooks/useDailyTotals';
import { useGoalsStore } from '../stores/useGoalsStore';
import { useFoodStore } from '../stores/useFoodStore';
import { FoodLogList } from '../components/food/FoodLogList';
import { AddFoodModal } from '../components/food/AddFoodModal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

function getYesterday(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function FoodPage() {
  const { selectedDate } = useSelectedDate();
  const totals = useDailyTotals(selectedDate);
  const goals = useGoalsStore((s) => s.settings.macroGoals);
  const foodLog = useFoodStore((s) => s.foodLog);
  const copyDayEntries = useFoodStore((s) => s.copyDayEntries);
  const entries = useMemo(() => foodLog.filter((e) => e.date === selectedDate), [foodLog, selectedDate]);
  const [showModal, setShowModal] = useState(false);

  const yesterday = getYesterday(selectedDate);
  const yesterdayEntries = useMemo(() => foodLog.filter((e) => e.date === yesterday), [foodLog, yesterday]);

  return (
    <div className="flex flex-col gap-4">
      {/* Macro summary */}
      <Card className="p-4 flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Calories</span>
          <span className={totals.calories > goals.calories ? 'text-red-400' : 'text-lime-400'}>
            {totals.calories} / {goals.calories} kcal
          </span>
        </div>
        <ProgressBar value={totals.calories} max={goals.calories} color="bg-lime-400" height="h-2" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { label: 'Protein', value: totals.protein, goal: goals.protein, color: 'text-blue-400' },
            { label: 'Carbs', value: totals.carbs, goal: goals.carbs, color: 'text-yellow-400' },
            { label: 'Fat', value: totals.fat, goal: goals.fat, color: 'text-orange-400' },
          ].map(({ label, value, goal, color }) => (
            <div key={label} className="text-center">
              <div className={`text-sm font-semibold ${color}`}>{value}g</div>
              <div className="text-xs text-gray-600">{label}</div>
              <div className="text-xs text-gray-600">/ {goal}g</div>
            </div>
          ))}
        </div>
        {((totals.fiber ?? 0) > 0 || (totals.sodium ?? 0) > 0) && (
          <div className="flex gap-4 pt-1 border-t border-gray-800">
            {(totals.fiber ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="text-green-400 font-medium">{totals.fiber}g</span>
                <span>fiber</span>
              </div>
            )}
            {(totals.sodium ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="text-purple-400 font-medium">{totals.sodium}mg</span>
                <span>sodium</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Copy yesterday */}
      {yesterdayEntries.length > 0 && entries.length === 0 && (
        <button
          onClick={() => copyDayEntries(yesterday, selectedDate)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-700 text-sm text-gray-400 hover:border-lime-400/40 hover:text-lime-400 transition-colors"
        >
          <Copy size={14} />
          Copy {yesterdayEntries.length} entries from yesterday
        </button>
      )}

      {/* Food log */}
      <FoodLogList entries={entries} date={selectedDate} />

      {/* Add food button */}
      <Button
        onClick={() => setShowModal(true)}
        className="w-full gap-2"
        size="lg"
      >
        <Plus size={18} /> Log Food
      </Button>

      <AddFoodModal open={showModal} onClose={() => setShowModal(false)} date={selectedDate} />
    </div>
  );
}
