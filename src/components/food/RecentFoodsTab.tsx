import { useMemo } from 'react';
import { useFoodStore } from '../../stores/useFoodStore';
import type { FoodItem } from '../../types';

interface RecentFoodsTabProps {
  onSelect: (food: FoodItem) => void;
}

export function RecentFoodsTab({ onSelect }: RecentFoodsTabProps) {
  const foodLog = useFoodStore((s) => s.foodLog);

  const recentFoods = useMemo(() => {
    const seen = new Set<string>();
    const result: FoodItem[] = [];
    for (let i = foodLog.length - 1; i >= 0 && result.length < 10; i--) {
      const key = foodLog[i].foodItem.id;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(foodLog[i].foodItem);
      }
    }
    return result;
  }, [foodLog]);

  if (recentFoods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <p className="text-sm text-gray-600">No foods logged yet.</p>
        <p className="text-xs text-gray-700 mt-1">Your 10 most recently logged foods will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-800/60">
      {recentFoods.map((food) => (
        <button
          key={food.id}
          onClick={() => onSelect(food)}
          className="flex justify-between items-center px-4 py-3 text-left hover:bg-gray-800/50 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-200 truncate">{food.name}</p>
            {food.brand && <p className="text-xs text-gray-500 truncate">{food.brand}</p>}
          </div>
          <div className="text-right shrink-0 ml-3">
            <p className="text-sm font-medium text-lime-400">{food.macrosPerServing.calories} kcal</p>
            <p className="text-xs text-gray-500">{food.servingSize}{food.servingLabel}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
