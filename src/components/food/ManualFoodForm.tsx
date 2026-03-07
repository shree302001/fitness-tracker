import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { estimateCalories } from '../../utils/macroCalc';
import type { FoodItem } from '../../types';

interface ManualFoodFormProps {
  onAdd: (food: FoodItem) => void;
}

export function ManualFoodForm({ onAdd }: ManualFoodFormProps) {
  const [form, setForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingLabel: '1 serving',
    fiber: '',
    sugar: '',
    sodium: '',
  });
  const [showMore, setShowMore] = useState(false);

  const estimatedCals = estimateCalories(
    parseFloat(form.protein) || 0,
    parseFloat(form.carbs) || 0,
    parseFloat(form.fat) || 0
  );

  function set(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function handleAdd() {
    if (!form.name.trim()) return;
    const fiber = parseFloat(form.fiber);
    const sugar = parseFloat(form.sugar);
    const sodium = parseFloat(form.sodium);
    const food: FoodItem = {
      id: uuidv4(),
      name: form.name.trim(),
      servingSize: 100,
      servingLabel: form.servingLabel || '1 serving',
      macrosPerServing: {
        calories: parseFloat(form.calories) || estimatedCals,
        protein: parseFloat(form.protein) || 0,
        carbs: parseFloat(form.carbs) || 0,
        fat: parseFloat(form.fat) || 0,
        ...(!isNaN(fiber) && fiber > 0 && { fiber }),
        ...(!isNaN(sugar) && sugar > 0 && { sugar }),
        ...(!isNaN(sodium) && sodium > 0 && { sodium }),
      },
      source: 'manual',
    };
    onAdd(food);
  }

  const isValid = form.name.trim().length > 0;

  return (
    <div className="p-4 flex flex-col gap-4">
      <Input
        label="Food name *"
        placeholder="e.g. Egg Bhurji"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
      />
      <Input
        label="Serving description"
        placeholder="e.g. 2 eggs, 100g"
        value={form.servingLabel}
        onChange={(e) => set('servingLabel', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Protein (g)"
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={form.protein}
          onChange={(e) => set('protein', e.target.value)}
          suffix="g"
        />
        <Input
          label="Carbs (g)"
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={form.carbs}
          onChange={(e) => set('carbs', e.target.value)}
          suffix="g"
        />
        <Input
          label="Fat (g)"
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={form.fat}
          onChange={(e) => set('fat', e.target.value)}
          suffix="g"
        />
        <Input
          label="Calories (kcal)"
          type="number"
          inputMode="decimal"
          placeholder={String(estimatedCals)}
          value={form.calories}
          onChange={(e) => set('calories', e.target.value)}
          suffix="kcal"
        />
      </div>

      {(form.protein || form.carbs || form.fat) && (
        <p className="text-xs text-gray-500 text-center">
          Estimated from macros: <span className="text-lime-400">{estimatedCals} kcal</span>
        </p>
      )}

      {/* More fields toggle */}
      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors self-start"
      >
        {showMore ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {showMore ? 'Hide extra fields' : 'More fields (fiber, sugar, sodium)'}
      </button>

      {showMore && (
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Fiber (g)"
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={form.fiber}
            onChange={(e) => set('fiber', e.target.value)}
            suffix="g"
          />
          <Input
            label="Sugar (g)"
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={form.sugar}
            onChange={(e) => set('sugar', e.target.value)}
            suffix="g"
          />
          <Input
            label="Sodium (mg)"
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={form.sodium}
            onChange={(e) => set('sodium', e.target.value)}
            suffix="mg"
          />
        </div>
      )}

      <Button onClick={handleAdd} disabled={!isValid} className="w-full">
        Add to Log
      </Button>
    </div>
  );
}
