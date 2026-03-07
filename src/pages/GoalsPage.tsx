import { useState, useRef } from 'react';
import { useGoalsStore } from '../stores/useGoalsStore';
import { useBodyWeightStore } from '../stores/useBodyWeightStore';
import { estimateTDEE, type ActivityLevel } from '../utils/macroCalc';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import type { GoalType, MacroGoals } from '../types';

const GOAL_TYPES: { type: GoalType; label: string; desc: string; color: string }[] = [
  { type: 'bulk', label: 'Bulk', desc: 'Build muscle with a calorie surplus', color: 'border-blue-400 bg-blue-400/10' },
  { type: 'cut', label: 'Cut', desc: 'Lose fat with a calorie deficit', color: 'border-orange-400 bg-orange-400/10' },
  { type: 'maintain', label: 'Maintain', desc: 'Stay at current weight', color: 'border-lime-400 bg-lime-400/10' },
  { type: 'custom', label: 'Custom', desc: 'Set your own targets', color: 'border-purple-400 bg-purple-400/10' },
];

const ACTIVITY_LEVELS: { key: ActivityLevel; label: string }[] = [
  { key: 'sedentary', label: 'Sedentary (desk job, no exercise)' },
  { key: 'light', label: 'Light (1-3 days/week)' },
  { key: 'moderate', label: 'Moderate (3-5 days/week)' },
  { key: 'active', label: 'Active (6-7 days/week)' },
  { key: 'veryActive', label: 'Very Active (2x/day or physical job)' },
];

