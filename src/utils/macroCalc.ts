import type { FoodItem, Macros, OFFProduct } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function scaleMacros(macros: Macros, servings: number): Macros {
  return {
    calories: Math.round(macros.calories * servings),
    protein: Math.round(macros.protein * servings * 10) / 10,
    carbs: Math.round(macros.carbs * servings * 10) / 10,
    fat: Math.round(macros.fat * servings * 10) / 10,
    ...(macros.fiber != null && { fiber: Math.round(macros.fiber * servings * 10) / 10 }),
    ...(macros.sugar != null && { sugar: Math.round(macros.sugar * servings * 10) / 10 }),
    ...(macros.sodium != null && { sodium: Math.round(macros.sodium * servings) }),
  };
}

export function sumMacros(items: { macros: Macros }[]): Macros {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.macros.calories,
      protein: acc.protein + item.macros.protein,
      carbs: acc.carbs + item.macros.carbs,
      fat: acc.fat + item.macros.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function macroPercent(value: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min((value / goal) * 100, 100);
}

export function estimateCalories(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9);
}

export function offProductToFoodItem(product: OFFProduct): FoodItem {
  const n = product.nutriments;
  const hasServing =
    n['energy-kcal_serving'] != null && n['energy-kcal_serving'] > 0;

  const fiber = Math.round(((hasServing ? n.fiber_serving : n.fiber_100g) ?? 0) * 10) / 10;
  const sugar = Math.round(((hasServing ? n.sugars_serving : n.sugars_100g) ?? 0) * 10) / 10;
  // OFF stores sodium in kg/100g; convert to mg
  const sodiumKg = (hasServing ? n.sodium_serving : n.sodium_100g) ?? 0;
  const sodium = Math.round(sodiumKg * 1000);

  return {
    id: product.code || uuidv4(),
    name: product.product_name,
    brand: product.brands,
    servingSize: hasServing ? parseFloat(product.serving_size || '100') || 100 : 100,
    servingLabel: hasServing ? product.serving_size || '1 serving' : '100g',
    macrosPerServing: {
      calories: Math.round(hasServing ? (n['energy-kcal_serving'] ?? 0) : (n['energy-kcal_100g'] ?? 0)),
      protein: Math.round(((hasServing ? n.proteins_serving : n.proteins_100g) ?? 0) * 10) / 10,
      carbs: Math.round(((hasServing ? n.carbohydrates_serving : n.carbohydrates_100g) ?? 0) * 10) / 10,
      fat: Math.round(((hasServing ? n.fat_serving : n.fat_100g) ?? 0) * 10) / 10,
      ...(fiber > 0 && { fiber }),
      ...(sugar > 0 && { sugar }),
      ...(sodium > 0 && { sodium }),
    },
    source: 'api',
  };
}

// Harris-Benedict BMR * activity multiplier
const ACTIVITY = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY;

export function estimateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female',
  activity: ActivityLevel
): number {
  const bmr =
    sex === 'male'
      ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
      : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  return Math.round(bmr * ACTIVITY[activity]);
}

export function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0 };
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}
