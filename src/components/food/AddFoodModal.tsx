import { useState } from 'react';
import { ScanLine } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { GymPresetsGrid } from './GymPresetsGrid';
import { FoodSearchTab } from './FoodSearchTab';
import { ManualFoodForm } from './ManualFoodForm';
import { ServingAdjuster } from './ServingAdjuster';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { MealTemplatesTab } from './MealTemplatesTab';
import { useFoodStore } from '../../stores/useFoodStore';
import type { FoodItem, MealType } from '../../types';
import { guessMealFromTime } from '../../utils/dateUtils';

const TABS = ['Presets', 'Search', 'Manual', 'Templates'] as const;
type Tab = typeof TABS[number];

const MEAL_TYPES: MealType[] = ['breakfast', 'pre-workout', 'lunch', 'dinner', 'post-workout', 'snack'];
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  'pre-workout': 'Pre-Workout',
  'post-workout': 'Post-Workout',
};

interface AddFoodModalProps {
  open: boolean;
  onClose: () => void;
  date: string;
}

export function AddFoodModal({ open, onClose, date }: AddFoodModalProps) {
  const [tab, setTab] = useState<Tab>('Presets');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [meal, setMeal] = useState<MealType>(guessMealFromTime());
  const [showScanner, setShowScanner] = useState(false);
  const logFood = useFoodStore((s) => s.logFood);
  const addCustomFood = useFoodStore((s) => s.addCustomFood);
  const customFoodItems = useFoodStore((s) => s.customFoodItems);

  function handleFoodSelect(food: FoodItem) {
    setSelectedFood(food);
  }

  function handleManualAdd(food: FoodItem) {
    // Auto-save to My Foods for future reuse (skip duplicates by name)
    const exists = customFoodItems.some(
      (c) => c.name.toLowerCase() === food.name.toLowerCase()
    );
    if (!exists) addCustomFood(food);
    setSelectedFood(food);
  }

  function handleLog(servings: number) {
    if (!selectedFood) return;
    logFood(selectedFood, servings, date, meal);
    setSelectedFood(null);
    onClose();
  }

  function handleClose() {
    setSelectedFood(null);
    onClose();
  }

  if (showScanner) {
    return (
      <BarcodeScannerModal
        onSelect={(food) => { setShowScanner(false); setSelectedFood(food); }}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  if (selectedFood) {
    return (
      <Modal open={open} onClose={handleClose} title={selectedFood.name}>
        <ServingAdjuster food={selectedFood} onLog={handleLog} onBack={() => setSelectedFood(null)} />
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Log Food">
      <div className="flex flex-col">
        {/* Meal selector — hidden on Templates tab */}
        {tab !== 'Templates' && (
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
        )}

        {/* Tab bar + scan button */}
        <div className="flex items-center border-b border-gray-800 px-4">
          <div className="flex flex-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  tab === t
                    ? 'border-lime-400 text-lime-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {tab !== 'Templates' && (
            <button
              onClick={() => setShowScanner(true)}
              className="ml-2 p-2 text-gray-500 hover:text-lime-400 transition-colors shrink-0"
              title="Scan barcode"
            >
              <ScanLine size={18} />
            </button>
          )}
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto" style={{ maxHeight: '55vh' }}>
          {tab === 'Presets' && <GymPresetsGrid onSelect={handleFoodSelect} />}
          {tab === 'Search' && <FoodSearchTab onSelect={handleFoodSelect} />}
          {tab === 'Manual' && <ManualFoodForm onAdd={handleManualAdd} />}
          {tab === 'Templates' && (
            <MealTemplatesTab date={date} currentMeal={meal} onApplied={onClose} />
          )}
        </div>
      </div>
    </Modal>
  );
}
