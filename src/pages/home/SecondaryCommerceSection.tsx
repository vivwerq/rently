import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { ListingItem } from '../../data/mockData';

interface SecondaryCommerceSectionProps {
  makerListings: ListingItem[];
  resaleListings: ListingItem[];
  onSelectCategory: (cat: 'ALL' | 'RENT' | 'ROOM_ESSENTIAL' | 'BUY_USED' | 'MAKER') => void;
  onSelectListing: (item: ListingItem) => void;
}

export const SecondaryCommerceSection: React.FC<SecondaryCommerceSectionProps> = ({
  makerListings,
  resaleListings,
  onSelectCategory,
  onSelectListing
}) => {
  if (makerListings.length === 0 && resaleListings.length === 0) {
    return null;
  }

  return (
    <section className="secondary-commerce-section" aria-labelledby="secondary-commerce-heading">
      <div className="section-headline-group">
        <div className="section-micro-badge">
          <Sparkles size={13} />
          <span>Campus & Local Creators</span>
        </div>
        <h2 id="secondary-commerce-heading" className="section-main-heading">
          Made nearby and Pre-loved finds
        </h2>
        <p className="section-sub-copy">
          Explore locally made artisan crafts and verified student secondhand items passed on between semesters.
        </p>
      </div>

      <div className="secondary-commerce-split">
        {/* MADE NEARBY */}
        {makerListings.length > 0 && (
          <div className="secondary-commerce-block">
            <div className="secondary-block-header">
              <div>
                <h3 className="secondary-block-title">Made nearby in Tri-City</h3>
                <p className="secondary-block-sub">Custom study organizers and handcrafted gifts from local artisans.</p>
              </div>
              <button
                type="button"
                className="secondary-view-all-link"
                onClick={() => onSelectCategory('MAKER')}
                aria-label="View all maker items"
              >
                <span>View all makers</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="secondary-cards-list">
              {makerListings.slice(0, 2).map(item => (
                <div
                  key={item.id}
                  className="secondary-compact-item"
                  onClick={() => onSelectListing(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectListing(item);
                    }
                  }}
                  aria-label={`View ${item.title}`}
                >
                  <img src={item.primaryImage} alt={item.title} className="secondary-compact-thumb" loading="lazy" />
                  <div className="secondary-compact-info">
                    <h4 className="secondary-compact-title">{item.title}</h4>
                    <div className="secondary-compact-meta">
                      {item.makerSpecs?.materials} · {item.makerSpecs?.leadDays}d handcrafted lead time
                    </div>
                    <div className="secondary-compact-price-line">
                      <strong>₹{item.price.toLocaleString()}</strong>
                      <span style={{ color: 'var(--text-tertiary)' }}>{item.priceUnit}</span>
                      <span className="secondary-badge-pill maker">🎨 Handcrafted</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRE-LOVED FINDS */}
        {resaleListings.length > 0 && (
          <div className="secondary-commerce-block">
            <div className="secondary-block-header">
              <div>
                <h3 className="secondary-block-title">Pre-loved campus finds</h3>
                <p className="secondary-block-sub">Verified secondhand gear and room items with zero rental deposits.</p>
              </div>
              <button
                type="button"
                className="secondary-view-all-link"
                onClick={() => onSelectCategory('BUY_USED')}
                aria-label="View all resale items"
              >
                <span>View all resale</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="secondary-cards-list">
              {resaleListings.slice(0, 2).map(item => (
                <div
                  key={item.id}
                  className="secondary-compact-item"
                  onClick={() => onSelectListing(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectListing(item);
                    }
                  }}
                  aria-label={`View ${item.title}`}
                >
                  <img src={item.primaryImage} alt={item.title} className="secondary-compact-thumb" loading="lazy" />
                  <div className="secondary-compact-info">
                    <h4 className="secondary-compact-title">{item.title}</h4>
                    <div className="secondary-compact-meta">
                      Original MRP ₹{item.resaleSpecs?.originalPrice.toLocaleString()} · {item.condition}
                    </div>
                    <div className="secondary-compact-price-line">
                      <strong>₹{item.price.toLocaleString()}</strong>
                      <span style={{ color: 'var(--text-tertiary)' }}>outright buy</span>
                      <span className="secondary-badge-pill resale">🔄 Zero Deposit</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
