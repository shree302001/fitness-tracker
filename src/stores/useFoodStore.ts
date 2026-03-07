import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { FoodLogEntry, FoodItem, MealType, MealTemplate } from '../types';

interface FoodState {
  foodLog: FoodLogEntry[];
  customFoodItems: FoodItem[];
  mealTemplates: MealTemplate[];
  logFood: (foodItem: FoodItem, servings: number, date: string, meal: MealType) => void;
  removeFoodEntry: (entryId: string) => void;
  updateServings: (entryId: string, servings: number) => void;
  updateFoodEntry: (entryId: string, updates: Partial<{ servings: number; meal: MealType }>) => void;
  copyDayEntries: (fromDate: string, toDate: string) => void;
  addCustomFood: (food: FoodItem) => void;
  removeCustomFood: (foodId: string) => void;
  getEntriesForDate: (date: string) => FoodLogEntry[];
  saveMealAsTemplate: (name: string, entries: FoodLogEntry[]) => void;
  applyTemplate: (templateId: string, date: string) => void;
  deleteTemplate: (templateId: string) => void;
}

export const useFoodStore = create<FoodState>()(
  persist(
    (set, get) => ({
      foodLog: [],
      customFoodItems: [],
      mealTemplates: [],

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

      saveMealAsTemplate: (name, entries) =>
        set((s) => ({
          mealTemplates: [
            ...s.mealTemplates,
            {
              id: uuidv4(),
              name,
              items: entries.map((e) => ({ foodItem: e.foodItem, servings: e.servings, meal: e.meal })),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      applyTemplate: (templateId, date) => {
        const template = get().mealTemplates.find((t) => t.id === templateId);
        if (!template) return;
        const newEntries: FoodLogEntry[] = template.items.map((item) => ({
          id: uuidv4(),
          date,
          foodItem: item.foodItem,
          servings: item.servings,
          meal: item.meal,
          loggedAt: new Date().toISOString(),
        }));
        set((s) => ({ foodLog: [...s.foodLog, ...newEntries] }));
      },

      deleteTemplate: (templateId) =>
        set((s) => ({
          mealTemplates: s.mealTemplates.filter((t) => t.id !== templateId),
        })),
    }),
    { name: 'fitness-food' }
  )
);
