import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ServingAdjuster } from './ServingAdjuster';
import { useFoodStore } from '../../stores/useFoodStore';
import type { FoodLogEntry, MealType } from '../../types';

const MEAL_TYPES: MealType[] = ['breakfast', 'pre-workout', 'lunch', 'dinner', 'post-workout', 'snack'];
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  'pre-workout': 'Pre-Workout',
  'post-workout': 'Post-Workout',
};

interface EditFoodEntryModalProps {
  entry: FoodLogEntry;
  onClose: () => void;
}

export function EditFoodEntryModal({ entry, onClose }: EditFoodEntryModalProps) {
  const [meal, setMeal] = useState<MealType>(entry.meal);
  const updateFoodEntry = useFoodStore((s) => s.updateFoodEntry);

  function handleLog(servings: number) {
    updateFoodEntry(entry.id, { servings, meal });
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={`Edit — ${entry.foodItem.name}`}>
      <div className="flex flex-col">
        {/* Meal selector */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {MEAL_TYPES.map((m) => (
              <button
                key={m}
                onClick={() => setMeal(m)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  meal === m
                    ? 'bg-lime-400 text-gray-950'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {MEAL_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        <ServingAdjuster
          food={entry.foodItem}
          initialServings={entry.servings}
          onLog={handleLog}
          onBack={onClose}
          logLabel="Save changes"
        />
      </div>
    </Modal>
  );
}
