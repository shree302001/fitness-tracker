import { useState, useCallback, useRef } from 'react';
import type { OFFProduct, OFFSearchResponse } from '../types';

// In dev, route through Vite proxy to avoid CORS. In prod (Capacitor), hit directly.
const OFF_BASE = import.meta.env.DEV
  ? '/off-api'
  : 'https://world.openfoodfacts.org';
const OFF_URL = `${OFF_BASE}/api/v2/search`;

export function useFoodSearch() {
  const [results, setResults] = useState<OFFProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const search = useCallback((query: string) => {
    clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          search_terms: query,
          page_size: '20',
          fields: 'code,product_name,brands,serving_size,nutriments',
        });
        const res = await fetch(`${OFF_URL}?${params}`);
        if (!res.ok) throw new Error('Network error');
        const data: OFFSearchResponse = await res.json();
        const valid = (data.products || []).filter(
          (p) =>
            p.product_name &&
            (p.nutriments?.['energy-kcal_serving'] || p.nutriments?.['energy-kcal_100g'])
        );
        setResults(valid);
      } catch {
        setError('Search failed. Check your connection.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  const clear = useCallback(() => {
    clearTimeout(debounceRef.current);
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clear };
}
