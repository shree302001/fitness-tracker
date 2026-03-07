import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useWorkoutStore } from '../stores/useWorkoutStore';
import { useSelectedDate } from '../hooks/useSelectedDate';
import { Button } from '../components/ui/Button';
import { WorkoutHistoryCard } from '../components/workout/WorkoutHistoryCard';
import { WorkoutFormModal } from '../components/workout/WorkoutFormModal';
import { WorkoutVolumeChart } from '../components/workout/WorkoutVolumeChart';
import type { WorkoutSession } from '../types';

export function WorkoutPage() {
  const { selectedDate } = useSelectedDate();
  const allSessions = useWorkoutStore((s) => s.sessions);
  const deleteSession = useWorkoutStore((s) => s.deleteSession);
  const sessions = useMemo(
    () => allSessions.filter((s) => s.date === selectedDate),
    [allSessions, selectedDate]
  );

  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [templateSession, setTemplateSession] = useState<WorkoutSession | null>(null);

  function openAdd() {
    setEditingSession(null);
    setTemplateSession(null);
    setShowForm(true);
  }

  function openEdit(session: WorkoutSession) {
    setEditingSession(session);
    setTemplateSession(null);
    setShowForm(true);
  }

  function useAsTemplate(session: WorkoutSession) {
    setEditingSession(null);
    setTemplateSession(session);
    setShowForm(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <Button size="lg" className="w-full gap-2" onClick={openAdd}>
        <Plus size={18} /> Log Workout
      </Button>

      <WorkoutVolumeChart />

      {sessions.length > 0 ? (
        <>
          <h2 className="text-sm font-semibold text-gray-400">
            {sessions.length} session{sessions.length > 1 ? 's' : ''}
          </h2>
          {sessions.map((s) => (
            <WorkoutHistoryCard
              key={s.id}
              session={s}
              onEdit={() => openEdit(s)}
              onDelete={() => deleteSession(s.id)}
              onUseAsTemplate={useAsTemplate}
            />
          ))}
        </>
      ) : (
        <div className="text-center py-12 text-gray-600 text-sm">
          No workout logged yet. Tap Log Workout to add one.
        </div>
      )}

      {showForm && (
        <WorkoutFormModal
          open={showForm}
          onClose={() => { setShowForm(false); setTemplateSession(null); }}
          session={editingSession}
          date={selectedDate}
          templateSession={templateSession}
        />
      )}
    </div>
  );
}
