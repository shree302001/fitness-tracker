// ─── Macros ──────────────────────────────────────────────────────────────────

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

// ─── Food ────────────────────────────────────────────────────────────────────

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingLabel: string;
  macrosPerServing: Macros;
  source: 'preset' | 'api' | 'manual';
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout';

export interface FoodLogEntry {
  id: string;
  date: string;
  foodItem: FoodItem;
  servings: number;
  meal: MealType;
  loggedAt: string;
}

export interface MealTemplate {
  id: string;
  name: string;
  items: { foodItem: FoodItem; servings: number; meal: MealType }[];
  createdAt: string;
}

// ─── Open Food Facts ─────────────────────────────────────────────────────────

export interface OFFNutriments {
  'energy-kcal_serving'?: number;
  'energy-kcal_100g'?: number;
  proteins_serving?: number;
  proteins_100g?: number;
  carbohydrates_serving?: number;
  carbohydrates_100g?: number;
  fat_serving?: number;
  fat_100g?: number;
  fiber_serving?: number;
  fiber_100g?: number;
  sugars_serving?: number;
  sugars_100g?: number;
  sodium_serving?: number;
  sodium_100g?: number;
}

export interface OFFProduct {
  code: string;
  product_name: string;
  brands?: string;
  serving_size?: string;
  nutriments: OFFNutriments;
}

export interface OFFSearchResponse {
  products: OFFProduct[];
  count: number;
}

// ─── Workout ─────────────────────────────────────────────────────────────────

export type ExerciseCategory = 'compound' | 'isolation' | 'cardio' | 'bodyweight';
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'glutes' | 'core' | 'full-body';
export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'kettlebell' | 'band';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  isCustom: boolean;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  incline?: number;
  isWarmup: boolean;
  completed: boolean;
  isPR: boolean;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  exercises: WorkoutExercise[];
  notes?: string;
}

export interface PersonalRecord {
  exerciseId: string;
  maxWeight: number;
  maxReps: number;
  maxVolume: number;
  achievedAt: string;
}

// ─── Body Weight ─────────────────────────────────────────────────────────────

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  loggedAt: string;
  notes?: string;
}

// ─── Goals & Settings ────────────────────────────────────────────────────────

export type GoalType = 'bulk' | 'cut' | 'maintain' | 'custom';

export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UserSettings {
  weightUnit: 'kg' | 'lbs';
  name?: string;
  macroGoals: MacroGoals;
  goalType: GoalType;
  tdee?: number;
  bodyFatPct?: number;
  waterGoalMl: number;
  tdeeInput?: { weight: string; height: string; age: string; sex: 'male' | 'female'; activity: string };
  targetBfGoal?: string;
  bfPace?: 'slow' | 'moderate' | 'fast';
}

// ─── Water ───────────────────────────────────────────────────────────────────

export interface WaterEntry {
  id: string;
  date: string;
  amount: number;
  loggedAt: string;
}
