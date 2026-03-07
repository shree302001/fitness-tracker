import { createContext, useContext } from 'react';
import { todayISO } from '../utils/dateUtils';

interface DateContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const DateContext = createContext<DateContextType>({
  selectedDate: todayISO(),
  setSelectedDate: () => {},
});

export function useSelectedDate() {
  return useContext(DateContext);
}
