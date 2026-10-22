import React, { useState } from 'react';
import { 
  Search, RotateCcw, SlidersHorizontal, ShieldCheck 
} from 'lucide-react';
import type { ListingItem, LocalityOption } from '../../data/mockData';
import { ListingCard } from '../../components/ListingCard';

interface MarketplaceSectionProps {
  listings: ListingItem[];
  selectedLocality: LocalityOption;
  activeCategory: 'ALL' | 'RENT' | 'ROOM_ESSENTIAL' | 'BUY_USED' | 'MAKER';
  onSelectCategory: (cat: 'ALL' | 'RENT' | 'ROOM_ESSENTIAL' | 'BUY_USED' | 'MAKER') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  maxDistance: number;
  onDistanceChange: (d: number) => void;
  deliveryOnly: boolean;
  onToggleDelivery: () => void;
  selectedFuel: string[];
  onToggleFuel: (f: string) => void;
  selectedTransmission: string[];
  onToggleTransmission: (t: string) => void;
  kmPackage: 'STANDARD' | 'EXTENDED';
  onSelectKmPackage: (p: 'STANDARD' | 'EXTENDED') => void;
  favorites: { [id: string]: boolean };
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectListing: (item: ListingItem) => void;
  onResetFilters: () => void;
  onNavigate: (path: string) => void;
}

