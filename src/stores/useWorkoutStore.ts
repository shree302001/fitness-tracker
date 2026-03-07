import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { WorkoutSession, WorkoutExercise, WorkoutSet, Exercise, PersonalRecord } from '../types';
import { DEFAULT_EXERCISES } from '../data/exerciseLibrary';

interface WorkoutState {
  sessions: WorkoutSession[];
  activeSession: WorkoutSession | null;
  personalRecords: Record<string, PersonalRecord>;
  customExercises: Exercise[];

  // Session
  startSession: (name: string) => void;
  finishSession: (durationMins?: number) => void;
  cancelSession: () => void;
  saveSession: (session: WorkoutSession) => void;
  deleteSession: (id: string) => void;

  // Exercises in active session
  addExercise: (exercise: Exercise) => void;
  removeExercise: (workoutExerciseId: string) => void;

  // Sets
  addSet: (workoutExerciseId: string) => void;
  updateSet: (workoutExerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  removeSet: (workoutExerciseId: string, setId: string) => void;
  toggleSetComplete: (workoutExerciseId: string, setId: string) => void;

  // PRs
  checkAndUpdatePR: (exerciseId: string, weight: number, reps: number) => boolean;
  getPR: (exerciseId: string) => PersonalRecord | undefined;

  // Custom exercises
  addCustomExercise: (exercise: Omit<Exercise, 'id' | 'isCustom'>) => void;

  // Selectors
  getAllExercises: () => Exercise[];
  getSessionsForDate: (date: string) => WorkoutSession[];
  getLastSetsForExercise: (exerciseId: string) => WorkoutSet[];
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSession: null,
      personalRecords: {},
      customExercises: [],

      startSession: (name) => {
        const session: WorkoutSession = {
          id: uuidv4(),
          date: todayISO(),
          name,
          startedAt: new Date().toISOString(),
          exercises: [],
        };
        set({ activeSession: session });
      },

      finishSession: (durationMins?: number) => {
        const { activeSession, checkAndUpdatePR } = get();
        if (!activeSession) return;

        // Detect PRs on all completed sets
        const updatedExercises = activeSession.exercises.map((we) => ({
          ...we,
          sets: we.sets.map((s) => {
            if (s.completed && s.weight > 0 && s.reps > 0) {
              const isPR = checkAndUpdatePR(we.exercise.id, s.weight, s.reps);
              return { ...s, isPR };
            }
            return s;
          }),
        }));

        const completed: WorkoutSession = {
          ...activeSession,
          exercises: updatedExercises,
          completedAt: durationMins
            ? new Date(new Date(activeSession.startedAt).getTime() + durationMins * 60000).toISOString()
            : new Date().toISOString(),
        };
        set((s) => ({ sessions: [completed, ...s.sessions], activeSession: null }));

        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
      },

      cancelSession: () => set({ activeSession: null }),

      saveSession: (session) => {
        const { checkAndUpdatePR } = get();
        // Detect PRs on all sets
        const updatedExercises = session.exercises.map((we) => ({
          ...we,
          sets: we.sets.map((s) => {
            if (s.weight > 0 && s.reps > 0) {
              const isPR = checkAndUpdatePR(we.exercise.id, s.weight, s.reps);
              return { ...s, isPR };
            }
            return s;
          }),
        }));
        const updated = { ...session, exercises: updatedExercises };
        set((s) => {
          const idx = s.sessions.findIndex((ss) => ss.id === session.id);
          if (idx >= 0) {
            const next = [...s.sessions];
            next[idx] = updated;
            return { sessions: next };
          }
          return { sessions: [updated, ...s.sessions] };
        });
        if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
      },

      deleteSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((ss) => ss.id !== id) })),

      addExercise: (exercise) => {
        const we: WorkoutExercise = {
          id: uuidv4(),
          exercise,
          sets: [{ id: uuidv4(), reps: 0, weight: 0, isWarmup: false, completed: false, isPR: false }],
        };
        set((s) => ({
          activeSession: s.activeSession
            ? { ...s.activeSession, exercises: [...s.activeSession.exercises, we] }
            : null,
        }));
      },

      removeExercise: (workoutExerciseId) =>
        set((s) => ({
          activeSession: s.activeSession
            ? {
                ...s.activeSession,
                exercises: s.activeSession.exercises.filter((e) => e.id !== workoutExerciseId),
              }
            : null,
        })),

      addSet: (workoutExerciseId) => {
        const newSet: WorkoutSet = { id: uuidv4(), reps: 0, weight: 0, isWarmup: false, completed: false, isPR: false };
        set((s) => ({
          activeSession: s.activeSession
            ? {
                ...s.activeSession,
                exercises: s.activeSession.exercises.map((we) =>
                  we.id === workoutExerciseId
                    ? { ...we, sets: [...we.sets, newSet] }
                    : we
                ),
              }
            : null,
        }));
      },

      updateSet: (workoutExerciseId, setId, updates) =>
        set((s) => ({
          activeSession: s.activeSession
            ? {
                ...s.activeSession,
                exercises: s.activeSession.exercises.map((we) =>
                  we.id === workoutExerciseId
                    ? {
                        ...we,
                        sets: we.sets.map((st) =>
                          st.id === setId ? { ...st, ...updates } : st
                        ),
                      }
                    : we
                ),
              }
            : null,
        })),

      removeSet: (workoutExerciseId, setId) =>
        set((s) => ({
          activeSession: s.activeSession
            ? {
                ...s.activeSession,
                exercises: s.activeSession.exercises.map((we) =>
                  we.id === workoutExerciseId
                    ? { ...we, sets: we.sets.filter((st) => st.id !== setId) }
                    : we
                ),
              }
            : null,
        })),

      toggleSetComplete: (workoutExerciseId, setId) =>
        set((s) => ({
          activeSession: s.activeSession
            ? {
                ...s.activeSession,
                exercises: s.activeSession.exercises.map((we) =>
                  we.id === workoutExerciseId
                    ? {
                        ...we,
                        sets: we.sets.map((st) =>
                          st.id === setId ? { ...st, completed: !st.completed } : st
                        ),
                      }
                    : we
                ),
              }
            : null,
        })),

      checkAndUpdatePR: (exerciseId, weight, reps) => {
        const existing = get().personalRecords[exerciseId];
        const volume = weight * reps;
        const isNewPR =
          !existing ||
          weight > existing.maxWeight ||
          (weight === existing.maxWeight && reps > existing.maxReps) ||
          volume > existing.maxVolume;

        if (isNewPR) {
          set((s) => ({
            personalRecords: {
              ...s.personalRecords,
              [exerciseId]: {
                exerciseId,
                maxWeight: Math.max(weight, existing?.maxWeight ?? 0),
                maxReps: Math.max(reps, existing?.maxReps ?? 0),
                maxVolume: Math.max(volume, existing?.maxVolume ?? 0),
                achievedAt: new Date().toISOString(),
              },
            },
          }));
        }
        return isNewPR;
      },

      getPR: (exerciseId) => get().personalRecords[exerciseId],

      addCustomExercise: (exercise) => {
        const newEx: Exercise = { ...exercise, id: uuidv4(), isCustom: true };
        set((s) => ({ customExercises: [...s.customExercises, newEx] }));
      },

      getAllExercises: () => [...DEFAULT_EXERCISES, ...get().customExercises],

      getSessionsForDate: (date) =>
        get().sessions.filter((s) => s.date === date),

      getLastSetsForExercise: (exerciseId) => {
        const sessions = get().sessions;
        for (let i = 0; i < sessions.length; i++) {
          const we = sessions[i].exercises.find((e) => e.exercise.id === exerciseId);
          if (we) return we.sets;
        }
        return [];
      },
    }),
    { name: 'fitness-workout' }
  )
);
