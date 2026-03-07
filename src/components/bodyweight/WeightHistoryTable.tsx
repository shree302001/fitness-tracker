import { Trash2 } from 'lucide-react';
import { useBodyWeightStore } from '../../stores/useBodyWeightStore';
import type { WeightEntry } from '../../types';
import { formatShortDate } from '../../utils/dateUtils';

interface WeightHistoryTableProps {
  entries: WeightEntry[];
  unit: 'kg' | 'lbs';
}

export function WeightHistoryTable({ entries, unit }: WeightHistoryTableProps) {
  const removeEntry = useBodyWeightStore((s) => s.removeEntry);

  return (
    <div className="flex flex-col divide-y divide-gray-800">
      <div className="grid grid-cols-12 text-xs text-gray-600 pb-2">
        <span className="col-span-4">Date</span>
        <span className="col-span-3 text-center">Weight</span>
        <span className="col-span-3 text-center">Change</span>
        <span className="col-span-2" />
      </div>
      {entries.map((entry, idx) => {
        const prev = entries[idx + 1];
        const change = prev ? entry.weight - prev.weight : null;
        return (
          <div key={entry.id} className="grid grid-cols-12 items-center py-2.5 text-sm">
            <span className="col-span-4 text-gray-400">{formatShortDate(entry.date)}</span>
            <span className="col-span-3 text-center text-gray-200">
              {entry.weight} {unit}
            </span>
            <span
              className={`col-span-3 text-center text-xs ${
                change === null
                  ? 'text-gray-600'
                  : change > 0
                  ? 'text-orange-400'
                  : change < 0
                  ? 'text-blue-400'
                  : 'text-gray-500'
              }`}
            >
              {change !== null
                ? `${change > 0 ? '+' : ''}${change.toFixed(1)}`
                : '—'}
            </span>
            <div className="col-span-2 flex justify-end">
              <button
                onClick={() => removeEntry(entry.id)}
                className="text-gray-700 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
