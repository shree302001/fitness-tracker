import { useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import type { Exercise, MuscleGroup } from '../../types';

interface AddExerciseModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (exercise: Exercise) => void;
}

const MUSCLE_FILTERS: (MuscleGroup | 'all')[] = [
  'all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'core', 'full-body',
];

export function AddExerciseModal({ open, onClose, onSelect }: AddExerciseModalProps) {
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup | 'all'>('all');
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const getAllExercises = useWorkoutStore((s) => s.getAllExercises);
  const exercises = getAllExercises();

  const filtered = exercises.filter((e) => {
    const matchesQuery = e.name.toLowerCase().includes(query.toLowerCase());
    const matchesMuscle = muscle === 'all' || e.muscleGroup === muscle;
    return matchesQuery && matchesMuscle;
  });

  function handleSelect(exercise: Exercise) {
    if (onSelect) {
      onSelect(exercise);
    } else {
      addExercise(exercise);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Exercise">
      <div className="flex flex-col">
        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-gray-500 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-lime-400 transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Muscle filter */}
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto">
          {MUSCLE_FILTERS.map((m) => (
            <button
              key={m}
              onClick={() => setMuscle(m)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                muscle === m
                  ? 'bg-lime-400 text-gray-950'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => handleSelect(exercise)}
              className="w-full text-left flex justify-between items-center px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors"
            >
              <div>
                <div className="text-sm text-gray-200">{exercise.name}</div>
                <div className="text-xs text-gray-600 capitalize mt-0.5">
                  {exercise.muscleGroup} · {exercise.equipment} · {exercise.category}
                </div>
              </div>
              {exercise.isCustom && (
                <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">Custom</span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-600 text-sm">No exercises found.</div>
          )}
        </div>
      </div>
    </Modal>
  );
}
