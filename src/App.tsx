import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { FoodPage } from './pages/FoodPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { BodyWeightPage } from './pages/BodyWeightPage';
import { GoalsPage } from './pages/GoalsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/bodyweight" element={<BodyWeightPage />} />
          <Route path="/goals" element={<GoalsPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
