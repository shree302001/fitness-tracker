import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, X, Timer } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { AddExerciseModal } from './AddExerciseModal';
import { RestTimerModal } from './RestTimerModal';
import type { WorkoutSession, WorkoutExercise, Exercise } from '../../types';

interface FormSet {
  id: string;
  weight: string;
  reps: string;
  incline: string;
}

interface FormExercise {
  id: string;
  exercise: Exercise;
  sets: FormSet[];
  notes: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  session: WorkoutSession | null;
  date: string;
  templateSession?: WorkoutSession | null;
}

const QUICK_NAMES = ['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Full Body', 'Cardio'];

function sessionToForm(session: WorkoutSession, asTemplate = false): FormExercise[] {
  return session.exercises.map((we) => ({
    id: uuidv4(),
    exercise: we.exercise,
    notes: we.notes ?? '',
    sets: asTemplate
      ? [{ id: uuidv4(), weight: '', reps: '', incline: '' }]
      : we.sets.map((s) => ({
          id: s.id,
          weight: s.weight > 0 ? String(s.weight) : '',
          reps: s.reps > 0 ? String(s.reps) : '',
          incline: s.incline != null && s.incline > 0 ? String(s.incline) : '',
        })),
  }));
}

export function WorkoutFormModal({ open, onClose, session, date, templateSession }: Props) {
  const saveSession = useWorkoutStore((s) => s.saveSession);

  const initialExercises = templateSession
    ? sessionToForm(templateSession, true)
    : session
    ? sessionToForm(session)
    : [];

  const [name, setName] = useState(templateSession?.name ?? session?.name ?? '');
  const [durationMins, setDurationMins] = useState(() => {
    if (!session?.completedAt) return '';
    const ms = new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime();
    return String(Math.round(ms / 60000));
  });
  const [formExercises, setFormExercises] = useState<FormExercise[]>(initialExercises);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);

  function handleAddExercise(exercise: Exercise) {
    setFormExercises((prev) => [
      ...prev,
      { id: uuidv4(), exercise, sets: [{ id: uuidv4(), weight: '', reps: '', incline: '' }], notes: '' },
    ]);
  }

  function removeExercise(id: string) {
    setFormExercises((prev) => prev.filter((e) => e.id !== id));
  }

  function addSet(exerciseId: string) {
    setFormExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId
          ? { ...e, sets: [...e.sets, { id: uuidv4(), weight: '', reps: '', incline: '' }] }
          : e
      )
    );
  }

  function removeSet(exerciseId: string, setId: string) {
    setFormExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e
      )
    );
  }

  function updateSet(exerciseId: string, setId: string, field: 'weight' | 'reps' | 'incline', value: string) {
    setFormExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId
          ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)) }
          : e
      )
    );
  }

  function updateNotes(exerciseId: string, notes: string) {
    setFormExercises((prev) =>
      prev.map((e) => (e.id === exerciseId ? { ...e, notes } : e))
    );
  }

  function handleSave() {
    const now = new Date().toISOString();
    const startedAt = session?.startedAt ?? now;
    const mins = parseFloat(durationMins);
    const completedAt =
      mins > 0
        ? new Date(new Date(startedAt).getTime() + mins * 60000).toISOString()
        : session?.completedAt ?? now;

    const exercises: WorkoutExercise[] = formExercises
      .map((fe) => ({
        id: fe.id,
        exercise: fe.exercise,
        notes: fe.notes || undefined,
        sets: fe.sets
          .filter((s) => s.weight !== '' || s.reps !== '' || s.incline !== '')
          .map((s) => ({
            id: s.id,
            weight: parseFloat(s.weight) || 0,
            reps: parseInt(s.reps) || 0,
            ...(s.incline !== '' && { incline: parseFloat(s.incline) }),
            isWarmup: false,
            completed: true,
            isPR: false,
          })),
      }))
      .filter((e) => e.sets.length > 0);

    saveSession({
      id: session?.id ?? uuidv4(),
      date: session?.date ?? date,
      name: name.trim() || 'Workout',
      startedAt,
      completedAt,
      exercises,
    });
    onClose();
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={session ? 'Edit Workout' : templateSession ? 'New Workout (from template)' : 'Log Workout'}>
        <div className="p-4 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '75vh' }}>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Session name"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-lime-400 text-sm"
            />
            <div className="grid grid-cols-3 gap-1.5">
              {QUICK_NAMES.map((n) => (
                <button
                  key={n}
                  onClick={() => setName(n)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                    name === n
                      ? 'bg-lime-400 text-gray-950'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={durationMins}
              onChange={(e) => setDurationMins(e.target.value)}
              placeholder="45"
              className="w-20 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-lime-400 text-sm text-center"
            />
            <span className="text-sm text-gray-500">minutes (optional)</span>
            <button
              onClick={() => setShowRestTimer(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-lime-400 text-xs transition-colors"
            >
              <Timer size={13} /> Rest Timer
            </button>
          </div>

          {/* Exercises */}
          {formExercises.map((fe) => (
            <div key={fe.id} className="bg-gray-800 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-100">{fe.exercise.name}</div>
                  <div className="text-xs text-gray-600 capitalize mt-0.5">{fe.exercise.muscleGroup}</div>
                </div>
                <button onClick={() => removeExercise(fe.id)} className="text-gray-600 hover:text-red-400 p-1">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Set header */}
              {fe.exercise.category === 'cardio' ? (
                <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_1.5rem] gap-2 text-xs text-gray-600 px-1">
                  <span>#</span>
                  <span>incline %</span>
                  <span>km/h</span>
                  <span>min</span>
                  <span />
                </div>
              ) : (
                <div className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-2 text-xs text-gray-600 px-1">
                  <span>#</span>
                  <span>kg</span>
                  <span>reps</span>
                  <span />
                </div>
              )}

              {fe.sets.map((s, idx) =>
                fe.exercise.category === 'cardio' ? (
                  <div key={s.id} className="grid grid-cols-[1.5rem_1fr_1fr_1fr_1.5rem] gap-2 items-center">
                    <span className="text-xs text-gray-500 text-center">{idx + 1}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={s.incline}
                      onChange={(e) => updateSet(fe.id, s.id, 'incline', e.target.value)}
                      placeholder="0"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-center text-sm text-gray-100 focus:outline-none focus:border-lime-400"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      value={s.weight}
                      onChange={(e) => updateSet(fe.id, s.id, 'weight', e.target.value)}
                      placeholder="0"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-center text-sm text-gray-100 focus:outline-none focus:border-lime-400"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      value={s.reps}
                      onChange={(e) => updateSet(fe.id, s.id, 'reps', e.target.value)}
                      placeholder="0"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-center text-sm text-gray-100 focus:outline-none focus:border-lime-400"
                    />
                    <button
                      onClick={() => removeSet(fe.id, s.id)}
                      className="text-gray-600 hover:text-red-400 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div key={s.id} className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-2 items-center">
                    <span className="text-xs text-gray-500 text-center">{idx + 1}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={s.weight}
                      onChange={(e) => updateSet(fe.id, s.id, 'weight', e.target.value)}
                      placeholder="0"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-center text-sm text-gray-100 focus:outline-none focus:border-lime-400"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={s.reps}
                      onChange={(e) => updateSet(fe.id, s.id, 'reps', e.target.value)}
                      placeholder="0"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-center text-sm text-gray-100 focus:outline-none focus:border-lime-400"
                    />
                    <button
                      onClick={() => removeSet(fe.id, s.id)}
                      className="text-gray-600 hover:text-red-400 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )
              )}

              <div className="flex items-center gap-3 mt-0.5">
                <button
                  onClick={() => addSet(fe.id)}
                  className="text-xs text-gray-500 hover:text-lime-400 flex items-center gap-1"
                >
                  <Plus size={12} /> Add Set
                </button>
              </div>

              {/* Notes */}
              <input
                value={fe.notes}
                onChange={(e) => updateNotes(fe.id, e.target.value)}
                placeholder="Notes (optional)"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-lime-400/50 mt-1"
              />
            </div>
          ))}

          <Button variant="secondary" onClick={() => setShowAddExercise(true)} className="w-full">
            <Plus size={16} /> Add Exercise
          </Button>

          <Button onClick={handleSave} className="w-full" size="lg">
            {session ? 'Save Changes' : 'Log Workout'}
          </Button>
        </div>
      </Modal>

      <AddExerciseModal
        open={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        onSelect={handleAddExercise}
      />

      {showRestTimer && <RestTimerModal onClose={() => setShowRestTimer(false)} />}
    </>
  );
}
