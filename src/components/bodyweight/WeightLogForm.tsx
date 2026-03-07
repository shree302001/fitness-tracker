import { useState } from 'react';
import { useBodyWeightStore } from '../../stores/useBodyWeightStore';
import { todayISO } from '../../utils/dateUtils';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface WeightLogFormProps {
  unit: 'kg' | 'lbs';
}

export function WeightLogForm({ unit }: WeightLogFormProps) {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(todayISO());
  const addEntry = useBodyWeightStore((s) => s.addEntry);

  function handleSubmit() {
    const val = parseFloat(weight);
    if (!val || val <= 0) return;
    addEntry(val, date);
    setWeight('');
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={`Weight (${unit})`}
          type="number"
          inputMode="decimal"
          placeholder="e.g. 75.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          suffix={unit}
        />
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={todayISO()}
        />
      </div>
      <Button onClick={handleSubmit} disabled={!weight} className="w-full">
        Log Weight
      </Button>
    </div>
  );
}
