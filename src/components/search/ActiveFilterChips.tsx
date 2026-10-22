import React from 'react';
import { X, RotateCcw } from 'lucide-react';

export interface ActiveFiltersState {
  searchQuery: string;
  category: 'ALL' | 'RENT' | 'ROOM_ESSENTIAL' | 'BUY_USED' | 'MAKER';
  maxDistance: number;
  deliveryOnly: boolean;
  selectedFuel: string[];
  selectedTransmission: string[];
  sortBy: 'DISTANCE_ASC' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING_DESC';
}

interface ActiveFilterChipsProps {
  filters: ActiveFiltersState;
  onRemoveFilter: (key: keyof ActiveFiltersState, value?: any) => void;
  onClearAll: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll
}) => {
  const chips: { key: keyof ActiveFiltersState; label: string; value?: any }[] = [];

  if (filters.searchQuery.trim()) {
    chips.push({
      key: 'searchQuery',
      label: `"${filters.searchQuery}"`
    });
  }

  if (filters.category !== 'ALL') {
    const categoryLabels: Record<string, string> = {
      RENT: 'Cars',
      ROOM_ESSENTIAL: 'Room & Study Gear',
      BUY_USED: 'Used Resale',
      MAKER: 'Local Makers'
    };
    chips.push({
      key: 'category',
      label: categoryLabels[filters.category] || filters.category
    });
  }

  if (filters.maxDistance < 30) {
    chips.push({
      key: 'maxDistance',
      label: `Within ${filters.maxDistance} km`
    });
  }

  if (filters.deliveryOnly) {
    chips.push({
      key: 'deliveryOnly',
      label: 'Campus / Doorstep Delivery'
    });
  }

  filters.selectedFuel.forEach(fuel => {
    chips.push({
      key: 'selectedFuel',
      label: fuel,
      value: fuel
    });
  });

  filters.selectedTransmission.forEach(trans => {
    chips.push({
      key: 'selectedTransmission',
      label: trans,
      value: trans
    });
  });

  if (chips.length === 0) return null;

  return (
    <div className="active-filters-bar" role="region" aria-label="Active filters">
      <div className="active-filters-list">
        <span className="active-filters-label">Active filters:</span>
        {chips.map((chip, idx) => (
          <span
            key={idx}
            className="active-filter-chip"
            onClick={() => onRemoveFilter(chip.key, chip.value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRemoveFilter(chip.key, chip.value);
              }
            }}
            aria-label={`Remove filter ${chip.label}`}
          >
            <span>{chip.label}</span>
            <X size={12} className="chip-remove-icon" />
          </span>
        ))}

        <button
          type="button"
          className="active-filters-clear-btn"
          onClick={onClearAll}
          aria-label="Clear all active filters"
        >
          <RotateCcw size={12} />
          <span>Clear all</span>
        </button>
      </div>
    </div>
  );
};
