import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { WeightEntry } from '../../types';
import { linearRegression } from '../../utils/macroCalc';
import { formatShortDate } from '../../utils/dateUtils';

interface WeightChartProps {
  entries: WeightEntry[];
  unit: 'kg' | 'lbs';
}

export function WeightChart({ entries, unit }: WeightChartProps) {
  const points = entries.map((e, i) => ({ x: i, y: e.weight }));
  const reg = linearRegression(points);

  const data = entries.map((e, i) => ({
    date: formatShortDate(e.date),
    weight: e.weight,
    trend: Math.round((reg.slope * i + reg.intercept) * 10) / 10,
  }));

  const weights = entries.map((e) => e.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const padding = Math.max((maxW - minW) * 0.2, 1);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[minW - padding, maxW + padding]}
          tick={{ fill: '#6b7280', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: '#9ca3af' }}
          formatter={(value, name) => [
            `${value} ${unit}`,
            name === 'weight' ? 'Weight' : 'Trend',
          ]}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#a3e635"
          strokeWidth={2}
          dot={{ fill: '#a3e635', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="trend"
          stroke="#374151"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
