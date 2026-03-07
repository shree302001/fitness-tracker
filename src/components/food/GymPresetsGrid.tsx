import { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { GYM_PRESETS, PRESET_CATEGORIES, type PresetCategory } from '../../data/gymPresets';
import { useFoodStore } from '../../stores/useFoodStore';
import type { FoodItem } from '../../types';

interface GymPresetsGridProps {
  onSelect: (food: FoodItem) => void;
}

export function GymPresetsGrid({ onSelect }: GymPresetsGridProps) {
  const [activeCategory, setActiveCategory] = useState<PresetCategory | 'All' | 'My Foods'>('All');
  const [query, setQuery] = useState('');
  const customFoodItems = useFoodStore((s) => s.customFoodItems);
  const removeCustomFood = useFoodStore((s) => s.removeCustomFood);

  const filtered = GYM_PRESETS.filter((p) => {
    const matchesCategory = activeCategory === 'All' || activeCategory === 'My Foods' || p.category === activeCategory;
    const matchesQuery = !query.trim() || p.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery && activeCategory !== 'My Foods';
  });

  const filteredCustom = customFoodItems.filter((p) =>
    !query.trim() || p.name.toLowerCase().includes(query.toLowerCase())
  );

  const showMyFoods = activeCategory === 'My Foods' || activeCategory === 'All';

  return (
    <div className="p-4 flex flex-col gap-3">
      {/* Search bar */}
      <div className="relative flex items-center">
        <Search size={15} className="absolute left-3 text-gray-500 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search presets..."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-lime-400 transition-colors"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(['All', 'My Foods', ...PRESET_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as PresetCategory | 'All' | 'My Foods')}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-lime-400 text-gray-950'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {cat}{cat === 'My Foods' && customFoodItems.length > 0 ? ` (${customFoodItems.length})` : ''}
          </button>
        ))}
      </div>

      {/* My Foods section */}
      {showMyFoods && filteredCustom.length > 0 && (
        <>
          {activeCategory === 'All' && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Foods</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {filteredCustom.map((food) => (
              <div key={food.id} className="relative group">
                <button
                  onClick={() => onSelect(food)}
                  className="w-full text-left bg-gray-800 hover:bg-gray-750 border border-lime-400/30 hover:border-lime-400/60 rounded-xl p-3 pr-8 transition-all"
                >
                  <div className="text-sm font-medium text-gray-200 leading-snug mb-1">{food.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{food.servingLabel}</div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-lime-400 font-semibold">{food.macrosPerServing.calories} kcal</span>
                    <span className="text-xs text-blue-400">{food.macrosPerServing.protein}P</span>
                    <span className="text-xs text-yellow-400">{food.macrosPerServing.carbs}C</span>
                    <span className="text-xs text-orange-400">{food.macrosPerServing.fat}F</span>
                  </div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeCustomFood(food.id); }}
                  className="absolute top-2 right-2 p-1 rounded-lg text-gray-600 hover:text-red-400 hover:bg-gray-700 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          {activeCategory === 'All' && filtered.length > 0 && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Presets</p>
          )}
        </>
      )}

      {/* Preset grid */}
      {activeCategory !== 'My Foods' && (
        <>
          {filtered.length === 0 && filteredCustom.length === 0 && (
            <p className="text-sm text-gray-600 text-center py-4">No presets match "{query}"</p>
          )}
          {filtered.length === 0 && filteredCustom.length > 0 && query && (
            <p className="text-sm text-gray-600 text-center py-2">No presets match "{query}"</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelect(preset)}
                className="text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-lime-400/40 rounded-xl p-3 transition-all"
              >
                <div className="text-sm font-medium text-gray-200 leading-snug mb-1">{preset.name}</div>
                <div className="text-xs text-gray-500 mb-2">{preset.servingLabel}</div>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs text-lime-400 font-semibold">{preset.macrosPerServing.calories} kcal</span>
                  <span className="text-xs text-blue-400">{preset.macrosPerServing.protein}P</span>
                  <span className="text-xs text-yellow-400">{preset.macrosPerServing.carbs}C</span>
                  <span className="text-xs text-orange-400">{preset.macrosPerServing.fat}F</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* My Foods empty state */}
      {activeCategory === 'My Foods' && filteredCustom.length === 0 && (
        <p className="text-sm text-gray-600 text-center py-6">
          {query ? `No saved foods match "${query}"` : 'No saved foods yet. Add foods via the Manual tab.'}
        </p>
      )}
    </div>
  );
}