export const MarketplaceSection: React.FC<MarketplaceSectionProps> = ({
  listings,
  selectedLocality,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  maxDistance,
  onDistanceChange,
  deliveryOnly,
  onToggleDelivery,
  selectedFuel,
  onToggleFuel,
  selectedTransmission,
  onToggleTransmission,
  kmPackage,
  onSelectKmPackage,
  favorites,
  onToggleFavorite,
  onSelectListing,
  onResetFilters,
  onNavigate
}) => {
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);

  return (
    <section id="marketplace-results" className="marketplace-section-container" aria-label="Marketplace search and listings">
      <div className="marketplace-section-intro">
        <div className="marketplace-intro-badge">
          <ShieldCheck size={14} color="#16a34a" />
          <span>Campus & Tri-City Marketplace Hub</span>
        </div>
        <h2 className="marketplace-intro-title">
          Explore All Campus Inventory & Resale
        </h2>
        <p className="marketplace-intro-subhead">
          Browse semester room essentials, used cycles, furniture, and local handcrafted goods.
        </p>

        {/* Category Filter Dock */}
        <div className="category-filter-dock" role="tablist" aria-label="Browse by category">
          <button
            role="tab"
            aria-selected={activeCategory === 'ALL'}
            className={`category-chip-btn ${activeCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => onSelectCategory('ALL')}
          >
            All Inventory ({listings.length})
          </button>
          <button
            role="tab"
            aria-selected={activeCategory === 'RENT'}
            className={`category-chip-btn ${activeCategory === 'RENT' ? 'active' : ''}`}
            onClick={() => onSelectCategory('RENT')}
          >
            🚗 Self-Drive Cars
          </button>
          <button
            role="tab"
            aria-selected={activeCategory === 'ROOM_ESSENTIAL'}
            className={`category-chip-btn ${activeCategory === 'ROOM_ESSENTIAL' ? 'active' : ''}`}
            onClick={() => onSelectCategory('ROOM_ESSENTIAL')}
          >
            🪑 Room & Study (Coolers & Desks)
          </button>
          <button
            role="tab"
            aria-selected={activeCategory === 'BUY_USED'}
            className={`category-chip-btn ${activeCategory === 'BUY_USED' ? 'active' : ''}`}
            onClick={() => onSelectCategory('BUY_USED')}
          >
            🔄 Used Resale (Direct Buy)
          </button>
          <button
            role="tab"
            aria-selected={activeCategory === 'MAKER'}
            className={`category-chip-btn ${activeCategory === 'MAKER' ? 'active' : ''}`}
            onClick={() => onSelectCategory('MAKER')}
          >
            🎨 Local Makers (Crafted)
          </button>
        </div>
      </div>

      {/* Mobile Filter Toggle Bar */}
      <div className="mobile-filter-bar">
        <button
          className="mobile-filter-trigger-btn"
          onClick={() => setMobileFiltersExpanded(!mobileFiltersExpanded)}
          aria-expanded={mobileFiltersExpanded}
        >
          <SlidersHorizontal size={14} />
          <span>{mobileFiltersExpanded ? 'Close Search Filters ▴' : 'Refine Filters & Distance ▾'}</span>
        </button>
      </div>

      {/* 2-Column Marketplace Grid: Sidebar + Results */}
      <div className="marketplace-layout">
        {/* Filter Sidebar */}
        <aside className={`filter-sidebar ${mobileFiltersExpanded ? 'expanded' : ''}`} aria-labelledby="filters-heading">
          <div className="filter-sidebar-header">
            <h3 id="filters-heading" className="filter-sidebar-title">Refine Search</h3>
            <button className="filter-reset-btn" onClick={onResetFilters} aria-label="Reset all search filters">
              <RotateCcw size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Reset
            </button>
          </div>

          {/* Distance Filter */}
          <div className="filter-section">
            <div className="filter-section-title">
              <span>Distance Radius</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{maxDistance} km</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              value={maxDistance}
              onChange={(e) => onDistanceChange(Number(e.target.value))}
              className="filter-range-input"
              aria-label="Filter listings by distance in kilometers"
            />
            <div className="filter-range-labels">
              <span>2 km (Campus)</span>
              <span>30 km (Tri-City)</span>
            </div>
          </div>

          {/* Delivery Filter */}
          <div className="filter-section">
            <div className="filter-section-title">Handover Location</div>
            <label className="filter-checkbox-item">
              <input
                type="checkbox"
                checked={deliveryOnly}
                onChange={onToggleDelivery}
              />
              <span>Campus Gate / Doorstep (+₹250)</span>
            </label>
          </div>

          {/* Car-Specific Filters (Shown when Cars or All is selected) */}
          {(activeCategory === 'ALL' || activeCategory === 'RENT') && (
            <>
              <div className="filter-section">
                <div className="filter-section-title">Fuel Type</div>
                <label className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedFuel.includes('Diesel')}
                    onChange={() => onToggleFuel('Diesel')}
                  />
                  <span>Diesel</span>
                </label>
                <label className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedFuel.includes('Petrol')}
                    onChange={() => onToggleFuel('Petrol')}
                  />
                  <span>Petrol</span>
                </label>
                <label className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedFuel.includes('EV')}
                    onChange={() => onToggleFuel('EV')}
                  />
                  <span>Electric (EV)</span>
                </label>
              </div>

              <div className="filter-section">
                <div className="filter-section-title">Transmission</div>
                <label className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedTransmission.includes('Automatic')}
                    onChange={() => onToggleTransmission('Automatic')}
                  />
                  <span>Automatic</span>
                </label>
                <label className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedTransmission.includes('Manual')}
                    onChange={() => onToggleTransmission('Manual')}
                  />
                  <span>Manual</span>
                </label>
              </div>
            </>
          )}

          {/* Trust Guarantees */}
          <div className="filter-section">
            <div className="filter-section-title">Mandatory Standards</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-emerald)' }}>✓ 100% Commercial RTO Permits</span>
              <span style={{ color: 'var(--accent-blue)' }}>✓ 6-Point Camera Watermark</span>
              <span style={{ color: 'var(--accent-amber)' }}>✓ Zero Damage Deduction Abuse</span>
            </div>
            <div style={{ marginTop: '0.85rem' }}>
              <a
                href="#/trust-safety"
                onClick={(e) => { e.preventDefault(); onNavigate('#/trust-safety'); }}
                style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textDecoration: 'underline' }}
              >
                Read our verification criteria →
              </a>
            </div>
          </div>
        </aside>

        {/* Right Main Column */}
        <div className="results-column">
          {/* Search Bar & Package Controls */}
          <div className="search-controls-bar">
            <div className="search-input-box">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by model (Thar, Creta), item (Cooler, Desk), or location..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search listings by keyword"
              />
            </div>

            {/* Car KM Package Toggle */}
            {(activeCategory === 'ALL' || activeCategory === 'RENT') && (
              <div className="km-package-switch" role="group" aria-label="Daily kilometer package">
                <button
                  className={`km-package-btn ${kmPackage === 'STANDARD' ? 'active' : ''}`}
                  onClick={() => onSelectKmPackage('STANDARD')}
                >
                  250 km/day (Local)
                </button>
                <button
                  className={`km-package-btn ${kmPackage === 'EXTENDED' ? 'active' : ''}`}
                  onClick={() => onSelectKmPackage('EXTENDED')}
                >
                  400 km/day (Hills)
                </button>
              </div>
            )}
          </div>

          {/* Results Summary Line */}
          <div className="results-header-row">
            <div>
              Showing <strong>{listings.length} verified listings</strong> near <strong>{selectedLocality.name}</strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>
              ✓ All-in transparent quotes · No checkout surprises
            </div>
          </div>

          {/* Listings Grid */}
          {listings.length > 0 ? (
            <div className="listings-grid" role="region" aria-label="Listing search results">
              {listings.map(item => (
                <ListingCard
                  key={item.id}
                  item={item}
                  isFavorite={!!favorites[item.id]}
                  onToggleFavorite={onToggleFavorite}
                  onSelect={onSelectListing}
                />
              ))}
            </div>
          ) : (
            <div className="empty-results-box" role="status">
              <div className="empty-results-title">No listings match your current filters</div>
              <p className="empty-results-text">
                Try broadening your distance radius, removing fuel filters, or clearing your search term to see nearby inventory.
              </p>
              <button className="nav-action-btn primary" onClick={onResetFilters}>
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
