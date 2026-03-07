import { Trash2, Plus } from 'lucide-react';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { SetRow } from './SetRow';
import type { WorkoutExercise } from '../../types';

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise;
}

const MUSCLE_COLORS: Record<string, string> = {
  chest: 'bg-red-500/10 text-red-400',
  back: 'bg-blue-500/10 text-blue-400',
  shoulders: 'bg-purple-500/10 text-purple-400',
  biceps: 'bg-cyan-500/10 text-cyan-400',
  triceps: 'bg-pink-500/10 text-pink-400',
  legs: 'bg-orange-500/10 text-orange-400',
  glutes: 'bg-amber-500/10 text-amber-400',
  core: 'bg-green-500/10 text-green-400',
  'full-body': 'bg-lime-500/10 text-lime-400',
};

export function ExerciseCard({ workoutExercise: we }: ExerciseCardProps) {
  const addSet = useWorkoutStore((s) => s.addSet);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const getLastSetsForExercise = useWorkoutStore((s) => s.getLastSetsForExercise);
  const prevSets = getLastSetsForExercise(we.exercise.id);

  const muscleColor = MUSCLE_COLORS[we.exercise.muscleGroup] ?? 'bg-gray-800 text-gray-400';
  const completedCount = we.sets.filter((s) => s.completed).length;

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div>
          <div className="text-sm font-semibold text-gray-100">{we.exercise.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full ${muscleColor}`}>
              {we.exercise.muscleGroup}
            </span>
            <span className="text-xs text-gray-600">{we.exercise.equipment}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{completedCount}/{we.sets.length}</span>
          <button
            onClick={() => removeExercise(we.id)}
            className="text-gray-600 hover:text-red-400 transition-colors p-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Set header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-800/50 text-xs text-gray-600">
        <span className="col-span-1">#</span>
        <span className="col-span-3 text-center">Previous</span>
        <span className="col-span-3 text-center">kg</span>
        <span className="col-span-3 text-center">Reps</span>
        <span className="col-span-2 text-center">Done</span>
      </div>

      {/* Sets */}
      {we.sets.map((set, idx) => (
        <SetRow
          key={set.id}
          set={set}
          index={idx}
          workoutExerciseId={we.id}
          prevSet={prevSets[idx]}
        />
      ))}

      {/* Add set */}
      <button
        onClick={() => addSet(we.id)}
        className="w-full flex items-center justify-center gap-1.5 py-3 text-sm text-gray-500 hover:text-lime-400 transition-colors border-t border-gray-800/50"
      >
        <Plus size={14} /> Add Set
      </button>
    </div>
  );
}
