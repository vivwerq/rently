import React from 'react';
import { Heart, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import type { ListingItem } from '../data/mockData';

interface ListingCardProps {
  item: ListingItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: (item: ListingItem) => void;
  rentalDays?: number;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  item,
  isFavorite,
  onToggleFavorite,
  onSelect,
  rentalDays
}) => {
  // Format category-specific specs concisely
  const renderCategorySpec = () => {
    if (item.category === 'CAR' && item.carSpecs) {
      return `${item.carSpecs.transmission} · ${item.carSpecs.fuel} · ${item.carSpecs.seats} Seats · ${item.carSpecs.kmLimitDaily} km/day`;
    }
    if (item.category === 'ROOM_ESSENTIAL') {
      return `${item.condition || 'Verified Clean'} · Min 1 Semester · Free seasonal servicing`;
    }
    if (item.mode === 'BUY_USED' && item.resaleSpecs) {
      return `Original MRP ₹${item.resaleSpecs.originalPrice.toLocaleString()} · ${item.condition || 'Tested'}`;
    }
    if (item.mode === 'MAKER' && item.makerSpecs) {
      return `${item.makerSpecs.materials} · ${item.makerSpecs.leadDays} Days Handcrafted Lead Time`;
    }
    return item.location;
  };

  // Scoped verification badge text
  const renderVerificationPill = () => {
    if (item.category === 'CAR') {
      return (
        <span className="card-verification-pill">
          <ShieldCheck size={12} />
          Yellow-Plate RTO
        </span>
      );
    }
    if (item.studentPerk) {
      return (
        <span className="card-verification-pill" style={{ color: 'var(--accent-blue)' }}>
          🎓 Campus Gate Pickup
        </span>
      );
    }
    return (
      <span className="card-verification-pill" style={{ color: 'var(--accent-amber)' }}>
        ✓ Handover Verified
      </span>
    );
  };

  // Price formatting
  const renderPriceInfo = () => {
    if (item.category === 'CAR') {
      const calculatedTotal = rentalDays && rentalDays > 1 
        ? ` · ₹${(item.price * rentalDays).toLocaleString()} total (${rentalDays} days)` 
        : '';
      return {
        main: `₹${item.price.toLocaleString()}`,
        unit: '/day',
        calculatedTotal,
        depositNote: `₹${item.deposit.toLocaleString()} refundable escrow deposit`
      };
    }
    if (item.category === 'ROOM_ESSENTIAL') {
      return {
        main: `₹${item.price.toLocaleString()}`,
        unit: '/month',
        calculatedTotal: '',
        depositNote: `₹${item.deposit.toLocaleString()} refundable deposit`
      };
    }
    if (item.mode === 'BUY_USED') {
      return {
        main: `₹${item.price.toLocaleString()}`,
        unit: 'outright buy',
        calculatedTotal: '',
        depositNote: `₹${item.resaleSpecs?.assistedFee || 99} assisted handover fee · Zero deposit`
      };
    }
    // Maker
    return {
      main: `₹${item.price.toLocaleString()}`,
      unit: item.priceUnit,
      calculatedTotal: '',
      depositNote: item.deposit > 0 ? `₹${item.deposit} booking advance` : 'Zero advance'
    };
  };

  const priceInfo = renderPriceInfo();

  return (
    <article
      className="listing-card"
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
      aria-label={`View details for ${item.title}`}
    >
      {/* Media Box */}
      <div className="card-media-box">
        <img
          src={item.primaryImage}
          alt={item.title}
          className="card-media-img"
          loading="lazy"
        />

        {/* Verification badge */}
        {renderVerificationPill()}

        {/* Favorite Button */}
        <button
          className="card-favorite-btn"
          onClick={(e) => onToggleFavorite(item.id, e)}
          aria-label={isFavorite ? 'Remove from saved items' : 'Save item'}
          aria-pressed={isFavorite}
        >
          <Heart
            size={16}
            color={isFavorite ? '#f43f5e' : '#ffffff'}
            fill={isFavorite ? '#f43f5e' : 'none'}
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <div className="card-title-row">
          <h3 className="card-title">{item.title}</h3>
        </div>

        <div className="card-location-line">
          <MapPin size={12} color="#94a3b8" />
          <span>{item.distanceKm} km away · {item.location}</span>
        </div>

        <div className="card-specs-line">
          {renderCategorySpec()}
        </div>

        {/* Pricing & CTA */}
        <div className="card-bottom-row">
          <div className="card-pricing-block">
            <div className="card-pricing-main-line">
              <span className="price-main-figure">{priceInfo.main}</span>
              <span className="price-unit-tag"> {priceInfo.unit}</span>
              {priceInfo.calculatedTotal && (
                <span className="price-calculated-total">{priceInfo.calculatedTotal}</span>
              )}
            </div>
            <span className="price-deposit-note">{priceInfo.depositNote}</span>
          </div>

          <span className="card-action-link">
            Details <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </article>
  );
};
