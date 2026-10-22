import React, { useState } from 'react';
import type { ListingItem, LocalityOption } from '../data/mockData';
import { HeroCarousel } from '../components/HeroCarousel';
import { ListingRowCarousel } from '../components/ListingRowCarousel';
import { WelcomePrompt } from '../components/WelcomePrompt';
import {
  CategoryShortcutsSection,
  DriveTypesSection,
  HowItWorksHomeSection,
  KnowBeforeYouBookSection,
  SecondaryCommerceSection,
  SupplierInviteSection,
  FaqHomeSection,
  MarketplaceSection
} from './home';

interface HomePageProps {
  listings: ListingItem[];
  selectedLocality: LocalityOption;
  onSelectLocality?: (loc: LocalityOption) => void;
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
  onOpenLocationModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  listings,
  selectedLocality,
  onSelectLocality,
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
  onNavigate,
  onOpenLocationModal
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0); // 0 = Cars (default on fresh visit)

  const scrollToResults = () => {
    const el = document.getElementById('marketplace-results');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter listings for the rental carousels
  const carListings = listings.filter(i => i.category === 'CAR');
  const cameraListings = listings.filter(i => 
    i.category === 'ELECTRONICS' && (
      i.title.toLowerCase().includes('camera') || 
      i.title.toLowerCase().includes('dslr') || 
      i.title.toLowerCase().includes('sony') ||
      i.title.toLowerCase().includes('lens') ||
      i.title.toLowerCase().includes('drone')
    )
  );
  const gamingListings = listings.filter(i => 
    i.title.toLowerCase().includes('ps5') || 
    i.title.toLowerCase().includes('gaming') || 
    i.title.toLowerCase().includes('xbox') || 
    i.title.toLowerCase().includes('console')
  );
  const outdoorListings = listings.filter(i => 
    i.title.toLowerCase().includes('tent') || 
    i.title.toLowerCase().includes('trek') || 
    i.title.toLowerCase().includes('camp') || 
    i.title.toLowerCase().includes('outdoor') ||
    i.title.toLowerCase().includes('rucksack')
  );
  const entertainmentListings = listings.filter(i => 
    i.category === 'ELECTRONICS' && (
      i.title.toLowerCase().includes('projector') || 
      i.title.toLowerCase().includes('speaker') ||
      i.title.toLowerCase().includes('party')
    )
  );

  // Secondary categories
  const makerListings = listings.filter(i => i.mode === 'MAKER');
  const resaleListings = listings.filter(i => i.mode === 'BUY_USED');

  return (
    <main role="main" className="sharepal-inspired-home">
      {/* ====================================================================
          WELCOME PROMPT (Compact, non-disruptive 2-step guide)
          ==================================================================== */}
      <WelcomePrompt
        currentLocality={selectedLocality}
        onSelectLocality={(loc) => {
          if (onSelectLocality) onSelectLocality(loc);
        }}
        onSelectCategory={(categoryIndex) => {
          if (categoryIndex >= 0 && categoryIndex <= 4) {
            setActiveSlideIndex(categoryIndex);
          }
        }}
        onOpenFullLocationModal={() => {
          if (onOpenLocationModal) onOpenLocationModal();
        }}
      />

      {/* ====================================================================
          HERO CAROUSEL & SEARCH DOCK
          ==================================================================== */}
      <HeroCarousel
        selectedLocality={selectedLocality}
        onOpenLocationModal={() => {
          if (onOpenLocationModal) onOpenLocationModal();
        }}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onExecuteSearch={scrollToResults}
        activeSlideIndex={activeSlideIndex}
        onSlideChange={setActiveSlideIndex}
      />

      {/* ====================================================================
          1. BROWSE BY CATEGORY SHORTCUTS
          ==================================================================== */}
      <CategoryShortcutsSection
        onSelectCategory={onSelectCategory}
        onSearchChange={onSearchChange}
        scrollToResults={scrollToResults}
      />

      {/* ====================================================================
          2. CARS IN THE SELECTED LOCATION (Top Priority Rental Row)
          ==================================================================== */}
      <div className="homepage-carousels-container">
        <ListingRowCarousel
          id="section-cars"
          title={`Cars in ${selectedLocality.name.split('(')[0].trim()}`}
          badgeText="Verified Self-Drive Fleet · Commercial Yellow Plate"
          subtitle="All commercial permits verified for Himachal, Punjab & Chandigarh. Zero damage deposit scams with 6-point pre-trip photos."
          viewAllText="View all cars"
          onViewAll={() => onSelectCategory('RENT')}
          items={carListings}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onSelectListing={onSelectListing}
          autoScroll={false}
          rentalDays={2}
          emptyState={
            <div className="honest-expansion-banner">
              <div className="expansion-banner-content">
                <div className="expansion-badge">🚗 Zero Cars in Selected Locality</div>
                <h3 className="expansion-title">No cars found within {maxDistance} km of {selectedLocality.name}</h3>
                <p className="expansion-text">
                  Broaden your distance radius in the search filters below to see available fleets across Mohali, Chandigarh & Kharar hubs.
                </p>
                <button type="button" className="expansion-primary-btn" onClick={onResetFilters}>
                  Expand to Tri-City Fleet
                </button>
              </div>
            </div>
          }
        />
      </div>

      {/* ====================================================================
          3. FIND YOUR KIND OF DRIVE
          ==================================================================== */}
      <DriveTypesSection
        onSelectCategory={onSelectCategory}
        onSearchChange={onSearchChange}
      />

      {/* ====================================================================
          4. MORE TO RENT NEARBY (Cameras, Gaming, Outdoors, Party Gear)
          ==================================================================== */}
      <div className="homepage-carousels-container">
        {cameraListings.length > 0 && (
          <ListingRowCarousel
            id="section-cameras"
            title="Cameras & Creator Equipment"
            badgeText="Creator Studio Gear"
            subtitle="Sony Alpha mirrorless, Canon DSLRs, and sub-249g drones with extra batteries and memory cards included."
            viewAllText="Search cameras"
            onViewAll={() => {
              onSearchChange('Camera');
              scrollToResults();
            }}
            items={cameraListings}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onSelectListing={onSelectListing}
            autoScroll={false}
          />
        )}

        {gamingListings.length > 0 && (
          <ListingRowCarousel
            id="section-gaming"
            title="Gaming Consoles & Controllers"
            badgeText="PlayStation 5 & Xbox Series X"
            subtitle="Hostel tournament passes with 2x wireless controllers and pre-installed esports titles."
            viewAllText="Search gaming"
            onViewAll={() => {
              onSearchChange('Gaming');
              scrollToResults();
            }}
            items={gamingListings}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onSelectListing={onSelectListing}
            autoScroll={false}
          />
        )}

        {outdoorListings.length > 0 && (
          <ListingRowCarousel
            id="section-outdoors"
            title="Camping & Outdoor Gear"
            badgeText="Trek Ready · Kasol & Triund"
            subtitle="All-weather dome tents, sub-zero sleeping bags, and 60L rucksacks inspected before every trek."
            viewAllText="Search outdoor gear"
            onViewAll={() => {
              onSearchChange('Tent');
              scrollToResults();
            }}
            items={outdoorListings}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onSelectListing={onSelectListing}
            autoScroll={false}
          />
        )}

        {entertainmentListings.length > 0 && (
          <ListingRowCarousel
            id="section-entertainment"
            title="Party & Entertainment Rentals"
            badgeText="Cinema Projectors & Audio"
            subtitle={'1080p high-lumen cinema projectors, 100" screens, and high-bass party speakers for flat events and hostel screenings.'}
            viewAllText="View all entertainment"
            onViewAll={() => onSelectCategory('ROOM_ESSENTIAL')}
            items={entertainmentListings}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onSelectListing={onSelectListing}
            autoScroll={false}
          />
        )}
      </div>

      {/* ====================================================================
          5. HOW RENTLY WORKS
          ==================================================================== */}
      <HowItWorksHomeSection onNavigate={onNavigate} />

      {/* ====================================================================
          6. KNOW BEFORE YOU BOOK
          ==================================================================== */}
      <KnowBeforeYouBookSection />

      {/* ====================================================================
          7. MADE NEARBY & PRE-LOVED FINDS
          ==================================================================== */}
      <SecondaryCommerceSection
        makerListings={makerListings}
        resaleListings={resaleListings}
        onSelectCategory={onSelectCategory}
        onSelectListing={onSelectListing}
      />

      {/* ====================================================================
          8. HAVE SOMETHING TO RENT OUT?
          ==================================================================== */}
      <SupplierInviteSection onNavigate={onNavigate} />

      {/* ====================================================================
          9. FREQUENTLY ASKED QUESTIONS
          ==================================================================== */}
      <FaqHomeSection />

      {/* ====================================================================
          10. CATEGORY DOCK & ALL-INVENTORY MARKETPLACE
          ==================================================================== */}
      <MarketplaceSection
        listings={listings}
        selectedLocality={selectedLocality}
        activeCategory={activeCategory}
        onSelectCategory={onSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        maxDistance={maxDistance}
        onDistanceChange={onDistanceChange}
        deliveryOnly={deliveryOnly}
        onToggleDelivery={onToggleDelivery}
        selectedFuel={selectedFuel}
        onToggleFuel={onToggleFuel}
        selectedTransmission={selectedTransmission}
        onToggleTransmission={onToggleTransmission}
        kmPackage={kmPackage}
        onSelectKmPackage={onSelectKmPackage}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onSelectListing={onSelectListing}
        onResetFilters={onResetFilters}
        onNavigate={onNavigate}
      />
    </main>
  );
};
