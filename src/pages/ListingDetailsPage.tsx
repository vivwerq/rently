import React, { useState } from 'react';
import { 
  ShieldCheck, MapPin, 
  Star, Sparkles, AlertCircle 
} from 'lucide-react';
import type { ListingItem, LocalityOption } from '../data/mockData';
import { ImageGallery, PriceBreakdown } from '../components/commerce';
import { Button, Breadcrumbs } from '../components/ui';

interface ListingDetailsPageProps {
  listing: ListingItem;
  selectedLocality: LocalityOption;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onStartBooking: (listing: ListingItem) => void;
  onBack: () => void;
  onNavigate: (path: string) => void;
  isStudentVerified: boolean;
}

export const ListingDetailsPage: React.FC<ListingDetailsPageProps> = ({
  listing,
  selectedLocality,
  isFavorite,
  onToggleFavorite,
  onStartBooking,
  onBack,
  onNavigate,
  isStudentVerified
}) => {
  const [includeDelivery, setIncludeDelivery] = useState(true);
  const [rentalDuration, setRentalDuration] = useState(listing.category === 'ROOM_ESSENTIAL' ? 3 : 2);

  // CTA button copy based on category
  const renderCtaLabel = () => {
    if (listing.category === 'CAR') return 'Configure & Reserve Vehicle →';
    if (listing.category === 'ROOM_ESSENTIAL' || listing.category === 'ELECTRONICS') {
      return 'Reserve Equipment for Rent →';
    }
    if (listing.mode === 'BUY_USED') return 'Make an Offer / Buy Direct →';
    return 'Customize & Order from Artisan →';
  };

  return (
    <main className="details-page-container" role="main">
      {/* Standard Apple-HIG Breadcrumb Navigation */}
      <Breadcrumbs
        onNavigate={onNavigate}
        onBack={onBack}
        items={[
          { label: 'Home', path: '#/' },
          {
            label: listing.category === 'CAR' ? 'Cars' : listing.mode === 'BUY_USED' ? 'Resale' : 'Catalog',
            path: listing.category === 'CAR' ? '#/category/cars' : listing.mode === 'BUY_USED' ? '#/category/resale' : '#/search'
          },
          { label: listing.title }
        ]}
      />

      {/* Two Column Layout */}
      <div className="details-grid">
        {/* Left Column: Gallery & Specs Sheet */}
        <div className="details-gallery">
          <ImageGallery
            listing={listing}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />

          {/* Detailed Category Specifications Sheet */}
          <div className="details-specs-sheet">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Item Specifications & Condition
            </h2>

            {listing.category === 'CAR' && listing.carSpecs && (
              <>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Transmission</span>
                  <span className="spec-sheet-value">{listing.carSpecs.transmission}</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Fuel Type</span>
                  <span className="spec-sheet-value">{listing.carSpecs.fuel}</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Seating Capacity</span>
                  <span className="spec-sheet-value">{listing.carSpecs.seats} Adults</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Daily Kilometer Limit</span>
                  <span className="spec-sheet-value">{listing.carSpecs.kmLimitDaily} km / day</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Extra KM Charge</span>
                  <span className="spec-sheet-value">₹{listing.carSpecs.extraKmRate} / km</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">RTO Registration</span>
                  <span className="spec-sheet-value" style={{ fontFamily: 'var(--font-mono)' }}>{listing.carSpecs.regNumber} (Commercial Permit)</span>
                </div>
              </>
            )}

            {(listing.category === 'ROOM_ESSENTIAL' || listing.category === 'ELECTRONICS') && (
              <>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Condition</span>
                  <span className="spec-sheet-value">{listing.condition || 'Sanitized & Fully Serviced'}</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Rental Tenure</span>
                  <span className="spec-sheet-value">Flexible (Days or Full Semester)</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Maintenance</span>
                  <span className="spec-sheet-value">Free Seasonal Servicing & Replacement</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Move-In Delivery</span>
                  <span className="spec-sheet-value">Direct to PG Room or Campus Gate</span>
                </div>
              </>
            )}

            {listing.mode === 'BUY_USED' && listing.resaleSpecs && (
              <>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Original Retail MRP</span>
                  <span className="spec-sheet-value">₹{listing.resaleSpecs.originalPrice.toLocaleString()}</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Condition Note</span>
                  <span className="spec-sheet-value">{listing.condition || 'Tested by campus ambassador'}</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Defects Disclosure</span>
                  <span className="spec-sheet-value" style={{ color: 'var(--accent-amber)' }}>{listing.resaleSpecs.knownDefects}</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Assisted Handover Fee</span>
                  <span className="spec-sheet-value">₹{listing.resaleSpecs.assistedFee} (Optional Escrow)</span>
                </div>
              </>
            )}

            {listing.mode === 'MAKER' && listing.makerSpecs && (
              <>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Production Lead Time</span>
                  <span className="spec-sheet-value">{listing.makerSpecs.leadDays} Days to Craft</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Materials</span>
                  <span className="spec-sheet-value">{listing.makerSpecs.materials}</span>
                </div>
                <div className="spec-sheet-row">
                  <span className="spec-sheet-label">Custom Engraving</span>
                  <span className="spec-sheet-value">{listing.makerSpecs.customizable ? 'Available (Free for Students)' : 'Standard Edition'}</span>
                </div>
              </>
            )}
          </div>

          {/* Verified Host / Seller Profile Card */}
          {listing.operator && (
            <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-full)', background: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    {listing.operator.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{listing.operator.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Verified Commercial Fleet Partner</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--surface-secondary)', padding: '3px 8px', borderRadius: 'var(--radius-xs)', fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                  <Star size={12} fill="#f59e0b" />
                  <span>{listing.operator.rating} ({listing.operator.tripsCompleted} trips)</span>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                <ShieldCheck size={14} />
                <span>Commercial Self-Drive RTO Permit Verified · Comprehensive Insurance Active</span>
              </div>
            </div>
          )}

          {/* Safe Handover Location Card */}
          <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} color="var(--accent-blue)" />
              <span>Safe Handover Location</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Pickup or delivery is coordinated at <strong>{listing.location}</strong> ({listing.distanceKm} km from {selectedLocality.name}). For students, delivery reaches <strong>{selectedLocality.safeHandoverSpot}</strong>.
            </p>
          </div>
        </div>

        {/* Right Column: Pricing & Quote Breakdown */}
        <div className="details-content-column">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="brand-badge">{listing.category}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{listing.distanceKm} km from {selectedLocality.name.split('(')[0]}</span>
            </div>
            <h1 className="details-title">{listing.title}</h1>
          </div>

          {/* Student Perk Banner */}
          {listing.studentPerk && (
            <div style={{ background: 'var(--accent-blue-subtle)', border: '1px solid rgba(0, 113, 227, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <Sparkles size={18} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-blue)' }}>Campus Privilege Unlocked</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{listing.studentPerk}</div>
              </div>
            </div>
          )}

          {/* Duration Selector for Rentals */}
          {(listing.category === 'CAR' || listing.category === 'ROOM_ESSENTIAL' || listing.category === 'ELECTRONICS') && (
            <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
                Rental Duration ({listing.category === 'ROOM_ESSENTIAL' ? 'Months' : 'Days'})
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                {(listing.category === 'ROOM_ESSENTIAL' ? [1, 2, 3, 6] : [1, 2, 3, 5]).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setRentalDuration(d)}
                    style={{
                      background: rentalDuration === d ? 'var(--accent-emerald-subtle)' : 'var(--surface-secondary)',
                      border: `1px solid ${rentalDuration === d ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                      color: rentalDuration === d ? 'var(--accent-emerald)' : 'var(--text-primary)',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.825rem'
                    }}
                  >
                    {d} {listing.category === 'ROOM_ESSENTIAL' ? (d === 1 ? 'Month' : 'Months') : (d === 1 ? 'Day' : 'Days')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vertical-Specific Price Breakdown Card */}
          <PriceBreakdown
            listing={listing}
            rentalDuration={rentalDuration}
            includeDelivery={includeDelivery}
            isStudentVerified={isStudentVerified}
          />

          {/* Interactive Delivery Option Selector */}
          <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <input
                  type="checkbox"
                  checked={includeDelivery}
                  onChange={() => setIncludeDelivery(!includeDelivery)}
                  style={{ accentColor: 'var(--accent-emerald)', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    Campus Gate / Doorstep Delivery
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Direct to {selectedLocality.safeHandoverSpot}
                  </span>
                </div>
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: includeDelivery ? 'var(--accent-emerald)' : 'var(--text-tertiary)' }}>
                {includeDelivery ? '+₹250' : 'Free Self-Pickup'}
              </span>
            </label>
          </div>

          {/* Main Action CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Button
              variant={listing.mode === 'BUY_USED' ? 'accent' : 'primary'}
              size="lg"
              fullWidth
              onClick={() => onStartBooking(listing)}
            >
              {renderCtaLabel()}
            </Button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              <AlertCircle size={14} />
              <span>
                {listing.category === 'CAR' ? '15-Minute Operator Availability Confirmation Lock' : 'Instant In-Browser Demo Handover'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
