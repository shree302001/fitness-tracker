import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { WeightEntry } from '../types';

interface BodyWeightState {
  entries: WeightEntry[];
  addEntry: (weight: number, date: string, notes?: string) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, weight: number, notes?: string) => void;
  getLatestEntry: () => WeightEntry | undefined;
  getEntriesInRange: (startDate: string, endDate: string) => WeightEntry[];
}

export const useBodyWeightStore = create<BodyWeightState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (weight, date, notes) =>
        set((s) => ({
          entries: [
            ...s.entries.filter((e) => e.date !== date),
            { id: uuidv4(), date, weight, loggedAt: new Date().toISOString(), notes },
          ].sort((a, b) => a.date.localeCompare(b.date)),
        })),

      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      updateEntry: (id, weight, notes) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, weight, notes } : e
          ),
        })),

      getLatestEntry: () => {
        const entries = get().entries;
        return entries[entries.length - 1];
      },

      getEntriesInRange: (startDate, endDate) =>
        get().entries.filter(
          (e) => e.date >= startDate && e.date <= endDate
        ),
    }),
    { name: 'fitness-bodyweight' }
  )
);
