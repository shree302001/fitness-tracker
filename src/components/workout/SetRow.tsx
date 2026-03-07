import { Check, Trophy, Trash2 } from 'lucide-react';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import type { WorkoutSet } from '../../types';

interface SetRowProps {
  set: WorkoutSet;
  index: number;
  workoutExerciseId: string;
  prevSet?: WorkoutSet;
}

export function SetRow({ set, index, workoutExerciseId, prevSet }: SetRowProps) {
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleSetComplete = useWorkoutStore((s) => s.toggleSetComplete);
  const removeSet = useWorkoutStore((s) => s.removeSet);

  function update(field: 'weight' | 'reps', val: string) {
    const num = parseFloat(val) || 0;
    updateSet(workoutExerciseId, set.id, { [field]: num });
  }

  return (
    <div
      className={`grid grid-cols-12 gap-2 px-4 py-2.5 items-center border-b border-gray-800/30 last:border-0 transition-colors ${
        set.completed ? 'bg-lime-400/5' : ''
      }`}
    >
      {/* Set # */}
      <div className="col-span-1 flex items-center gap-1">
        <span className="text-xs text-gray-600">{index + 1}</span>
        {set.isPR && <Trophy size={10} className="text-yellow-400" />}
      </div>

      {/* Previous */}
      <div className="col-span-3 text-center text-xs text-gray-600">
        {prevSet && prevSet.weight > 0 ? `${prevSet.weight}×${prevSet.reps}` : '—'}
      </div>

      {/* Weight */}
      <div className="col-span-3">
        <input
          type="number"
          inputMode="decimal"
          value={set.weight || ''}
          onChange={(e) => update('weight', e.target.value)}
          placeholder="0"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-center text-sm text-gray-100 focus:outline-none focus:border-lime-400 transition-colors"
        />
      </div>

      {/* Reps */}
      <div className="col-span-3">
        <input
          type="number"
          inputMode="numeric"
          value={set.reps || ''}
          onChange={(e) => update('reps', e.target.value)}
          placeholder="0"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-center text-sm text-gray-100 focus:outline-none focus:border-lime-400 transition-colors"
        />
      </div>

      {/* Done checkbox */}
      <div className="col-span-2 flex items-center justify-center gap-1">
        <button
          onClick={() => toggleSetComplete(workoutExerciseId, set.id)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            set.completed
              ? 'bg-lime-400 text-gray-950'
              : 'bg-gray-800 border border-gray-700 text-gray-600 hover:border-lime-400'
          }`}
        >
          {set.completed && <Check size={14} strokeWidth={2.5} />}
        </button>
        <button
          onClick={() => removeSet(workoutExerciseId, set.id)}
          className="text-gray-700 hover:text-red-400 transition-colors p-0.5"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
