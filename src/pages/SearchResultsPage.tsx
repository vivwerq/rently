import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import type { ListingItem, LocalityOption } from '../data/mockData';
import { ListingCard } from '../components/ListingCard';
import { FilterSidebar } from '../components/search/FilterSidebar';
import { ActiveFilterChips } from '../components/search/ActiveFilterChips';
import type { ActiveFiltersState } from '../components/search/ActiveFilterChips';
import { BottomSheet, EmptyState, Button, Breadcrumbs } from '../components/ui';

interface SearchResultsPageProps {
  allListings: ListingItem[];
  selectedLocality: LocalityOption;
  onSelectLocality?: (loc: LocalityOption) => void;
  favorites: { [id: string]: boolean };
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectListing: (item: ListingItem) => void;
  onNavigate: (path: string) => void;
  initialQuery?: string;
  initialCategory?: 'ALL' | 'RENT' | 'ROOM_ESSENTIAL' | 'BUY_USED' | 'MAKER';
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  allListings,
  selectedLocality,
  favorites,
  onToggleFavorite,
  onSelectListing,
  onNavigate,
  initialQuery = '',
  initialCategory = 'ALL'
}) => {
  const [filters, setFilters] = useState<ActiveFiltersState>({
    searchQuery: initialQuery,
    category: initialCategory,
    maxDistance: 30,
    deliveryOnly: false,
    selectedFuel: [],
    selectedTransmission: [],
    sortBy: 'DISTANCE_ASC'
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleFilterChange = <K extends keyof ActiveFiltersState>(
    key: K,
    value: ActiveFiltersState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'ALL',
      maxDistance: 30,
      deliveryOnly: false,
      selectedFuel: [],
      selectedTransmission: [],
      sortBy: 'DISTANCE_ASC'
    });
  };

  const handleRemoveFilter = (key: keyof ActiveFiltersState, value?: any) => {
    if (key === 'searchQuery') {
      handleFilterChange('searchQuery', '');
    } else if (key === 'category') {
      handleFilterChange('category', 'ALL');
    } else if (key === 'maxDistance') {
      handleFilterChange('maxDistance', 30);
    } else if (key === 'deliveryOnly') {
      handleFilterChange('deliveryOnly', false);
    } else if (key === 'selectedFuel' && value) {
      handleFilterChange(
        'selectedFuel',
        filters.selectedFuel.filter(f => f !== value)
      );
    } else if (key === 'selectedTransmission' && value) {
      handleFilterChange(
        'selectedTransmission',
        filters.selectedTransmission.filter(t => t !== value)
      );
    }
  };

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    return allListings
      .filter(item => {
        // Category filter
        if (filters.category === 'RENT' && item.category !== 'CAR') return false;
        if (
          filters.category === 'ROOM_ESSENTIAL' &&
          item.category !== 'ROOM_ESSENTIAL' &&
          item.category !== 'ELECTRONICS'
        ) {
          return false;
        }
        if (filters.category === 'BUY_USED' && item.mode !== 'BUY_USED') return false;
        if (filters.category === 'MAKER' && item.mode !== 'MAKER') return false;

        // Search query
        if (filters.searchQuery.trim() !== '') {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchLocation = item.location.toLowerCase().includes(q);
          const matchCategory = item.category.toLowerCase().includes(q);
          if (!matchTitle && !matchLocation && !matchCategory) return false;
        }

        // Distance filter
        if (item.distanceKm > filters.maxDistance) return false;

        // Fuel filter
        if (filters.selectedFuel.length > 0 && item.carSpecs) {
          if (!filters.selectedFuel.includes(item.carSpecs.fuel)) return false;
        }

        // Transmission filter
        if (filters.selectedTransmission.length > 0 && item.carSpecs) {
          const isAuto = item.carSpecs.transmission.toLowerCase().includes('auto');
          const wantAuto = filters.selectedTransmission.includes('Automatic');
          const wantManual = filters.selectedTransmission.includes('Manual');
          if (wantAuto && !isAuto) return false;
          if (wantManual && isAuto) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'DISTANCE_ASC') {
          return a.distanceKm - b.distanceKm;
        }
        if (filters.sortBy === 'PRICE_ASC') {
          return a.price - b.price;
        }
        if (filters.sortBy === 'PRICE_DESC') {
          return b.price - a.price;
        }
        if (filters.sortBy === 'RATING_DESC') {
          const ratingA = a.operator?.rating || 4.5;
          const ratingB = b.operator?.rating || 4.5;
          return ratingB - ratingA;
        }
        return 0;
      });
  }, [allListings, filters]);

  // Page title generator
  const pageTitle = useMemo(() => {
    if (filters.searchQuery.trim()) {
      return `Search results for "${filters.searchQuery}"`;
    }
    if (filters.category === 'RENT') {
      return `Self-Drive Cars near ${selectedLocality.name.split('(')[0].trim()}`;
    }
    if (filters.category === 'ROOM_ESSENTIAL') {
      return `Student Room Essentials & Furniture`;
    }
    if (filters.category === 'BUY_USED') {
      return `Student Pass-it-On Resale Marketplace`;
    }
    if (filters.category === 'MAKER') {
      return `Local Artisan & Handcrafted Creations`;
    }
    return `Verified Rentals & Commerce near ${selectedLocality.name.split('(')[0].trim()}`;
  }, [filters.searchQuery, filters.category, selectedLocality]);

  return (
    <main className="search-results-page" id="main-content">
      {/* 1. Standard Breadcrumbs */}
      <Breadcrumbs
        onNavigate={onNavigate}
        showBackButton={false}
        items={[
          { label: 'Home', path: '#/' },
          { label: 'Search & Browse', path: filters.category !== 'ALL' ? '#/search' : undefined },
          ...(filters.category !== 'ALL'
            ? [{
                label:
                  filters.category === 'RENT'
                    ? 'Cars'
                    : filters.category === 'ROOM_ESSENTIAL'
                    ? 'Room Essentials'
                    : filters.category === 'BUY_USED'
                    ? 'Resale'
                    : 'Makers'
              }]
            : [])
        ]}
      />

      {/* 2. Search Page Header */}
      <header className="search-header-panel">
        <div className="search-header-main">
          <h1 className="search-page-title">{pageTitle}</h1>
          <p className="search-page-subhead">
            <span className="search-count-badge">
              {filteredAndSortedListings.length} {filteredAndSortedListings.length === 1 ? 'item' : 'items'}
            </span>
            <span>
              found within {filters.maxDistance} km of <strong>{selectedLocality.name}</strong>
            </span>
          </p>
        </div>

        {/* Sort Controls & Mobile Filter Trigger */}
        <div className="search-controls-group">
          {/* Mobile Filter Button */}
          <button
            type="button"
            className="mobile-filter-open-btn"
            onClick={() => setMobileFilterOpen(true)}
            aria-label="Open filter menu"
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="sort-dropdown-box">
            <label htmlFor="search-sort-select" className="sort-label">
              <ArrowUpDown size={13} />
              <span>Sort:</span>
            </label>
            <select
              id="search-sort-select"
              className="sort-select-input"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
              aria-label="Sort listings by"
            >
              <option value="DISTANCE_ASC">Nearest First</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="RATING_DESC">Top Rated Operators</option>
            </select>
          </div>
        </div>
      </header>

      {/* 3. Main 2-Column Catalog Layout */}
      <div className="search-layout-container">
        {/* Left Column: Filter Sidebar (Desktop) */}
        <div className="search-sidebar-column">
          <FilterSidebar
            filters={filters}
            onChangeFilter={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalMatchesCount={filteredAndSortedListings.length}
          />
        </div>

        {/* Right Column: Active Chips + Grid / Empty State */}
        <div className="search-results-column">
          <ActiveFilterChips
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleResetFilters}
          />

          {filteredAndSortedListings.length > 0 ? (
            <div className="search-listings-grid" role="region" aria-label="Search items">
              {filteredAndSortedListings.map(item => (
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
            <EmptyState
              title="No items found matching your filters"
              description="Try broadening your distance radius slider, removing specific fuel options, or clearing your search keywords."
              primaryActionLabel="Clear all filters"
              onPrimaryAction={handleResetFilters}
              secondaryActionLabel="Return to Homepage"
              onSecondaryAction={() => onNavigate('#/')}
            />
          )}
        </div>
      </div>

      {/* 4. Mobile Bottom Sheet for Filters */}
      <BottomSheet
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Refine Search & Filters"
        footer={
          <Button
            variant="primary"
            fullWidth
            onClick={() => setMobileFilterOpen(false)}
          >
            Show {filteredAndSortedListings.length} Results
          </Button>
        }
      >
        <FilterSidebar
          filters={filters}
          onChangeFilter={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalMatchesCount={filteredAndSortedListings.length}
        />
      </BottomSheet>
    </main>
  );
};
