import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { FoodLogEntry, FoodItem, MealType } from '../types';

interface FoodState {
  foodLog: FoodLogEntry[];
  customFoodItems: FoodItem[];
  logFood: (foodItem: FoodItem, servings: number, date: string, meal: MealType) => void;
  removeFoodEntry: (entryId: string) => void;
  updateServings: (entryId: string, servings: number) => void;
  updateFoodEntry: (entryId: string, updates: Partial<{ servings: number; meal: MealType }>) => void;
  copyDayEntries: (fromDate: string, toDate: string) => void;
  addCustomFood: (food: FoodItem) => void;
  removeCustomFood: (foodId: string) => void;
  getEntriesForDate: (date: string) => FoodLogEntry[];
}

export const useFoodStore = create<FoodState>()(
  persist(
    (set, get) => ({
      foodLog: [],
      customFoodItems: [],

      logFood: (foodItem, servings, date, meal) =>
        set((s) => ({
          foodLog: [
            ...s.foodLog,
            {
              id: uuidv4(),
              date,
              foodItem,
              servings,
              meal,
              loggedAt: new Date().toISOString(),
            },
          ],
        })),

      removeFoodEntry: (entryId) =>
        set((s) => ({ foodLog: s.foodLog.filter((e) => e.id !== entryId) })),

      updateServings: (entryId, servings) =>
        set((s) => ({
          foodLog: s.foodLog.map((e) =>
            e.id === entryId ? { ...e, servings } : e
          ),
        })),

      updateFoodEntry: (entryId, updates) =>
        set((s) => ({
          foodLog: s.foodLog.map((e) =>
            e.id === entryId ? { ...e, ...updates } : e
          ),
        })),

      copyDayEntries: (fromDate, toDate) => {
        const entries = get().foodLog.filter((e) => e.date === fromDate);
        const copied = entries.map((e) => ({
          ...e,
          id: uuidv4(),
          date: toDate,
          loggedAt: new Date().toISOString(),
        }));
        set((s) => ({ foodLog: [...s.foodLog, ...copied] }));
      },

      addCustomFood: (food) =>
        set((s) => ({ customFoodItems: [...s.customFoodItems, food] })),

      removeCustomFood: (foodId) =>
        set((s) => ({
          customFoodItems: s.customFoodItems.filter((f) => f.id !== foodId),
        })),

      getEntriesForDate: (date) =>
        get().foodLog.filter((e) => e.date === date),
    }),
    { name: 'fitness-food' }
  )
);
