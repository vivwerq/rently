import React from 'react';
import { MapPin, ChevronDown, Calendar, CalendarPlus } from 'lucide-react';
import type { LocalityOption } from '../../data/mockData';
import type { RentalDateRange } from './RentalDateRangeModal';
import './rentalSearch.css';

interface RentalCapsuleBarProps {
  selectedLocality: LocalityOption;
  onOpenCityModal: () => void;
  rentalDates: RentalDateRange;
  onOpenDateModal: (focus?: 'delivery' | 'pickup') => void;
  className?: string;
  isCompact?: boolean;
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const RentalCapsuleBar: React.FC<RentalCapsuleBarProps> = ({
  selectedLocality,
  onOpenCityModal,
  rentalDates,
  onOpenDateModal,
  className = '',
  isCompact = false
}) => {
  // Format locality label: e.g. "Delhi", "Chandigarh", "CU Gharuan"
  const cityDisplayName = React.useMemo(() => {
    if (selectedLocality.cityName) return selectedLocality.cityName;
    return selectedLocality.name.split('(')[0].trim();
  }, [selectedLocality]);

  const deliveryLabel = React.useMemo(() => {
    if (!rentalDates.deliveryDate) return 'Delivery Date';
    return `${MONTH_SHORT[rentalDates.deliveryDate.getMonth()]} ${rentalDates.deliveryDate.getDate()}`;
  }, [rentalDates.deliveryDate]);

  const pickupLabel = React.useMemo(() => {
    if (!rentalDates.pickupDate) return 'Pickup Date';
    return `${MONTH_SHORT[rentalDates.pickupDate.getMonth()]} ${rentalDates.pickupDate.getDate()}`;
  }, [rentalDates.pickupDate]);

  const hasSelectedDates = Boolean(rentalDates.deliveryDate && rentalDates.pickupDate);

  return (
    <div
      className={`rental-capsule-bar ${isCompact ? 'compact' : ''} ${className}`}
      role="region"
      aria-label="Rental search and booking bar"
    >
      {/* 1. Location Trigger Button (📍 Delhi ⌵) */}
      <button
        type="button"
        className="capsule-section capsule-loc-btn"
        onClick={onOpenCityModal}
        aria-label={`Selected city: ${cityDisplayName}. Click to change city.`}
      >
        <MapPin size={17} className="capsule-icon loc-icon" />
        <span className="capsule-city-name">{cityDisplayName}</span>
        <ChevronDown size={14} className="capsule-chevron" />
      </button>

      <span className="capsule-divider" />

      {/* 2. Delivery Date Button (📅 Delivery Date) */}
      <button
        type="button"
        className={`capsule-section capsule-date-btn ${rentalDates.deliveryDate ? 'has-date' : ''}`}
        onClick={() => onOpenDateModal('delivery')}
        aria-label={`Delivery date: ${deliveryLabel}. Click to select dates.`}
      >
        <Calendar size={16} className="capsule-icon date-icon" />
        <span className="capsule-date-text">{deliveryLabel}</span>
      </button>

      {/* 3. Pickup Date Button (📅 Pickup Date) */}
      <button
        type="button"
        className={`capsule-section capsule-date-btn ${rentalDates.pickupDate ? 'has-date' : ''}`}
        onClick={() => onOpenDateModal('pickup')}
        aria-label={`Pickup date: ${pickupLabel}. Click to select dates.`}
      >
        <Calendar size={16} className="capsule-icon date-icon" />
        <span className="capsule-date-text">{pickupLabel}</span>
      </button>

      {/* 4. Action CTA Pill Button (📅+ Select) */}
      <button
        type="button"
        className="capsule-cta-btn"
        onClick={() => onOpenDateModal('delivery')}
        aria-label="Select rental dates"
      >
        <CalendarPlus size={15} className="capsule-cta-icon" />
        <span className="capsule-cta-text">
          {hasSelectedDates ? `${rentalDates.days}D Book` : 'Select'}
        </span>
      </button>
    </div>
  );
};