export function GoalsPage() {
  const settings = useGoalsStore((s) => s.settings);
  const updateMacroGoals = useGoalsStore((s) => s.updateMacroGoals);
  const updateGoalType = useGoalsStore((s) => s.updateGoalType);
  const updateWeightUnit = useGoalsStore((s) => s.updateWeightUnit);
  const updateName = useGoalsStore((s) => s.updateName);
  const updateBodyFat = useGoalsStore((s) => s.updateBodyFat);
  const setTDEE = useGoalsStore((s) => s.setTDEE);
  const setWaterGoal = useGoalsStore((s) => s.setWaterGoal);
  const updateSettings = useGoalsStore((s) => s.updateSettings);
  const latestWeight = useBodyWeightStore((s) => s.entries[s.entries.length - 1]);
  const importRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  const [goals, setGoals] = useState<MacroGoals>(settings.macroGoals);
  const [goalType, setGoalType] = useState<GoalType>(settings.goalType);
  const [targetBfPct, setTargetBfPct] = useState<string>(settings.targetBfGoal ?? '');
  const [pace, setPace] = useState<'slow' | 'moderate' | 'fast'>(settings.bfPace ?? 'moderate');

  // TDEE calculator
  const [tdeeForm, setTdeeForm] = useState({
    weight: settings.tdeeInput?.weight ?? '',
    height: settings.tdeeInput?.height ?? '',
    age: settings.tdeeInput?.age ?? '',
    sex: (settings.tdeeInput?.sex ?? 'male') as 'male' | 'female',
    activity: (settings.tdeeInput?.activity ?? 'moderate') as ActivityLevel,
  });
  const [estimatedTDEE, setEstimatedTDEE] = useState<number | null>(null);

  function setGoalField(field: keyof MacroGoals, val: string) {
    setGoals((g) => ({ ...g, [field]: parseFloat(val) || 0 }));
  }

  function handleEstimate() {
    const w = parseFloat(tdeeForm.weight);
    const h = parseFloat(tdeeForm.height);
    const a = parseFloat(tdeeForm.age);
    if (!w || !h || !a) return;
    const tdee = estimateTDEE(w, h, a, tdeeForm.sex, tdeeForm.activity);
    setEstimatedTDEE(tdee);
    setTDEE(tdee); // persist raw TDEE so body comp goal uses it correctly

    // Auto-fill calories & suggest macros based on goal type
    let cals = tdee;
    if (goalType === 'bulk') cals = tdee + 300;
    if (goalType === 'cut') cals = tdee - 400;

    const protein = Math.round(w * 2.2); // 2.2g per kg
    const fat = Math.round((cals * 0.25) / 9);
    const carbs = Math.round((cals - protein * 4 - fat * 9) / 4);

    setGoals({ calories: cals, protein, carbs, fat });
  }

  function handleSave() {
    updateMacroGoals(goals);
    updateGoalType(goalType);
    updateSettings({
      tdeeInput: { ...tdeeForm, activity: tdeeForm.activity as string },
      targetBfGoal: targetBfPct,
      bfPace: pace,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Name + unit */}
      <Card className="p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-300">Profile</h2>
        <Input
          label="Your name (optional)"
          placeholder="e.g. Rahul"
          value={settings.name ?? ''}
          onChange={(e) => updateName(e.target.value)}
        />
        <div>
          <div className="text-sm text-gray-400 font-medium mb-2">Weight unit</div>
          <div className="flex gap-2">
            {(['kg', 'lbs'] as const).map((u) => (
              <button
                key={u}
                onClick={() => updateWeightUnit(u)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  settings.weightUnit === u
                    ? 'bg-lime-400 text-gray-950'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Body fat % */}
        <Input
          label="Body Fat % (optional)"
          type="number"
          inputMode="decimal"
          placeholder="e.g. 18"
          value={settings.bodyFatPct != null ? String(settings.bodyFatPct) : ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            updateBodyFat(isNaN(val) ? undefined : Math.min(Math.max(val, 1), 60));
          }}
          suffix="%"
        />

        {/* Derived body composition stats */}
        {settings.bodyFatPct != null && latestWeight && (() => {
          const bfPct = settings.bodyFatPct!;
          const totalKg = latestWeight.weight;
          const fatMass = Math.round(totalKg * bfPct / 100 * 10) / 10;
          const leanMass = Math.round((totalKg - fatMass) * 10) / 10;
          const category =
            bfPct < 6 ? 'Essential fat' :
            bfPct < 14 ? 'Athletic' :
            bfPct < 18 ? 'Fit' :
            bfPct < 25 ? 'Average' : 'Obese';
          const categoryColor =
            bfPct < 14 ? 'text-lime-400' :
            bfPct < 18 ? 'text-blue-400' :
            bfPct < 25 ? 'text-yellow-400' : 'text-red-400';

          return (
            <div className="bg-gray-800 rounded-xl p-3 grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <div className="text-base font-bold text-orange-400">{fatMass} kg</div>
                <div className="text-gray-500 mt-0.5">Fat Mass</div>
              </div>
              <div>
                <div className="text-base font-bold text-blue-400">{leanMass} kg</div>
                <div className="text-gray-500 mt-0.5">Lean Mass</div>
              </div>
              <div>
                <div className={`text-base font-bold ${categoryColor}`}>{category}</div>
                <div className="text-gray-500 mt-0.5">Category</div>
              </div>
            </div>
          );
        })()}
      </Card>

      {/* Body composition goal */}
      {(() => {
        const currentBf = settings.bodyFatPct;
        const currentWeight = latestWeight?.weight;
        const hasData = currentBf != null && currentWeight != null;
        const leanMass = hasData ? currentWeight! * (1 - currentBf! / 100) : null;
        const targetBf = parseFloat(targetBfPct);
        const tdee = settings.tdee ?? goals.calories;

        const targetWeight = hasData && leanMass !== null && !isNaN(targetBf) && targetBf > 0 && targetBf < 100
          ? Math.round((leanMass / (1 - targetBf / 100)) * 10) / 10
          : null;

        const fatToLose = targetWeight !== null && currentWeight != null
          ? Math.round((currentWeight - targetWeight) * 10) / 10
          : null;

        const isCut = fatToLose !== null && fatToLose > 0;
        const isBulk = fatToLose !== null && fatToLose < 0;
        // Standard fitness-guideline rates by pace
        const CUT_RATES = { slow: 0.25, moderate: 0.5, fast: 0.75 } as const;
        const BULK_RATES = { slow: 0.15, moderate: 0.25, fast: 0.35 } as const;
        const weeklyRate = isCut ? CUT_RATES[pace] : BULK_RATES[pace];
        const weeksNeeded = fatToLose !== null ? Math.ceil(Math.abs(fatToLose) / weeklyRate) : null;
        const dailyDelta = Math.round(weeklyRate * 7700 / 7);
        const suggestedCals = isCut ? tdee - dailyDelta : isBulk ? tdee + dailyDelta : null;

        return (
          <Card className="p-4 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-300">Body Composition Goal</h2>

            {!hasData && (
              <p className="text-xs text-gray-500">
                {currentBf == null ? 'Enter your current Body Fat % above (in Profile).' : ''}
                {currentWeight == null ? ' Log your body weight on the Body Weight page.' : ''}
              </p>
            )}

            <div className="flex gap-3 text-xs text-gray-500 bg-gray-800 rounded-xl p-3">
              <div className="flex-1 text-center">
                <div className="text-base font-bold text-gray-200">
                  {currentBf != null ? `${currentBf}%` : '—'}
                </div>
                <div className="mt-0.5">Current BF</div>
              </div>
              <div className="flex items-center text-gray-700">→</div>
              <div className="flex-1">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Target %"
                  value={targetBfPct}
                  onChange={(e) => setTargetBfPct(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-center text-sm text-gray-100 focus:outline-none focus:border-lime-400"
                />
                <div className="text-center mt-0.5">Target BF</div>
              </div>
            </div>

            {/* Pace picker */}
            <div>
              <div className="text-xs text-gray-500 mb-1.5">Pace</div>
              <div className="flex gap-2">
                {([
                  { key: 'slow', cut: '0.25 kg/wk', bulk: '0.15 kg/wk' },
                  { key: 'moderate', cut: '0.5 kg/wk', bulk: '0.25 kg/wk' },
                  { key: 'fast', cut: '0.75 kg/wk', bulk: '0.35 kg/wk' },
                ] as const).map(({ key, cut, bulk }) => (
                  <button
                    key={key}
                    onClick={() => setPace(key)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      pace === key ? 'bg-lime-400 text-gray-950' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <div>{key}</div>
                    <div className="opacity-70 font-normal">{isCut ? cut : bulk}</div>
                  </button>
                ))}
              </div>
            </div>

            {targetWeight !== null && fatToLose !== null && weeksNeeded !== null && suggestedCals !== null && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-gray-800 rounded-xl p-3">
                    <div className="text-base font-bold text-lime-400">{targetWeight} kg</div>
                    <div className="text-gray-500 mt-0.5">Target weight</div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3">
                    <div className={`text-base font-bold ${isCut ? 'text-orange-400' : 'text-blue-400'}`}>
                      {isCut ? '-' : '+'}{Math.abs(fatToLose)} kg
                    </div>
                    <div className="text-gray-500 mt-0.5">{isCut ? 'Fat to lose' : 'Weight to gain'}</div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3">
                    <div className="text-base font-bold text-purple-400">{weeksNeeded}w</div>
                    <div className="text-gray-500 mt-0.5">Est. time</div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex justify-between text-gray-400">
                    <span>Your TDEE {!settings.tdee ? <span className="text-yellow-500">(run calculator first)</span> : ''}</span>
                    <span>{tdee} kcal</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>{isCut ? 'Daily deficit' : 'Daily surplus'} ({weeklyRate.toFixed(2)} kg/wk)</span>
                    <span className={isCut ? 'text-orange-400' : 'text-blue-400'}>
                      {isCut ? '-' : '+'}{dailyDelta} kcal
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-1.5 font-medium">
                    <span className="text-gray-300">Suggested daily calories</span>
                    <span className="text-lime-400">{suggestedCals} kcal</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setGoals((g) => ({ ...g, calories: suggestedCals }));
                    updateGoalType(isCut ? 'cut' : 'bulk');
                    setGoalType(isCut ? 'cut' : 'bulk');
                  }}
                  className="w-full py-2 rounded-xl text-sm font-medium bg-lime-400/10 text-lime-400 border border-lime-400/30 hover:bg-lime-400/20 transition-colors"
                >
                  Apply {suggestedCals} kcal to my targets
                </button>
              </div>
            )}
          </Card>
        );
      })()}

      {/* Goal type */}
      <Card className="p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-300">Goal Type</h2>
        <div className="grid grid-cols-2 gap-2">
          {GOAL_TYPES.map(({ type, label, desc, color }) => (
            <button
              key={type}
              onClick={() => setGoalType(type)}
              className={`text-left p-3 rounded-xl border transition-all ${
                goalType === type ? color : 'border-gray-700 bg-gray-800'
              }`}
            >
              <div className="text-sm font-semibold text-gray-100">{label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* TDEE calculator */}
      <Card className="p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-300">TDEE Calculator</h2>
        <p className="text-xs text-gray-600">Estimate your daily calorie needs (Harris-Benedict formula)</p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Weight (kg)"
            type="number"
            inputMode="decimal"
            placeholder="75"
            value={tdeeForm.weight}
            onChange={(e) => setTdeeForm((f) => ({ ...f, weight: e.target.value }))}
          />
          <Input
            label="Height (cm)"
            type="number"
            inputMode="decimal"
            placeholder="175"
            value={tdeeForm.height}
            onChange={(e) => setTdeeForm((f) => ({ ...f, height: e.target.value }))}
          />
          <Input
            label="Age"
            type="number"
            inputMode="numeric"
            placeholder="25"
            value={tdeeForm.age}
            onChange={(e) => setTdeeForm((f) => ({ ...f, age: e.target.value }))}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400 font-medium">Sex</label>
            <div className="flex gap-2">
              {(['male', 'female'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setTdeeForm((f) => ({ ...f, sex: s }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${
                    tdeeForm.sex === s
                      ? 'bg-lime-400 text-gray-950'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">Activity Level</label>
          <select
            value={tdeeForm.activity}
            onChange={(e) => setTdeeForm((f) => ({ ...f, activity: e.target.value as ActivityLevel }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-lime-400"
          >
            {ACTIVITY_LEVELS.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <Button variant="secondary" onClick={handleEstimate} className="w-full">
          Estimate & Auto-fill
        </Button>
        {estimatedTDEE && (
          <div className="text-center text-sm text-gray-400">
            Your estimated TDEE: <span className="text-lime-400 font-semibold">{estimatedTDEE} kcal/day</span>
            {goalType === 'bulk' && <span className="text-blue-400"> (+300 for bulk)</span>}
            {goalType === 'cut' && <span className="text-orange-400"> (−400 for cut)</span>}
          </div>
        )}
      </Card>

      {/* Manual macro targets */}
      <Card className="p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-300">Daily Macro Targets</h2>
        <Input
          label="Calories (kcal)"
          type="number"
          inputMode="numeric"
          value={String(goals.calories)}
          onChange={(e) => setGoalField('calories', e.target.value)}
          suffix="kcal"
        />
        <div className="grid grid-cols-3 gap-2">
          <Input
            label="Protein (g)"
            type="number"
            inputMode="decimal"
            value={String(goals.protein)}
            onChange={(e) => setGoalField('protein', e.target.value)}
            suffix="g"
          />
          <Input
            label="Carbs (g)"
            type="number"
            inputMode="decimal"
            value={String(goals.carbs)}
            onChange={(e) => setGoalField('carbs', e.target.value)}
            suffix="g"
          />
          <Input
            label="Fat (g)"
            type="number"
            inputMode="decimal"
            value={String(goals.fat)}
            onChange={(e) => setGoalField('fat', e.target.value)}
            suffix="g"
          />
        </div>

        {/* Macro calorie breakdown */}
        {(() => {
          const pCal = goals.protein * 4;
          const cCal = goals.carbs * 4;
          const fCal = goals.fat * 9;
          const totalMacroCal = pCal + cCal + fCal;
          const base = totalMacroCal > 0 ? totalMacroCal : 1;
          const pPct = Math.round((pCal / base) * 100);
          const cPct = Math.round((cCal / base) * 100);
          const fPct = Math.round((fCal / base) * 100);
          const mismatch = Math.abs(totalMacroCal - goals.calories) > 50;

          return (
            <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-500 space-y-2">
              {/* Split bar */}
              <div className="flex rounded-full overflow-hidden h-2.5">
                <div className="bg-blue-400 transition-all" style={{ width: `${pPct}%` }} />
                <div className="bg-yellow-400 transition-all" style={{ width: `${cPct}%` }} />
                <div className="bg-orange-400 transition-all" style={{ width: `${fPct}%` }} />
              </div>

              {/* Rows */}
              <div className="flex justify-between items-center">
                <span>Protein ({goals.protein}g × 4)</span>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-medium w-8 text-right">{pPct}%</span>
                  <span className="text-blue-400 w-16 text-right">{pCal} kcal</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Carbs ({goals.carbs}g × 4)</span>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-medium w-8 text-right">{cPct}%</span>
                  <span className="text-yellow-400 w-16 text-right">{cCal} kcal</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Fat ({goals.fat}g × 9)</span>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 font-medium w-8 text-right">{fPct}%</span>
                  <span className="text-orange-400 w-16 text-right">{fCal} kcal</span>
                </div>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-1">
                <span>Total from macros</span>
                <span className={mismatch ? 'text-red-400' : 'text-lime-400'}>
                  {totalMacroCal} kcal
                  {mismatch && ' ⚠ mismatch'}
                </span>
              </div>
            </div>
          );
        })()}

        <Button onClick={handleSave} className="w-full" size="lg">
          Save Goals
        </Button>
      </Card>

      {/* Hydration goal */}
      <Card className="p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-300">Hydration Goal</h2>
        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            value={settings.waterGoalMl ?? 2500}
            min={500}
            max={6000}
            step={250}
            onChange={(e) => setWaterGoal(parseInt(e.target.value) || 2500)}
            className="w-28 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-100 text-sm text-center focus:outline-none focus:border-lime-400"
          />
          <span className="text-sm text-gray-500">ml / day</span>
          <span className="text-xs text-gray-600">
            ({((settings.waterGoalMl ?? 2500) / 1000).toFixed(1)}L)
          </span>
        </div>
      </Card>

      {/* Data & Backup */}
      <Card className="p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-300">Data & Backup</h2>
        <p className="text-xs text-gray-600">Export your data as a JSON file or restore from a previous backup.</p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              const data = {
                version: 1,
                exportedAt: new Date().toISOString(),
                food: JSON.parse(localStorage.getItem('fitness-food') ?? '{}'),
                workout: JSON.parse(localStorage.getItem('fitness-workout') ?? '{}'),
                weight: JSON.parse(localStorage.getItem('fitness-weight') ?? '{}'),
                goals: JSON.parse(localStorage.getItem('fitness-goals') ?? '{}'),
                water: JSON.parse(localStorage.getItem('fitness-water') ?? '{}'),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `fitness-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export JSON
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => importRef.current?.click()}
          >
            Import
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              const food = JSON.parse(localStorage.getItem('fitness-food') ?? '{}');
              const rows = [['Date', 'Meal', 'Food', 'Brand', 'Serving', 'Servings', 'Calories', 'Protein(g)', 'Carbs(g)', 'Fat(g)', 'Fiber(g)', 'Sodium(mg)']];
              for (const entry of (food.state?.foodLog ?? [])) {
                const m = entry.foodItem.macrosPerServing;
                const s = entry.servings;
                rows.push([
                  entry.date, entry.meal, entry.foodItem.name, entry.foodItem.brand ?? '',
                  `${entry.foodItem.servingSize}${entry.foodItem.servingLabel}`, s,
                  Math.round(m.calories * s), Math.round(m.protein * s * 10) / 10,
                  Math.round(m.carbs * s * 10) / 10, Math.round(m.fat * s * 10) / 10,
                  Math.round((m.fiber ?? 0) * s * 10) / 10, Math.round((m.sodium ?? 0) * s),
                ]);
              }
              const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `food-log-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Food CSV
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              const workout = JSON.parse(localStorage.getItem('fitness-workout') ?? '{}');
              const rows = [['Date', 'Session', 'Exercise', 'Set', 'Weight(kg)', 'Reps', 'Volume(kg)', 'Warmup', 'PR']];
              for (const session of (workout.state?.sessions ?? [])) {
                for (const ex of session.exercises) {
                  ex.sets.forEach((set: { weight: number; reps: number; isWarmup: boolean; isPR: boolean }, i: number) => {
                    rows.push([
                      session.date, session.name, ex.exercise.name, i + 1,
                      set.weight, set.reps, Math.round(set.weight * set.reps),
                      set.isWarmup ? 'Yes' : 'No', set.isPR ? 'Yes' : 'No',
                    ]);
                  });
                }
              }
              const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `workout-log-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Workout CSV
          </Button>
        </div>
        <input
          ref={importRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              try {
                const data = JSON.parse(ev.target?.result as string);
                if (data.version !== 1) throw new Error('Invalid');
                if (data.food) localStorage.setItem('fitness-food', JSON.stringify(data.food));
                if (data.workout) localStorage.setItem('fitness-workout', JSON.stringify(data.workout));
                if (data.weight) localStorage.setItem('fitness-weight', JSON.stringify(data.weight));
                if (data.goals) localStorage.setItem('fitness-goals', JSON.stringify(data.goals));
                if (data.water) localStorage.setItem('fitness-water', JSON.stringify(data.water));
                setImportStatus('ok');
                setTimeout(() => window.location.reload(), 800);
              } catch {
                setImportStatus('err');
                setTimeout(() => setImportStatus('idle'), 3000);
              }
            };
            reader.readAsText(file);
            e.target.value = '';
          }}
        />
        {importStatus === 'ok' && (
          <p className="text-xs text-lime-400 text-center">Data imported — reloading…</p>
        )}
        {importStatus === 'err' && (
          <p className="text-xs text-red-400 text-center">Invalid backup file. Please try again.</p>
        )}
      </Card>
    </div>
  );
}
