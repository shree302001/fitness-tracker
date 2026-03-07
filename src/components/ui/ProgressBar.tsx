interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  label?: string;
  sublabel?: string;
  height?: string;
}

export function ProgressBar({
  value,
  max,
  color = 'bg-lime-400',
  label,
  sublabel,
  height = 'h-2',
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const over = max > 0 && value > max;

  return (
    <div className="flex flex-col gap-1.5">
      {(label || sublabel) && (
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">{label}</span>
          <span className={over ? 'text-red-400' : 'text-gray-400'}>{sublabel}</span>
        </div>
      )}
      <div className={`w-full bg-gray-800 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ${over ? 'bg-red-500' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
