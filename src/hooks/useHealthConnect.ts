import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

export interface DaySteps {
  date: string; // YYYY-MM-DD
  steps: number;
}

export interface HealthState {
  steps: number | null;       // today's total
  weeklySteps: DaySteps[];    // last 7 days including today
  available: boolean;         // Health Connect installed & API ≥ 26
  permissionsGranted: boolean;
  loading: boolean;
  error: string | null;
}

const INITIAL: HealthState = {
  steps: null,
  weeklySteps: [],
  available: false,
  permissionsGranted: false,
  loading: false,
  error: null,
};

export function useHealthConnect() {
  const [state, setState] = useState<HealthState>(INITIAL);

  const load = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const { HealthConnect } = await import('capacitor-health-connect');

      const { availability } = await HealthConnect.checkAvailability();
      if (availability !== 'Available') {
        setState((s) => ({ ...s, loading: false, available: false }));
        return;
      }

      const { hasAllPermissions } = await HealthConnect.checkHealthPermissions({
        read: ['Steps'],
        write: [],
      });

      if (!hasAllPermissions) {
        setState((s) => ({ ...s, loading: false, available: true, permissionsGranted: false }));
        return;
      }

      // Read last 7 days of step records in one query
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const { records } = await HealthConnect.readRecords({
        type: 'Steps',
        timeRangeFilter: { type: 'between', startTime: weekStart, endTime: now },
      });

      // Build a map date → step count
      const byDate: Record<string, number> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        byDate[d.toISOString().slice(0, 10)] = 0;
      }
      for (const r of records as Array<{ startTime: Date; count: number }>) {
        const date = new Date(r.startTime).toISOString().slice(0, 10);
        if (date in byDate) byDate[date] += r.count;
      }

      const weeklySteps: DaySteps[] = Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, steps]) => ({ date, steps }));

      const today = now.toISOString().slice(0, 10);

      setState({
        steps: byDate[today] ?? 0,
        weeklySteps,
        available: true,
        permissionsGranted: true,
        loading: false,
        error: null,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load health data';
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { HealthConnect } = await import('capacitor-health-connect');
      await HealthConnect.requestHealthPermissions({ read: ['Steps'], write: [] });
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Permission request failed';
      setState((s) => ({ ...s, error: msg }));
    }
  }, [load]);

  useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load, requestPermissions };
}
