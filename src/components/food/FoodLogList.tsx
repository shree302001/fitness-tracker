import { useState, useEffect } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import type { FoodLogEntry, MealType } from '../../types';
import { useFoodStore } from '../../stores/useFoodStore';
import { scaleMacros } from '../../utils/macroCalc';
import { EditFoodEntryModal } from './EditFoodEntryModal';

const MEAL_ORDER: MealType[] = ['breakfast', 'pre-workout', 'lunch', 'dinner', 'post-workout', 'snack'];
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  'pre-workout': 'Pre-Workout',
  'post-workout': 'Post-Workout',
};

interface FoodLogListProps {
  entries: FoodLogEntry[];
  date: string;
}

export function FoodLogList({ entries }: FoodLogListProps) {
  const removeFoodEntry = useFoodStore((s) => s.removeFoodEntry);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<FoodLogEntry | null>(null);

  useEffect(() => {
    if (!confirmDeleteId) return;
    const t = setTimeout(() => setConfirmDeleteId(null), 3000);
    return () => clearTimeout(t);
  }, [confirmDeleteId]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 text-sm">
        No food logged. Tap "Log Food" to get started.
      </div>
    );
  }

  const grouped = MEAL_ORDER.reduce<Record<MealType, FoodLogEntry[]>>(
    (acc, meal) => {
      acc[meal] = entries.filter((e) => e.meal === meal);
      return acc;
    },
    {} as Record<MealType, FoodLogEntry[]>
  );

  return (
    <>
      <div className="flex flex-col gap-3">
        {MEAL_ORDER.filter((m) => grouped[m].length > 0).map((meal) => {
          const mealEntries = grouped[meal];
          const mealTotals = mealEntries.reduce(
            (acc, e) => {
              const s = scaleMacros(e.foodItem.macrosPerServing, e.servings);
              return { ...acc, calories: acc.calories + s.calories, protein: acc.protein + s.protein };
            },
            { calories: 0, protein: 0 }
          );

          return (
            <div key={meal} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
                <span className="text-sm font-semibold text-gray-300">{MEAL_LABELS[meal]}</span>
                <span className="text-xs text-gray-500">
                  {mealTotals.calories} kcal · {mealTotals.protein.toFixed(1)}g P
                </span>
              </div>
              {mealEntries.map((entry) => {
                const scaled = scaleMacros(entry.foodItem.macrosPerServing, entry.servings);
                const isConfirming = confirmDeleteId === entry.id;
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-200 truncate">{entry.foodItem.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {entry.servings}× {entry.foodItem.servingLabel} ·{' '}
                        <span className="text-blue-400/80">{scaled.protein}g P</span>{' '}
                        <span className="text-yellow-400/80">{scaled.carbs}g C</span>{' '}
                        <span className="text-orange-400/80">{scaled.fat}g F</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-sm font-medium text-gray-300">{scaled.calories}</span>
                      <button
                        onClick={() => setEditEntry(entry)}
                        className="text-gray-600 hover:text-lime-400 transition-colors p-1"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (isConfirming) {
                            removeFoodEntry(entry.id);
                            setConfirmDeleteId(null);
                          } else {
                            setConfirmDeleteId(entry.id);
                          }
                        }}
                        className={`transition-colors p-1 ${isConfirming ? 'text-red-400' : 'text-gray-600 hover:text-red-400'}`}
                      >
                        {isConfirming ? <span className="text-xs font-medium whitespace-nowrap">Again?</span> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {editEntry && (
        <EditFoodEntryModal
          entry={editEntry}
          onClose={() => setEditEntry(null)}
        />
      )}
    </>
  );
}
