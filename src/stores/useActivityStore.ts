import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface SleepEntry {
  id: string;
  date: string;       // YYYY-MM-DD — the date you woke up
  bedtime: string;    // HH:MM 24-hour
  wakeTime: string;   // HH:MM 24-hour
  durationMinutes: number;
}

interface ActivityState {
  sleepLog: SleepEntry[];
  stepGoal: number;
  logSleep: (date: string, bedtime: string, wakeTime: string) => void;
  removeSleep: (id: string) => void;
  setStepGoal: (goal: number) => void;
}

function calcDuration(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let bedMins = bh * 60 + bm;
  let wakeMins = wh * 60 + wm;
  if (wakeMins <= bedMins) wakeMins += 24 * 60; // slept past midnight
  return wakeMins - bedMins;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      sleepLog: [],
      stepGoal: 10000,

      logSleep: (date, bedtime, wakeTime) =>
        set((s) => {
          const durationMinutes = calcDuration(bedtime, wakeTime);
          const existing = s.sleepLog.findIndex((e) => e.date === date);
          const entry: SleepEntry = { id: existing >= 0 ? s.sleepLog[existing].id : uuidv4(), date, bedtime, wakeTime, durationMinutes };
          if (existing >= 0) {
            const updated = [...s.sleepLog];
            updated[existing] = entry;
            return { sleepLog: updated };
          }
          return { sleepLog: [...s.sleepLog, entry].sort((a, b) => a.date.localeCompare(b.date)) };
        }),

      removeSleep: (id) =>
        set((s) => ({ sleepLog: s.sleepLog.filter((e) => e.id !== id) })),

      setStepGoal: (goal) => set({ stepGoal: goal }),
    }),
    { name: 'fitness-activity' }
  )
);
