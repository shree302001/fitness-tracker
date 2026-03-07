import { useMemo } from 'react';
import { useFoodStore } from '../stores/useFoodStore';
import { scaleMacros } from '../utils/macroCalc';
import type { Macros } from '../types';

export function useDailyTotals(date: string): Macros {
  const foodLog = useFoodStore((s) => s.foodLog);

  return useMemo(() => {
    const entries = foodLog.filter((e) => e.date === date);
    return entries.reduce(
      (acc, entry) => {
        const scaled = scaleMacros(entry.foodItem.macrosPerServing, entry.servings);
        return {
          calories: acc.calories + scaled.calories,
          protein: Math.round((acc.protein + scaled.protein) * 10) / 10,
          carbs: Math.round((acc.carbs + scaled.carbs) * 10) / 10,
          fat: Math.round((acc.fat + scaled.fat) * 10) / 10,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [foodLog, date]);
}
