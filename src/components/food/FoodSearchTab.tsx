import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useFoodSearch } from '../../hooks/useFoodSearch';
import { offProductToFoodItem } from '../../utils/macroCalc';
import { Spinner } from '../ui/Spinner';
import type { FoodItem } from '../../types';

interface FoodSearchTabProps {
  onSelect: (food: FoodItem) => void;
}

export function FoodSearchTab({ onSelect }: FoodSearchTabProps) {
  const [query, setQuery] = useState('');
  const { results, loading, error, search, clear } = useFoodSearch();

  function handleChange(val: string) {
    setQuery(val);
    if (val.trim()) {
      search(val);
    } else {
      clear();
    }
  }

  function handleClear() {
    setQuery('');
    clear();
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      {/* Search bar */}
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-3 text-gray-500 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search food (e.g. rice, banana...)"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-9 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-lime-400 transition-colors"
          autoFocus
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 text-gray-400 hover:text-gray-200">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-red-400 text-center py-3">{error}</p>}

      {/* Empty state */}
      {!loading && !error && query.length >= 2 && results.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No results. Try a different search or add manually.
        </p>
      )}

      {/* Placeholder */}
      {!loading && query.length < 2 && (
        <div className="py-4 flex flex-col gap-2 text-center">
          <p className="text-sm text-gray-600">Type at least 2 characters to search</p>
          <p className="text-xs text-gray-700">
            Works best for packaged/branded products.{' '}
            For home-cooked dishes like pulav or curry, use{' '}
            <span className="text-gray-500">Presets</span> or{' '}
            <span className="text-gray-500">Manual</span> instead.
          </p>
        </div>
      )}

      {/* Results */}
      <div className="flex flex-col gap-1">
        {results.map((product) => {
          const food = offProductToFoodItem(product);
          return (
            <button
              key={product.code}
              onClick={() => onSelect(food)}
              className="text-left flex justify-between items-start bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-lime-400/40 rounded-xl px-3 py-3 transition-all gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-200 truncate">{product.product_name}</div>
                {product.brands && (
                  <div className="text-xs text-gray-500 truncate">{product.brands}</div>
                )}
                <div className="text-xs text-gray-600 mt-0.5">{food.servingLabel}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-lime-400">
                  {food.macrosPerServing.calories} kcal
                </div>
                <div className="text-xs text-gray-500">
                  {food.macrosPerServing.protein}P {food.macrosPerServing.carbs}C {food.macrosPerServing.fat}F
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
