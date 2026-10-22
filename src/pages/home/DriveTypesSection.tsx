import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface DriveTypesSectionProps {
  onSelectCategory: (cat: 'ALL' | 'RENT' | 'ROOM_ESSENTIAL' | 'BUY_USED' | 'MAKER') => void;
  onSearchChange: (q: string) => void;
}

const DRIVE_TYPES = [
  {
    id: 'city',
    icon: '⚡',
    title: 'City Errands',
    desc: 'Agile hatchbacks with high mileage for quick market runs and campus commutes.',
    badge: 'Hatchbacks · 250 km/day',
    target: 'Swift'
  },
  {
    id: 'weekend',
    icon: '🛣️',
    title: 'Weekend Trips',
    desc: 'Comfortable compact SUVs with generous boot space for Kasauli, Shimla, or Delhi.',
    badge: 'SUVs · Highway Comfort',
    target: 'Creta'
  },
  {
    id: 'family',
    icon: '👨‍👩‍👧‍👦',
    title: 'Family Outings',
    desc: 'Spacious 7-seater vehicles with rear AC vents for group airport drops and family trips.',
    badge: '7-Seaters · MUVs',
    target: 'Ertiga'
  },
  {
    id: 'hills',
    icon: '🏔️',
    title: 'Hills & 4x4',
    desc: 'High-clearance 4x4 hardtops with commercial permits verified for Kasol & Spiti.',
    badge: '4x4 Hardtop · Kasol Ready',
    target: 'Thar'
  },
  {
    id: 'monthly',
    icon: '📅',
    title: 'Monthly Rentals',
    desc: 'Semester and monthly packages with dedicated routine servicing and reduced daily pricing.',
    badge: 'Long-Term · Flat Escrow',
    target: 'City'
  }
];

export const DriveTypesSection: React.FC<DriveTypesSectionProps> = ({
  onSelectCategory,
  onSearchChange
}) => {
  const handleDriveTypeSelect = (targetModel: string) => {
    onSelectCategory('RENT');
    onSearchChange(targetModel);
    const el = document.getElementById('section-cars');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="kind-of-drive-section" aria-labelledby="kind-of-drive-heading">
      <div className="section-headline-group">
        <div className="section-micro-badge">
          <Sparkles size={13} />
          <span>Curated Collections</span>
        </div>
        <h2 id="kind-of-drive-heading" className="section-main-heading">
          Find your kind of drive
        </h2>
        <p className="section-sub-copy">
          Tailored vehicle recommendations with verified permits and included kilometer limits for every journey.
        </p>
      </div>

      <div className="drive-tiles-grid">
        {DRIVE_TYPES.map(tile => (
          <article
            key={tile.id}
            className="drive-tile-card"
            onClick={() => handleDriveTypeSelect(tile.target)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDriveTypeSelect(tile.target);
              }
            }}
            aria-label={`Explore ${tile.title}`}
          >
            <div>
              <div className="drive-tile-icon-box">{tile.icon}</div>
              <h3 className="drive-tile-title">{tile.title}</h3>
              <p className="drive-tile-desc">{tile.desc}</p>
            </div>
            <div className="drive-tile-footer">
              <span>{tile.badge}</span>
              <ArrowRight size={14} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
