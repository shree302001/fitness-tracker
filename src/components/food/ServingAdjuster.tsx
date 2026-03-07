import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { scaleMacros } from '../../utils/macroCalc';
import type { FoodItem } from '../../types';

interface ServingAdjusterProps {
  food: FoodItem;
  onLog: (servings: number) => void;
  onBack: () => void;
  initialServings?: number;
  logLabel?: string;
}

const QUICK_AMOUNTS = [0.5, 1, 1.5, 2, 3];

export function ServingAdjuster({ food, onLog, onBack, initialServings = 1, logLabel }: ServingAdjusterProps) {
  const [servings, setServings] = useState(initialServings);
  const scaled = scaleMacros(food.macrosPerServing, servings);

  return (
    <div className="p-5 flex flex-col gap-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div>
        <div className="text-base font-semibold text-gray-100">{food.name}</div>
        {food.brand && <div className="text-sm text-gray-500">{food.brand}</div>}
        <div className="text-xs text-gray-600 mt-0.5">{food.servingLabel}</div>
      </div>

      {/* Quick servings */}
      <div>
        <div className="text-xs text-gray-500 mb-2">Quick amounts</div>
        <div className="flex gap-2">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setServings(amt)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                servings === amt
                  ? 'bg-lime-400 text-gray-950'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {amt}×
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      <div>
        <div className="text-xs text-gray-500 mb-2">Custom amount</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setServings((s) => Math.max(0.25, Math.round((s - 0.25) * 4) / 4))}
            className="w-10 h-10 bg-gray-800 rounded-xl text-lg text-gray-300 hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            −
          </button>
          <input
            type="number"
            inputMode="decimal"
            value={servings}
            min={0.25}
            step={0.25}
            onChange={(e) => setServings(Math.max(0.25, parseFloat(e.target.value) || 1))}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-center text-gray-100 text-base font-semibold focus:outline-none focus:border-lime-400"
          />
          <button
            onClick={() => setServings((s) => Math.round((s + 0.25) * 4) / 4)}
            className="w-10 h-10 bg-gray-800 rounded-xl text-lg text-gray-300 hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {/* Macro preview */}
      <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-base font-bold text-lime-400">{scaled.calories}</div>
            <div className="text-xs text-gray-500">kcal</div>
          </div>
          <div>
            <div className="text-base font-bold text-blue-400">{scaled.protein}g</div>
            <div className="text-xs text-gray-500">Protein</div>
          </div>
          <div>
            <div className="text-base font-bold text-yellow-400">{scaled.carbs}g</div>
            <div className="text-xs text-gray-500">Carbs</div>
          </div>
          <div>
            <div className="text-base font-bold text-orange-400">{scaled.fat}g</div>
            <div className="text-xs text-gray-500">Fat</div>
          </div>
        </div>
        {(scaled.fiber != null || scaled.sugar != null || scaled.sodium != null) && (
          <div className="flex gap-4 border-t border-gray-700 pt-2 text-center">
            {scaled.fiber != null && (
              <div className="flex-1">
                <div className="text-sm font-semibold text-green-400">{scaled.fiber}g</div>
                <div className="text-xs text-gray-500">Fiber</div>
              </div>
            )}
            {scaled.sugar != null && (
              <div className="flex-1">
                <div className="text-sm font-semibold text-pink-400">{scaled.sugar}g</div>
                <div className="text-xs text-gray-500">Sugar</div>
              </div>
            )}
            {scaled.sodium != null && (
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-300">{scaled.sodium}mg</div>
                <div className="text-xs text-gray-500">Sodium</div>
              </div>
            )}
          </div>
        )}
      </div>

      <Button onClick={() => onLog(servings)} className="w-full" size="lg">
        {logLabel ?? `Log ${servings}× ${food.name}`}
      </Button>
    </div>
  );
}
