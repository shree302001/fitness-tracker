import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { WaterEntry } from '../types';

interface WaterState {
  waterLog: WaterEntry[];
  addWater: (date: string, amount: number) => void;
  removeWater: (id: string) => void;
  getTotalForDate: (date: string) => number;
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      waterLog: [],

      addWater: (date, amount) =>
        set((s) => ({
          waterLog: [
            ...s.waterLog,
            { id: uuidv4(), date, amount, loggedAt: new Date().toISOString() },
          ],
        })),

      removeWater: (id) =>
        set((s) => ({ waterLog: s.waterLog.filter((e) => e.id !== id) })),

      getTotalForDate: (date) =>
        get()
          .waterLog.filter((e) => e.date === date)
          .reduce((sum, e) => sum + e.amount, 0),
    }),
    { name: 'fitness-water' }
  )
);
