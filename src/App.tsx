import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { FoodPage } from './pages/FoodPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { BodyWeightPage } from './pages/BodyWeightPage';
import { GoalsPage } from './pages/GoalsPage';
import { ActivityPage } from './pages/ActivityPage';

async function requestAppPermissions() {
  // Camera — request by briefly opening a stream then closing it
  try {
    if (navigator.mediaDevices?.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
    }
  } catch {
    // User denied or device unavailable — handled gracefully in the scanner
  }

  // Notifications
  try {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  } catch {
    // Not supported on this platform
  }
}

export default function App() {
  useEffect(() => {
    requestAppPermissions();
  }, []);

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/bodyweight" element={<BodyWeightPage />} />
          <Route path="/goals" element={<GoalsPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
