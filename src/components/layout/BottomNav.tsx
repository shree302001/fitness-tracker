import { NavLink } from 'react-router-dom';
import { Home, Utensils, Dumbbell, TrendingUp, Target } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/food', icon: Utensils, label: 'Food' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/bodyweight', icon: TrendingUp, label: 'Weight' },
  { to: '/goals', icon: Target, label: 'Goals' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur border-t border-gray-800">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-3 px-4 text-xs font-medium transition-colors ${
                isActive ? 'text-lime-400' : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
