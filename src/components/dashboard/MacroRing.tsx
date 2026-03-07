const RADIUS = 64;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE) * 2;

interface MacroRingProps {
  consumed: number;
  goal: number;
}

export function MacroRing({ consumed, goal }: MacroRingProps) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const offset = CIRCUMFERENCE * (1 - pct);
  const over = consumed > goal;
  const color = over ? '#ef4444' : pct > 0.9 ? '#facc15' : '#a3e635';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#1f2937"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-100 leading-none">{Math.round(consumed)}</span>
        <span className="text-xs text-gray-500 mt-1">/ {goal} kcal</span>
        {over && <span className="text-xs text-red-400 mt-0.5">over goal</span>}
      </div>
    </div>
  );
}
