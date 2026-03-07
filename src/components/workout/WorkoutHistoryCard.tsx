import { useState } from 'react';
import { Clock, Trophy, ChevronDown, ChevronUp, Pencil, Trash2, Copy, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { ExerciseProgressModal } from './ExerciseProgressModal';
import type { WorkoutSession, WorkoutExercise } from '../../types';

interface WorkoutHistoryCardProps {
  session: WorkoutSession;
  onEdit: () => void;
  onDelete: () => void;
  onUseAsTemplate?: (session: WorkoutSession) => void;
}

export function WorkoutHistoryCard({ session, onEdit, onDelete, onUseAsTemplate }: WorkoutHistoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [progressExercise, setProgressExercise] = useState<WorkoutExercise | null>(null);

  const duration = session.completedAt
    ? Math.round(
        (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000
      )
    : null;

  const totalVolume = session.exercises.reduce(
    (total, we) => total + we.sets.filter((s) => s.completed).reduce((sum, s) => sum + s.weight * s.reps, 0),
    0
  );

  const prCount = session.exercises.reduce(
    (total, we) => total + we.sets.filter((s) => s.isPR).length,
    0
  );

  return (
    <>
      <Card className="overflow-hidden">
        {/* Header — tap to expand */}
        <button className="w-full text-left p-4" onClick={() => setExpanded((v) => !v)}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-semibold text-gray-100">{session.name}</div>
              <div className="flex items-center gap-3 mt-0.5">
                {duration !== null && duration > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={11} />
                    {duration} min
                  </div>
                )}
                {prCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-yellow-400">
                    <Trophy size={11} />
                    {prCount} PR{prCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
            {expanded ? (
              <ChevronUp size={16} className="text-gray-600 mt-0.5" />
            ) : (
              <ChevronDown size={16} className="text-gray-600 mt-0.5" />
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center border-t border-gray-800 pt-3 mt-3">
            <div>
              <div className="text-sm font-semibold text-gray-200">{session.exercises.length}</div>
              <div className="text-xs text-gray-600">Exercises</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-200">
                {session.exercises.reduce((t, e) => t + e.sets.filter((s) => s.completed).length, 0)}
              </div>
              <div className="text-xs text-gray-600">Sets</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-200">{Math.round(totalVolume)} kg</div>
              <div className="text-xs text-gray-600">Volume</div>
            </div>
          </div>
        </button>

        {/* Expanded detail */}
        {expanded && (
          <div className="border-t border-gray-800">
            {session.exercises.map((we) => (
              <div key={we.id} className="px-4 py-3 border-b border-gray-800/60 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <button
                    onClick={() => setProgressExercise(we)}
                    className="text-sm font-medium text-gray-200 hover:text-lime-400 transition-colors flex items-center gap-1.5"
                  >
                    {we.exercise.name}
                    <TrendingUp size={12} className="text-gray-600" />
                  </button>
                  {we.sets.some((s) => s.isPR) && (
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <Trophy size={10} /> PR
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {we.sets.filter((s) => s.completed).map((s, idx) => (
                    <span
                      key={s.id}
                      className={`text-xs px-2 py-1 rounded-lg ${
                        s.isPR
                          ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {we.exercise.category === 'cardio'
                        ? `${idx + 1}. ${s.incline != null ? `${s.incline}% ` : ''}${s.weight > 0 ? `${s.weight}km/h` : '—'} ${s.reps > 0 ? `${s.reps}min` : ''}`
                        : `${idx + 1}. ${s.weight > 0 ? `${s.weight}kg` : '—'} × ${s.reps}`}
                    </span>
                  ))}
                </div>
                {we.notes && (
                  <p className="text-xs text-gray-600 mt-1.5 italic">{we.notes}</p>
                )}
              </div>
            ))}

            {/* Actions */}
            <div className="flex gap-2 p-3">
              <button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Pencil size={13} /> Edit
              </button>
              {onUseAsTemplate && (
                <button
                  onClick={() => onUseAsTemplate(session)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-400 hover:text-lime-400 hover:bg-gray-700 transition-colors"
                >
                  <Copy size={13} /> Template
                </button>
              )}
              {confirmDelete ? (
                <>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-400"
                  >
                    Keep
                  </button>
                  <button
                    onClick={onDelete}
                    className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        )}
      </Card>

      {progressExercise && (
        <ExerciseProgressModal
          exerciseId={progressExercise.exercise.id}
          exerciseName={progressExercise.exercise.name}
          onClose={() => setProgressExercise(null)}
        />
      )}
    </>
  );
}
