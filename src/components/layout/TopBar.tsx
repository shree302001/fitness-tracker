import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelectedDate } from '../../hooks/useSelectedDate';
import { addDays, subDays, isToday, formatDisplayDate } from '../../utils/dateUtils';

export function TopBar({ title }: { title: string }) {
  const { selectedDate, setSelectedDate } = useSelectedDate();

  return (
    <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-bold text-lime-400 tracking-tight">{title}</h1>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            isToday(selectedDate)
              ? 'text-lime-400 bg-lime-400/10'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          {isToday(selectedDate) ? 'Today' : formatDisplayDate(selectedDate)}
        </button>

        <button
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
          disabled={isToday(selectedDate)}
        >
          <ChevronRight size={18} className={isToday(selectedDate) ? 'opacity-30' : ''} />
        </button>
      </div>
    </header>
  );
}
