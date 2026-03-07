import { useState, useMemo } from 'react';
import { useBodyWeightStore } from '../stores/useBodyWeightStore';
import { useGoalsStore } from '../stores/useGoalsStore';
import { WeightChart } from '../components/bodyweight/WeightChart';
import { WeightLogForm } from '../components/bodyweight/WeightLogForm';
import { WeightHistoryTable } from '../components/bodyweight/WeightHistoryTable';
import { Card } from '../components/ui/Card';
import { getNDaysAgo, todayISO } from '../utils/dateUtils';

function getBmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
  if (bmi < 25) return { label: 'Normal', color: 'text-lime-400' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400' };
  return { label: 'Obese', color: 'text-red-400' };
}

type Range = '1W' | '1M' | '3M' | 'All';

const RANGES: Range[] = ['1W', '1M', '3M', 'All'];

function rangeStart(r: Range): string {
  if (r === '1W') return getNDaysAgo(7);
  if (r === '1M') return getNDaysAgo(30);
  if (r === '3M') return getNDaysAgo(90);
  return '2000-01-01';
}

export function BodyWeightPage() {
  const [range, setRange] = useState<Range>('1M');
  const weightUnit = useGoalsStore((s) => s.settings.weightUnit);
  const settings = useGoalsStore((s) => s.settings);
  const allEntries = useBodyWeightStore((s) => s.entries);

  const entries = useMemo(() => {
    const start = rangeStart(range);
    const end = todayISO();
    return allEntries.filter((e) => e.date >= start && e.date <= end);
  }, [allEntries, range]);

  const latestEntry = allEntries[allEntries.length - 1];

  // BMI
  const bmi = useMemo(() => {
    const heightCm = parseFloat(settings.tdeeInput?.height ?? '');
    if (!latestEntry || !heightCm) return null;
    const weightKg = weightUnit === 'lbs' ? latestEntry.weight / 2.205 : latestEntry.weight;
    const h = heightCm / 100;
    return Math.round((weightKg / (h * h)) * 10) / 10;
  }, [latestEntry, settings.tdeeInput?.height, weightUnit]);

  // Projected goal date
  const projection = useMemo(() => {
    if (allEntries.length < 4) return null;
    const recent = allEntries.slice(-8);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const daysDiff = (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000;
    if (daysDiff < 7) return null;
    const weeklyRate = ((last.weight - first.weight) / daysDiff) * 7;
    if (Math.abs(weeklyRate) < 0.05) return null;

    // Target weight from body composition goal
    const currentBf = settings.bodyFatPct;
    const targetBfStr = settings.targetBfGoal;
    if (!currentBf || !targetBfStr) return null;
    const targetBf = parseFloat(targetBfStr);
    if (isNaN(targetBf) || targetBf <= 0) return null;
    const currentWeight = last.weight;
    const leanMass = currentWeight * (1 - currentBf / 100);
    const targetWeight = Math.round((leanMass / (1 - targetBf / 100)) * 10) / 10;

    const diff = targetWeight - currentWeight;
    if ((diff > 0) !== (weeklyRate > 0)) return null; // wrong direction
    const weeksNeeded = Math.abs(diff / weeklyRate);
    const goalDate = new Date();
    goalDate.setDate(goalDate.getDate() + Math.round(weeksNeeded * 7));
    return {
      targetWeight,
      weeklyRate: Math.round(weeklyRate * 100) / 100,
      goalDate: goalDate.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }),
      weeksNeeded: Math.round(weeksNeeded),
    };
  }, [allEntries, settings.bodyFatPct, settings.targetBfGoal]);

  const change =
    entries.length >= 2
      ? (entries[entries.length - 1].weight - entries[0].weight).toFixed(1)
      : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-gray-100">
            {latestEntry ? latestEntry.weight : '—'}
          </div>
          <div className="text-xs text-gray-500">Current ({weightUnit})</div>
        </Card>
        <Card className="p-3 text-center">
          <div
            className={`text-lg font-bold ${
              change === null
                ? 'text-gray-600'
                : parseFloat(change) < 0
                ? 'text-blue-400'
                : 'text-orange-400'
            }`}
          >
            {change !== null ? `${parseFloat(change) >= 0 ? '+' : ''}${change}` : '—'}
          </div>
          <div className="text-xs text-gray-500">Change ({weightUnit})</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-gray-100">{allEntries.length}</div>
          <div className="text-xs text-gray-500">Weigh-ins</div>
        </Card>
      </div>

      {/* BMI + Projection row */}
      {(bmi !== null || projection !== null) && (
        <div className="grid gap-3" style={{ gridTemplateColumns: bmi && projection ? '1fr 1fr' : '1fr' }}>
          {bmi !== null && (() => { const cat = getBmiCategory(bmi); return (
            <Card className="p-3 text-center">
              <div className={`text-lg font-bold ${cat.color}`}>{bmi}</div>
              <div className="text-xs text-gray-500">BMI · {cat.label}</div>
            </Card>
          ); })()}
          {projection !== null && (
            <Card className="p-3 text-center">
              <div className="text-sm font-bold text-gray-100">{projection.goalDate}</div>
              <div className="text-xs text-gray-500">
                Goal {projection.targetWeight}{weightUnit} · {projection.weeklyRate > 0 ? '+' : ''}{projection.weeklyRate}{weightUnit}/wk
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Chart */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">Progress</h2>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  range === r
                    ? 'bg-lime-400 text-gray-950'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {entries.length < 2 ? (
          <div className="text-center py-10 text-gray-600 text-sm">
            Log at least 2 entries to see your chart
          </div>
        ) : (
          <WeightChart entries={entries} unit={weightUnit} />
        )}
      </Card>

      {/* Log new weight */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Log Weight</h2>
        <WeightLogForm unit={weightUnit} />
      </Card>

      {/* History */}
      {allEntries.length > 0 && (
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">History</h2>
          <WeightHistoryTable entries={[...allEntries].reverse()} unit={weightUnit} />
        </Card>
      )}
    </div>
  );
}
