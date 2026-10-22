import React, { useState } from 'react';
import { Trash2, Columns3, LayoutGrid } from 'lucide-react';
import type { ListingItem } from '../data/mockData';
import { ListingCard } from '../components/ListingCard';
import { ComparisonTable } from '../components/commerce';
import { EmptyState, Breadcrumbs } from '../components/ui';

interface SavedItemsPageProps {
  savedListings: ListingItem[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectListing: (item: ListingItem) => void;
  onClearAll: () => void;
  onBack: () => void;
  onNavigate: (path: string) => void;
}

export const SavedItemsPage: React.FC<SavedItemsPageProps> = ({
  savedListings,
  onToggleFavorite,
  onSelectListing,
  onClearAll,
  onBack,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'GRID' | 'COMPARE'>('GRID');

  return (
    <main className="details-page-container" role="main">
      <Breadcrumbs
        onNavigate={onNavigate}
        onBack={onBack}
        items={[
          { label: 'Home', path: '#/' },
          { label: `Saved Favorites (${savedListings.length})` }
        ]}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Your Saved Listings
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Compare vehicles, student room packages, and items saved for your upcoming semester or road trip.
          </p>
        </div>

        {savedListings.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {savedListings.length >= 2 && (
              <div className="segmented-tab-control" role="tablist" aria-label="Saved items view mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'GRID'}
                  className={`segmented-tab-btn ${activeTab === 'GRID' ? 'active' : ''}`}
                  onClick={() => setActiveTab('GRID')}
                >
                  <LayoutGrid size={14} />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'COMPARE'}
                  className={`segmented-tab-btn ${activeTab === 'COMPARE' ? 'active' : ''}`}
                  onClick={() => setActiveTab('COMPARE')}
                >
                  <Columns3 size={14} />
                  <span>Compare ({savedListings.length})</span>
                </button>
              </div>
            )}

            <button
              onClick={onClearAll}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', padding: '0.45rem 0.85rem', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}
              aria-label="Clear all saved listings"
            >
              <Trash2 size={13} /> Clear All
            </button>
          </div>
        )}
      </div>

      {savedListings.length > 0 ? (
        activeTab === 'COMPARE' && savedListings.length >= 2 ? (
          <ComparisonTable
            items={savedListings}
            onRemoveItem={onToggleFavorite}
            onSelectItem={onSelectListing}
          />
        ) : (
          <div className="listings-grid">
            {savedListings.map(item => (
              <ListingCard
                key={item.id}
                item={item}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectListing}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title="No Saved Items Yet"
          description="Tap the heart icon on any self-drive car, desert cooler, or secondhand item to compare specifications and prices."
          primaryActionLabel="Explore Available Inventory →"
          onPrimaryAction={() => onNavigate('#/')}
        />
      )}
    </main>
  );
};
