import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { DateContext } from '../../hooks/useSelectedDate';
import { todayISO } from '../../utils/dateUtils';

const PAGE_TITLES: Record<string, string> = {
  '/': 'FitTrack',
  '/food': 'Food Log',
  '/workout': 'Workout',
  '/bodyweight': 'Body Weight',
  '/goals': 'Goals',
};

export function AppShell({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'FitTrack';

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      <div className="min-h-screen bg-gray-950 flex flex-col max-w-lg mx-auto">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
          {children}
        </main>
        <BottomNav />
      </div>
    </DateContext.Provider>
  );
}
