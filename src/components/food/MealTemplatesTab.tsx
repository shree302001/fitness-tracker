import { useState } from 'react';
import { Trash2, Play, BookmarkPlus } from 'lucide-react';
import { useFoodStore } from '../../stores/useFoodStore';
import type { MealType } from '../../types';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  'pre-workout': 'Pre-Workout',
  'post-workout': 'Post-Workout',
};

interface MealTemplatesTabProps {
  date: string;
  currentMeal: MealType;
  onApplied: () => void;
}

export function MealTemplatesTab({ date, currentMeal, onApplied }: MealTemplatesTabProps) {
  const mealTemplates = useFoodStore((s) => s.mealTemplates);
  const foodLog = useFoodStore((s) => s.foodLog);
  const saveMealAsTemplate = useFoodStore((s) => s.saveMealAsTemplate);
  const applyTemplate = useFoodStore((s) => s.applyTemplate);
  const deleteTemplate = useFoodStore((s) => s.deleteTemplate);

  const [nameInput, setNameInput] = useState('');
  const [savingMode, setSavingMode] = useState<'all' | MealType | null>(null);

  const todayEntries = foodLog.filter((e) => e.date === date);
  const mealEntries = todayEntries.filter((e) => e.meal === currentMeal);

  const mealsWithEntries = Array.from(
    new Set(todayEntries.map((e) => e.meal))
  ) as MealType[];

  function handleSave() {
    if (!nameInput.trim() || savingMode === null) return;
    const entries = savingMode === 'all' ? todayEntries : todayEntries.filter((e) => e.meal === savingMode);
    if (entries.length === 0) return;
    saveMealAsTemplate(nameInput.trim(), entries);
    setNameInput('');
    setSavingMode(null);
  }

  function handleApply(templateId: string) {
    applyTemplate(templateId, date);
    onApplied();
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Save section */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Save as Template</p>
        <div className="flex flex-wrap gap-1.5">
          {todayEntries.length > 0 && (
            <button
              onClick={() => setSavingMode(savingMode === 'all' ? null : 'all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                savingMode === 'all'
                  ? 'bg-lime-400/20 border-lime-400/50 text-lime-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <BookmarkPlus size={11} className="inline mr-1" />
              Full Day ({todayEntries.length})
            </button>
          )}
          {mealsWithEntries.map((m) => (
            <button
              key={m}
              onClick={() => setSavingMode(savingMode === m ? null : m)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                savingMode === m
                  ? 'bg-lime-400/20 border-lime-400/50 text-lime-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {MEAL_LABELS[m]} ({todayEntries.filter((e) => e.meal === m).length})
            </button>
          ))}
          {mealEntries.length === 0 && todayEntries.length === 0 && (
            <p className="text-xs text-gray-600">Log food today to save it as a template.</p>
          )}
        </div>

        {savingMode !== null && (
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              placeholder="Template name…"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-lime-400"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={!nameInput.trim()}
              className="px-3 py-2 bg-lime-400 text-gray-950 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Templates list */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Saved Templates</p>
        {mealTemplates.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-6">No templates saved yet.</p>
        ) : (
          mealTemplates.map((t) => {
            const mealCounts = t.items.reduce<Record<string, number>>((acc, item) => {
              acc[item.meal] = (acc[item.meal] ?? 0) + 1;
              return acc;
            }, {});
            return (
              <div key={t.id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-800/60 border border-gray-700/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t.items.length} item{t.items.length !== 1 ? 's' : ''} ·{' '}
                    {Object.entries(mealCounts)
                      .map(([m, n]) => `${n} ${MEAL_LABELS[m as MealType] ?? m}`)
                      .join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleApply(t.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-lime-400/10 text-lime-400 text-xs font-medium hover:bg-lime-400/20 transition-colors"
                  >
                    <Play size={11} />
                    Apply
                  </button>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
