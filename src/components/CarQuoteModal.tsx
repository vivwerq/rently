import React, { useState } from 'react';
import type { ListingItem } from '../data/mockData';
import { ShieldCheck, Car, MapPin, AlertCircle, Clock } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface CarQuoteModalProps {
  listing: ListingItem;
  onClose: () => void;
  onStartInspection: (bookingData: any) => void;
}

export const CarQuoteModal: React.FC<CarQuoteModalProps> = ({ listing, onClose, onStartInspection }) => {
  const [rentalDays, setRentalDays] = useState(2);
  const [deliveryType, setDeliveryType] = useState<'SELF_PICKUP' | 'DOORSTEP'>('SELF_PICKUP');
  const [studentDiscountApplied, setStudentDiscountApplied] = useState(true);
  const [bookingStep, setBookingStep] = useState<'QUOTE' | 'REQUESTED'>('QUOTE');

  const basePricePerDay = listing.price;
  const baseRentTotal = basePricePerDay * rentalDays;
  const deliveryFee = deliveryType === 'DOORSTEP' ? 250 : 0;
  const subtotalBeforeTax = baseRentTotal + deliveryFee;
  const gstAmount = Math.round(subtotalBeforeTax * 0.18);
  const securityDeposit = studentDiscountApplied ? Math.round(listing.deposit * 0.8) : listing.deposit;
  const totalPayableNow = subtotalBeforeTax + gstAmount + securityDeposit;
  
  const dailyKm = listing.carSpecs?.kmLimitDaily || 250;
  const totalIncludedKm = dailyKm * rentalDays + (studentDiscountApplied ? 50 : 0);

  const handleRequestBooking = () => {
    setBookingStep('REQUESTED');
  };

  const handleSimulateOperatorApproval = () => {
    onStartInspection({
      listingId: listing.id,
      title: listing.title,
      rentalDays,
      totalPayableNow,
      securityDeposit,
      regNumber: listing.carSpecs?.regNumber || 'PB65-AX-7821',
      operatorName: listing.operator?.name || 'Local Operator',
      handoverLocation: deliveryType === 'DOORSTEP' ? 'Your Campus / PG Gate' : listing.location
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={bookingStep === 'QUOTE' ? 'Exact All-in Quote & Booking' : 'Operator Confirmation in Progress'}
      maxWidth="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {bookingStep === 'QUOTE' ? (
          <>
            {/* Vehicle Title & Vetting Badge */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Car size={20} color="var(--accent-emerald)" />
                <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>
                  {listing.title}
                </h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="var(--accent-emerald)" /> {listing.location}
                </span>
                <Badge variant="success" icon={<ShieldCheck size={12} />}>
                  {listing.carSpecs?.regNumber} · Verified Commercial Permit
                </Badge>
              </div>
            </div>

            {/* Rental Duration Selector */}
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
                Select Rental Duration
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {[1, 2, 3, 5].map((days) => {
                  const isSelected = rentalDays === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setRentalDays(days)}
                      style={{
                        background: isSelected ? 'var(--accent-emerald-subtle)' : 'var(--surface-secondary)',
                        border: `1px solid ${isSelected ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                        color: isSelected ? 'var(--accent-emerald)' : 'var(--text-primary)',
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Handover Preference */}
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
                Pickup or Campus Delivery
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <button
                  type="button"
                  style={{
                    background: deliveryType === 'SELF_PICKUP' ? 'var(--accent-emerald-subtle)' : 'var(--surface-secondary)',
                    border: `1px solid ${deliveryType === 'SELF_PICKUP' ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                    color: 'var(--text-primary)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                  onClick={() => setDeliveryType('SELF_PICKUP')}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Self-Pickup (Free)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Collect at verified operator hub
                  </div>
                </button>

                <button
                  type="button"
                  style={{
                    background: deliveryType === 'DOORSTEP' ? 'var(--accent-emerald-subtle)' : 'var(--surface-secondary)',
                    border: `1px solid ${deliveryType === 'DOORSTEP' ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                    color: 'var(--text-primary)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                  onClick={() => setDeliveryType('DOORSTEP')}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Campus Drop</span>
                    <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>+₹250</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Direct to CU / PU / CGC gate
                  </div>
                </button>
              </div>
            </div>

            {/* Student Perk Toggle */}
            <div
              style={{
                background: 'var(--accent-blue-subtle)',
                border: '1px solid rgba(0, 113, 227, 0.2)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => setStudentDiscountApplied(!studentDiscountApplied)}
            >
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                  🎓 College Student Benefits Applied
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  20% deposit reduction + 50 km bonus for CU/PU/CGC students
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={studentDiscountApplied} 
                onChange={() => {}} 
                style={{ accentColor: 'var(--accent-blue)', width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* All-in Itemized Quote */}
            <div className="quote-breakdown-box" style={{ background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                Itemized Price Breakdown (Zero Hidden Charges)
              </div>
              <div className="quote-line-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>Base Rent ({rentalDays} Days @ ₹{basePricePerDay}/day)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{baseRentTotal.toLocaleString()}</span>
              </div>
              <div className="quote-line-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>Kilometre Allowance Included</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>{totalIncludedKm} km (Extra: ₹{listing.carSpecs?.extraKmRate}/km)</span>
              </div>
              {deliveryType === 'DOORSTEP' && (
                <div className="quote-line-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>Doorstep PG/Campus Drop</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹250</span>
                </div>
              )}
              <div className="quote-line-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>GST on Rental Service (18%)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{gstAmount}</span>
              </div>
              <div className="quote-line-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>Refundable Security Deposit (Escrow)</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>₹{securityDeposit.toLocaleString()}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border-standard)', margin: '0.5rem 0' }} />
              <div className="quote-line-item total" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                <span>Total Payable Now</span>
                <span style={{ color: 'var(--accent-emerald)' }}>₹{totalPayableNow.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-tertiary)', background: 'var(--surface-secondary)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-amber)' }} />
              <span>
                Deposit is strictly held in platform escrow. Undisputed refunds are initiated within 24 hours of documented vehicle return.
              </span>
            </div>

            {/* Action Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleRequestBooking}
            >
              Request Booking (15-Min Operator Confirmation)
            </Button>
          </>
        ) : (
          /* Request Confirmation & Handover Simulation */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-emerald-subtle)', display: 'grid', placeItems: 'center', margin: '0 auto', color: 'var(--accent-emerald)' }}>
              <Clock size={32} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 800, margin: 0 }}>
                Operator Confirmation Countdown
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                {listing.operator?.name} has been notified and must confirm availability within 15 minutes.
              </p>
            </div>

            <div style={{ background: 'var(--surface-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Confirmation Deadline Window</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.25rem 0' }}>
                14:38
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Your payment method is authorized; no charges will be settled if operator declines.
              </div>
            </div>

            {/* Test simulator badge */}
            <div style={{ background: 'var(--surface-secondary)', border: '1px dashed var(--border-focus)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'left' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--border-focus)', marginBottom: '0.35rem' }}>
                ⚡ Local Prototype Demo Simulation
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Simulate the operator instantly accepting the booking in local browser session to test the joint 6-point inspection and OTP handover flow.
              </p>
              <Button 
                variant="primary" 
                fullWidth
                onClick={handleSimulateOperatorApproval}
              >
                Simulate Operator Accepted → Start Pickup Inspection
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
