import React from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';
import type { ActiveFiltersState } from './ActiveFilterChips';

interface FilterSidebarProps {
  filters: ActiveFiltersState;
  onChangeFilter: <K extends keyof ActiveFiltersState>(key: K, value: ActiveFiltersState[K]) => void;
  onResetFilters: () => void;
  totalMatchesCount?: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChangeFilter,
  onResetFilters,
  totalMatchesCount
}) => {
  const toggleFuel = (fuel: string) => {
    const current = filters.selectedFuel;
    if (current.includes(fuel)) {
      onChangeFilter('selectedFuel', current.filter(f => f !== fuel));
    } else {
      onChangeFilter('selectedFuel', [...current, fuel]);
    }
  };

  const toggleTransmission = (trans: string) => {
    const current = filters.selectedTransmission;
    if (current.includes(trans)) {
      onChangeFilter('selectedTransmission', current.filter(t => t !== trans));
    } else {
      onChangeFilter('selectedTransmission', [...current, trans]);
    }
  };

  return (
    <aside className="filter-sidebar" aria-label="Catalog filters">
      <div className="filter-sidebar-header">
        <div>
          <h3 className="filter-sidebar-title">Filters</h3>
          {totalMatchesCount !== undefined && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {totalMatchesCount} {totalMatchesCount === 1 ? 'item' : 'items'} available
            </span>
          )}
        </div>
        <button
          type="button"
          className="filter-reset-btn"
          onClick={onResetFilters}
          aria-label="Reset all search filters"
        >
          <RotateCcw size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Reset
        </button>
      </div>

      {/* 1. Category Vertical */}
      <div className="filter-section">
        <div className="filter-section-title">Department</div>
        <div className="filter-category-options" role="radiogroup" aria-label="Select department">
          {[
            { id: 'ALL', label: 'All Inventory' },
            { id: 'RENT', label: '🚗 Self-Drive Cars' },
            { id: 'ROOM_ESSENTIAL', label: '🪑 Room & Study Gear' },
            { id: 'BUY_USED', label: '🔄 Used Resale' },
            { id: 'MAKER', label: '🎨 Local Makers' }
          ].map(cat => (
            <label key={cat.id} className="filter-radio-item">
              <input
                type="radio"
                name="category"
                checked={filters.category === cat.id}
                onChange={() => onChangeFilter('category', cat.id as any)}
              />
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Distance Radius Slider */}
      <div className="filter-section">
        <div className="filter-section-title">
          <span>Distance Radius</span>
          <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
            {filters.maxDistance} km
          </span>
        </div>
        <input
          type="range"
          min="2"
          max="35"
          step="1"
          value={filters.maxDistance}
          onChange={(e) => onChangeFilter('maxDistance', Number(e.target.value))}
          className="filter-range-input"
          aria-label="Filter listings by distance in kilometers"
        />
        <div className="filter-range-labels">
          <span>2 km (Campus)</span>
          <span>35 km (Tri-City)</span>
        </div>
      </div>

      {/* 3. Delivery Method */}
      <div className="filter-section">
        <div className="filter-section-title">Fulfilment</div>
        <label className="filter-checkbox-item">
          <input
            type="checkbox"
            checked={filters.deliveryOnly}
            onChange={(e) => onChangeFilter('deliveryOnly', e.target.checked)}
          />
          <span>Campus Gate / Doorstep Delivery (+₹250)</span>
        </label>
      </div>

      {/* 4. Car-Specific Facets */}
      {(filters.category === 'ALL' || filters.category === 'RENT') && (
        <>
          <div className="filter-section">
            <div className="filter-section-title">Fuel Type</div>
            {['Diesel', 'Petrol', 'EV'].map(fuel => (
              <label key={fuel} className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.selectedFuel.includes(fuel)}
                  onChange={() => toggleFuel(fuel)}
                />
                <span>{fuel}</span>
              </label>
            ))}
          </div>

          <div className="filter-section">
            <div className="filter-section-title">Transmission</div>
            {['Automatic', 'Manual'].map(trans => (
              <label key={trans} className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.selectedTransmission.includes(trans)}
                  onChange={() => toggleTransmission(trans)}
                />
                <span>{trans}</span>
              </label>
            ))}
          </div>
        </>
      )}

      {/* 5. Trust Guarantees */}
      <div className="filter-section">
        <div className="filter-section-title">Trust & Handover</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> Commercial RTO Yellow-Plate
          </span>
          <span style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> 6-Point Camera Inspection
          </span>
          <span style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> Escrow Deposit Protection
          </span>
        </div>
        <div style={{ marginTop: '0.85rem' }}>
          <a
            href="#/trust-safety"
            style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textDecoration: 'underline' }}
          >
            Review Trust & Safety policy →
          </a>
        </div>
      </div>
    </aside>
  );
};
