import type { Exercise } from '../types';

export const DEFAULT_EXERCISES: Exercise[] = [
  // ── CHEST ─────────────────────────────────────────────────────────────────
  { id: 'ex-bench-press', name: 'Bench Press', category: 'compound', muscleGroup: 'chest', equipment: 'barbell', isCustom: false },
  { id: 'ex-incline-bench', name: 'Incline Bench Press', category: 'compound', muscleGroup: 'chest', equipment: 'barbell', isCustom: false },
  { id: 'ex-db-press', name: 'Dumbbell Press', category: 'compound', muscleGroup: 'chest', equipment: 'dumbbell', isCustom: false },
  { id: 'ex-incline-db-press', name: 'Incline Dumbbell Press', category: 'compound', muscleGroup: 'chest', equipment: 'dumbbell', isCustom: false },
  { id: 'ex-cable-fly', name: 'Cable Fly', category: 'isolation', muscleGroup: 'chest', equipment: 'cable', isCustom: false },
  { id: 'ex-pec-deck', name: 'Pec Deck / Machine Fly', category: 'isolation', muscleGroup: 'chest', equipment: 'machine', isCustom: false },
  { id: 'ex-pushup', name: 'Push-Up', category: 'bodyweight', muscleGroup: 'chest', equipment: 'bodyweight', isCustom: false },
  { id: 'ex-dips', name: 'Dips (Chest)', category: 'compound', muscleGroup: 'chest', equipment: 'bodyweight', isCustom: false },

  // ── BACK ──────────────────────────────────────────────────────────────────
  { id: 'ex-deadlift', name: 'Deadlift', category: 'compound', muscleGroup: 'back', equipment: 'barbell', isCustom: false },
  { id: 'ex-barbell-row', name: 'Barbell Row', category: 'compound', muscleGroup: 'back', equipment: 'barbell', isCustom: false },
  { id: 'ex-pullup', name: 'Pull-Up', category: 'compound', muscleGroup: 'back', equipment: 'bodyweight', isCustom: false },
  { id: 'ex-lat-pulldown', name: 'Lat Pulldown', category: 'compound', muscleGroup: 'back', equipment: 'cable', isCustom: false },
  { id: 'ex-seated-cable-row', name: 'Seated Cable Row', category: 'compound', muscleGroup: 'back', equipment: 'cable', isCustom: false },
  { id: 'ex-db-row', name: 'Dumbbell Row', category: 'compound', muscleGroup: 'back', equipment: 'dumbbell', isCustom: false },
  { id: 'ex-t-bar-row', name: 'T-Bar Row', category: 'compound', muscleGroup: 'back', equipment: 'barbell', isCustom: false },
  { id: 'ex-face-pull', name: 'Face Pull', category: 'isolation', muscleGroup: 'back', equipment: 'cable', isCustom: false },

  // ── SHOULDERS ─────────────────────────────────────────────────────────────
  { id: 'ex-ohp', name: 'Overhead Press (Barbell)', category: 'compound', muscleGroup: 'shoulders', equipment: 'barbell', isCustom: false },
  { id: 'ex-db-shoulder-press', name: 'Dumbbell Shoulder Press', category: 'compound', muscleGroup: 'shoulders', equipment: 'dumbbell', isCustom: false },
  { id: 'ex-lateral-raise', name: 'Lateral Raise', category: 'isolation', muscleGroup: 'shoulders', equipment: 'dumbbell', isCustom: false },
  { id: 'ex-cable-lateral-raise', name: 'Cable Lateral Raise', category: 'isolation', muscleGroup: 'shoulders', equipment: 'cable', isCustom: false },
  { id: 'ex-front-raise', name: 'Front Raise', category: 'isolation', muscleGroup: 'shoulders', equipment: 'dumbbell', isCustom: false },
  { id: 'ex-rear-delt-fly', name: 'Rear Delt Fly', category: 'isolation', muscleGroup: 'shoulders', equipment: 'dumbbell', isCustom: false },

  // ── BICEPS ────────────────────────────────────────────────────────────────
  { id: 'ex-barbell-curl', name: 'Barbell Curl', category: 'isolation', muscleGroup: 'biceps', equipment: 'barbell', isCustom: false },
  { id: 'ex-db-curl', name: 'Dumbbell Curl', category: 'isolation', muscleGroup: 'biceps', equipment: 'dumbbell', isCustom: false },
  { id: 'ex-hammer-curl', name: 'Hammer Curl', category: 'isolation', muscleGroup: 'biceps', equipment: 'dumbbell', isCustom: false },
  { id: 'ex-cable-curl', name: 'Cable Curl', category: 'isolation', muscleGroup: 'biceps', equipment: 'cable', isCustom: false },
  { id: 'ex-preacher-curl', name: 'Preacher Curl', category: 'isolation', muscleGroup: 'biceps', equipment: 'machine', isCustom: false },
  { id: 'ex-incline-db-curl', name: 'Incline Dumbbell Curl', category: 'isolation', muscleGroup: 'biceps', equipment: 'dumbbell', isCustom: false },

  // ── TRICEPS ───────────────────────────────────────────────────────────────
  { id: 'ex-close-grip-bench', name: 'Close Grip Bench Press', category: 'compound', muscleGroup: 'triceps', equipment: 'barbell', isCustom: false },
  { id: 'ex-tricep-pushdown', name: 'Tricep Pushdown', category: 'isolation', muscleGroup: 'triceps', equipment: 'cable', isCustom: false },
  { id: 'ex-single-arm-pushdown', name: 'Single Arm Pushdown (Cable)', category: 'isolation', muscleGroup: 'triceps', equipment: 'cable', isCustom: false },
  { id: 'ex-overhead-tri-ext', name: 'Overhead Tricep Extension', category: 'isolation', muscleGroup: 'triceps', equipment: 'dumbbell', isCustom: false },
  { id: 'ex-overhead-tri-ext-cable', name: 'Overhead Tricep Extension (Cable)', category: 'isolation', muscleGroup: 'triceps', equipment: 'cable', isCustom: false },
  { id: 'ex-skull-crusher', name: 'Skull Crusher', category: 'isolation', muscleGroup: 'triceps', equipment: 'barbell', isCustom: false },
  { id: 'ex-tricep-dip', name: 'Tricep Dip (Bench)', category: 'bodyweight', muscleGroup: 'triceps', equipment: 'bodyweight', isCustom: false },
  { id: 'ex-diamond-pushup', name: 'Diamond Push-Up', category: 'bodyweight', muscleGroup: 'triceps', equipment: 'bodyweight', isCustom: false },

  // ── LEGS ──────────────────────────────────────────────────────────────────
  { id: 'ex-squat', name: 'Barbell Squat', category: 'compound', muscleGroup: 'legs', equipment: 'barbell', isCustom: false },
  { id: 'ex-leg-press', name: 'Leg Press', category: 'compound', muscleGroup: 'legs', equipment: 'machine', isCustom: false },
  { id: 'ex-rdl', name: 'Romanian Deadlift', category: 'compound', muscleGroup: 'legs', equipment: 'barbell', isCustom: false },
  { id: 'ex-lunges', name: 'Dumbbell Lunges', category: 'compound', muscleGroup: 'legs', equipment: 'dumbbell', isCustom: false },
  { id: 'ex-leg-extension', name: 'Leg Extension', category: 'isolation', muscleGroup: 'legs', equipment: 'machine', isCustom: false },
  { id: 'ex-leg-curl', name: 'Lying Leg Curl', category: 'isolation', muscleGroup: 'legs', equipment: 'machine', isCustom: false },
  { id: 'ex-standing-calf-raise', name: 'Standing Calf Raise', category: 'isolation', muscleGroup: 'legs', equipment: 'machine', isCustom: false },
  { id: 'ex-hack-squat', name: 'Hack Squat', category: 'compound', muscleGroup: 'legs', equipment: 'machine', isCustom: false },
  { id: 'ex-bulgarian-squat', name: 'Bulgarian Split Squat', category: 'compound', muscleGroup: 'legs', equipment: 'dumbbell', isCustom: false },

  // ── GLUTES ────────────────────────────────────────────────────────────────
  { id: 'ex-hip-thrust', name: 'Hip Thrust', category: 'compound', muscleGroup: 'glutes', equipment: 'barbell', isCustom: false },
  { id: 'ex-cable-kickback', name: 'Cable Kickback', category: 'isolation', muscleGroup: 'glutes', equipment: 'cable', isCustom: false },
  { id: 'ex-sumo-deadlift', name: 'Sumo Deadlift', category: 'compound', muscleGroup: 'glutes', equipment: 'barbell', isCustom: false },

  // ── CORE ──────────────────────────────────────────────────────────────────
  { id: 'ex-plank', name: 'Plank', category: 'bodyweight', muscleGroup: 'core', equipment: 'bodyweight', isCustom: false },
  { id: 'ex-cable-crunch', name: 'Cable Crunch', category: 'isolation', muscleGroup: 'core', equipment: 'cable', isCustom: false },
  { id: 'ex-hanging-leg-raise', name: 'Hanging Leg Raise', category: 'bodyweight', muscleGroup: 'core', equipment: 'bodyweight', isCustom: false },
  { id: 'ex-russian-twist', name: 'Russian Twist', category: 'bodyweight', muscleGroup: 'core', equipment: 'bodyweight', isCustom: false },
  { id: 'ex-ab-rollout', name: 'Ab Wheel Rollout', category: 'bodyweight', muscleGroup: 'core', equipment: 'bodyweight', isCustom: false },

  // ── CARDIO ────────────────────────────────────────────────────────────────
  { id: 'ex-treadmill', name: 'Treadmill', category: 'cardio', muscleGroup: 'full-body', equipment: 'machine', isCustom: false },
  { id: 'ex-cycling', name: 'Stationary Bike', category: 'cardio', muscleGroup: 'full-body', equipment: 'machine', isCustom: false },
  { id: 'ex-elliptical', name: 'Elliptical', category: 'cardio', muscleGroup: 'full-body', equipment: 'machine', isCustom: false },
  { id: 'ex-jump-rope', name: 'Jump Rope', category: 'cardio', muscleGroup: 'full-body', equipment: 'bodyweight', isCustom: false },
];
