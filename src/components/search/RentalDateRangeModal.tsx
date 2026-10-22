import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar as CalendarIcon, Info, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import './rentalSearch.css';

export interface RentalDateRange {
  deliveryDate: Date | null;
  pickupDate: Date | null;
  days: number;
}

interface RentalDateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDates?: RentalDateRange;
  onApplyDates: (dates: RentalDateRange) => void;
  initialFocus?: 'delivery' | 'pickup';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const RentalDateRangeModal: React.FC<RentalDateRangeModalProps> = ({
  isOpen,
  onClose,
  initialDates,
  onApplyDates,
  initialFocus = 'delivery'
}) => {
  // Calendar View Month Navigation (year and month for the first calendar pane)
  const [viewDate, setViewDate] = useState(() => {
    if (initialDates?.deliveryDate) {
      return new Date(initialDates.deliveryDate.getFullYear(), initialDates.deliveryDate.getMonth(), 1);
    }
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [deliveryDate, setDeliveryDate] = useState<Date | null>(() => initialDates?.deliveryDate || null);
  const [pickupDate, setPickupDate] = useState<Date | null>(() => initialDates?.pickupDate || null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [activeInput, setActiveInput] = useState<'delivery' | 'pickup'>(initialFocus);

  // Sync when reopened or initialDates changes
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (initialDates?.deliveryDate) {
        setDeliveryDate(initialDates.deliveryDate);
        setPickupDate(initialDates.pickupDate || null);
        setViewDate(new Date(initialDates.deliveryDate.getFullYear(), initialDates.deliveryDate.getMonth(), 1));
      }
      setActiveInput(initialFocus);
    }
  }

  // Lock body scroll and Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Normalize date to midnight for comparison
  const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const [todayNormalized] = useState(() => normalizeDate(new Date()));

  // Compute calculated rental duration
  const rentalDays = useMemo(() => {
    if (!deliveryDate || !pickupDate) return 0;
    const t1 = normalizeDate(deliveryDate).getTime();
    const t2 = normalizeDate(pickupDate).getTime();
    const diff = Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [deliveryDate, pickupDate]);

  // Handlers for month navigation
  const prevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Month 2 is viewDate + 1 month
  const viewDateMonth2 = useMemo(() => {
    return new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  }, [viewDate]);

  // Generate calendar grid for a given year & month
  const getDaysForMonth = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Leading padding days from previous month
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }

    // Days in current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Trailing days to fill 5 or 6 rows (multiples of 7)
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false
        });
      }
    }

    return days;
  };

  const month1Days = useMemo(() => getDaysForMonth(viewDate.getFullYear(), viewDate.getMonth()), [viewDate]);
  const month2Days = useMemo(() => getDaysForMonth(viewDateMonth2.getFullYear(), viewDateMonth2.getMonth()), [viewDateMonth2]);

  // Handle clicking a day in the calendar
  const handleDateClick = (date: Date) => {
    const clicked = normalizeDate(date);
    if (clicked.getTime() < todayNormalized.getTime()) return; // Past date disabled

    if (activeInput === 'delivery') {
      setDeliveryDate(clicked);
      // If pickup already exists and is before clicked, reset pickup
      if (pickupDate && clicked.getTime() > pickupDate.getTime()) {
        setPickupDate(null);
      }
      setActiveInput('pickup');
    } else {
      // User is selecting pickup date
      if (!deliveryDate) {
        setDeliveryDate(clicked);
        setActiveInput('pickup');
      } else if (clicked.getTime() < deliveryDate.getTime()) {
        // Clicked date is earlier than delivery date -> reset delivery date to this
        setDeliveryDate(clicked);
        setActiveInput('pickup');
      } else {
        // Valid pickup date
        setPickupDate(clicked);
      }
    }
  };

  const formatDateDisplay = (d: Date | null) => {
    if (!d) return null;
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
  };

  const formatShortDate = (d: Date | null) => {
    if (!d) return '--';
    return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
  };

  const handleApply = () => {
    if (!deliveryDate) return;
    const finalPickup = pickupDate || deliveryDate;
    const diff = Math.max(1, Math.round((normalizeDate(finalPickup).getTime() - normalizeDate(deliveryDate).getTime()) / (1000 * 60 * 60 * 24)));

    onApplyDates({
      deliveryDate,
      pickupDate: finalPickup,
      days: diff
    });
    onClose();
  };

  if (!isOpen) return null;

  // Render calendar month view
  const renderCalendarMonth = (year: number, month: number, days: { date: Date; isCurrentMonth: boolean }[], showNavLeft = false, showNavRight = false) => {
    return (
      <div className="dual-calendar-pane">
        {/* Month Header */}
        <div className="dual-calendar-header">
          {showNavLeft ? (
            <button
              type="button"
              className="calendar-nav-arrow"
              onClick={prevMonth}
              aria-label="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <span className="calendar-nav-spacer" />
          )}

          <div className="calendar-month-title">
            {MONTH_NAMES[month]} {year}
          </div>

          {showNavRight ? (
            <button
              type="button"
              className="calendar-nav-arrow"
              onClick={nextMonth}
              aria-label="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          ) : (
            <span className="calendar-nav-spacer" />
          )}
        </div>

        {/* Weekday headers */}
        <div className="calendar-weekdays-row">
          {WEEKDAY_NAMES.map(name => (
            <div key={name} className="calendar-weekday-cell">
              {name}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="calendar-days-grid">
          {days.map(({ date, isCurrentMonth }, idx) => {
            const normalized = normalizeDate(date);
            const time = normalized.getTime();
            const isPast = time < todayNormalized.getTime();
            const isDelivery = deliveryDate && time === deliveryDate.getTime();
            const isPickup = pickupDate && time === pickupDate.getTime();

            // Range checks
            const effectiveEnd = pickupDate ? pickupDate.getTime() : (hoverDate && activeInput === 'pickup' && deliveryDate && hoverDate.getTime() >= deliveryDate.getTime() ? hoverDate.getTime() : null);
            const isInRange = deliveryDate && effectiveEnd && time > deliveryDate.getTime() && time < effectiveEnd;

            return (
              <button
                key={idx}
                type="button"
                disabled={isPast || !isCurrentMonth}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
                className={`calendar-day-btn 
                  ${!isCurrentMonth ? 'other-month' : ''} 
                  ${isPast ? 'disabled-past' : ''} 
                  ${isDelivery ? 'selected-start' : ''} 
                  ${isPickup ? 'selected-end' : ''} 
                  ${isInRange ? 'in-range' : ''}
                `}
              >
                <span className="day-number">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="date-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="date-range-modal-title"
    >
      <div
        className="date-modal-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="date-modal-top-bar">
          <h2 id="date-range-modal-title" className="date-modal-title">
            Select your Dates
          </h2>
          <button
            type="button"
            className="date-modal-close-icon"
            onClick={onClose}
            aria-label="Close Date Range Selector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Two-Column Layout */}
        <div className="date-modal-body">
          {/* LEFT COLUMN: Inputs, Info, Period Card, Promo, CTA */}
          <div className="date-modal-left-col">
            {/* Delivery Date & Pickup Date Inputs Side-by-Side */}
            <div className="date-input-boxes-row">
              {/* Delivery Date Input */}
              <div className="date-input-field-group">
                <label className="date-field-label">
                  Delivery Date <span className="required-star">*</span>
                </label>
                <button
                  type="button"
                  className={`date-field-box ${activeInput === 'delivery' ? 'active-focus' : ''}`}
                  onClick={() => setActiveInput('delivery')}
                >
                  <CalendarIcon size={16} className="date-field-icon" />
                  <span className={deliveryDate ? 'date-field-value filled' : 'date-field-value placeholder'}>
                    {deliveryDate ? formatDateDisplay(deliveryDate) : 'Select delivery date'}
                  </span>
                </button>
              </div>

              {/* Pickup Date Input */}
              <div className="date-input-field-group">
                <label className="date-field-label">
                  Pickup Date <span className="required-star">*</span>
                </label>
                <button
                  type="button"
                  className={`date-field-box ${activeInput === 'pickup' ? 'active-focus' : ''}`}
                  onClick={() => setActiveInput('pickup')}
                >
                  <CalendarIcon size={16} className="date-field-icon" />
                  <span className={pickupDate ? 'date-field-value filled' : 'date-field-value placeholder'}>
                    {pickupDate ? formatDateDisplay(pickupDate) : 'Select pickup date'}
                  </span>
                </button>
              </div>
            </div>

            {/* Same-day delivery notification banner */}
            <div className="delivery-time-info-banner">
              <Info size={18} className="info-icon" />
              <div className="info-text">
                <strong>Same-day delivery</strong> between <strong>5PM and 11PM</strong>. For future dates, you can select a specific time slot available at checkout. We pickup between <strong>9AM to 1PM</strong>.
              </div>
            </div>

            {/* Rental Period Card */}
            <div className="rental-period-card">
              <div className="period-card-header">Your Rental Period:</div>
              <div className="period-card-content">
                <div className="period-day-badge">
                  <span className="day-number">{rentalDays < 10 ? `0${rentalDays}` : rentalDays}</span>
                  <span className="day-unit">{rentalDays === 1 ? 'Day' : 'Days'}</span>
                </div>
                <div className="period-dates-summary">
                  <span className="chargeable-label">Chargeable Period:</span>
                  <div className="chargeable-dates">
                    <CalendarIcon size={14} className="cal-icon" />
                    <span>
                      {deliveryDate && pickupDate
                        ? `${formatShortDate(deliveryDate)} – ${formatShortDate(pickupDate)}, ${deliveryDate.getFullYear()}`
                        : '--'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save More With Us Promo Banner */}
            <div className="savings-promo-card">
              <div className="savings-badge">
                <Tag size={14} className="tag-icon" />
                <span>Save more with us!</span>
              </div>
              <p className="savings-desc">
                Longer rental periods mean bigger savings—enjoy discounts of up to 12%. We don't charge you for delivery and pickup days!
              </p>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              className={`continue-btn ${deliveryDate && pickupDate ? 'enabled' : 'disabled'}`}
              disabled={!deliveryDate}
              onClick={handleApply}
            >
              Continue
            </button>
          </div>

          {/* RIGHT COLUMN: Two-Month Calendar */}
          <div className="date-modal-right-col">
            <div className="dual-calendars-wrapper">
              {renderCalendarMonth(
                viewDate.getFullYear(),
                viewDate.getMonth(),
                month1Days,
                true,
                false
              )}
              {renderCalendarMonth(
                viewDateMonth2.getFullYear(),
                viewDateMonth2.getMonth(),
                month2Days,
                false,
                true
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
