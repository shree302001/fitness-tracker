import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings, MacroGoals, GoalType } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  weightUnit: 'kg',
  macroGoals: {
    calories: 2400,
    protein: 180,
    carbs: 240,
    fat: 80,
  },
  goalType: 'maintain',
  waterGoalMl: 2500,
};

interface GoalsState {
  settings: UserSettings;
  updateMacroGoals: (goals: MacroGoals) => void;
  updateGoalType: (goalType: GoalType) => void;
  updateWeightUnit: (unit: 'kg' | 'lbs') => void;
  updateName: (name: string) => void;
  setTDEE: (tdee: number) => void;
  updateBodyFat: (pct: number | undefined) => void;
  setWaterGoal: (ml: number) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateMacroGoals: (goals) =>
        set((s) => ({ settings: { ...s.settings, macroGoals: goals } })),
      updateGoalType: (goalType) =>
        set((s) => ({ settings: { ...s.settings, goalType } })),
      updateWeightUnit: (unit) =>
        set((s) => ({ settings: { ...s.settings, weightUnit: unit } })),
      updateName: (name) =>
        set((s) => ({ settings: { ...s.settings, name } })),
      setTDEE: (tdee) =>
        set((s) => ({ settings: { ...s.settings, tdee } })),
      updateBodyFat: (bodyFatPct) =>
        set((s) => ({ settings: { ...s.settings, bodyFatPct } })),
      setWaterGoal: (waterGoalMl) =>
        set((s) => ({ settings: { ...s.settings, waterGoalMl } })),
      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),
    }),
    { name: 'fitness-goals' }
  )
);
