import React, { useState } from 'react';
import type { ListingItem } from '../../data/mockData';
import { ShieldCheck, MapPin, CheckCircle2, Armchair, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { apiClient } from '../../services/apiClient';

interface EquipmentRentalModalProps {
  listing: ListingItem;
  onClose: () => void;
  onConfirmRental: (bookingData: any) => void;
}

export const EquipmentRentalModal: React.FC<EquipmentRentalModalProps> = ({
  listing,
  onClose,
  onConfirmRental
}) => {
  const isMonthly = listing.priceUnit.includes('month');
  const [tenure, setTenure] = useState(isMonthly ? 3 : 2);
  const [deliveryType, setDeliveryType] = useState<'CAMPUS_GATE' | 'PG_DOORSTEP'>('CAMPUS_GATE');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [studentDiscountApplied, setStudentDiscountApplied] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string | null>(null);

  const baseRate = listing.price;
  const totalRent = baseRate * tenure;
  const deliveryFee = deliveryType === 'PG_DOORSTEP' ? 250 : 0;
  const deposit = studentDiscountApplied ? Math.round(listing.deposit * 0.5) : listing.deposit;
  const totalPayable = totalRent + deliveryFee + deposit;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLocking(true);
    setHoldError(null);

    const now = new Date();
    const startDate = now.toISOString();
    const durationDays = isMonthly ? tenure * 30 : tenure;
    const endDate = new Date(now.getTime() + durationDays * 86400000).toISOString();

    // 1. Acquire Atomic 15-min Lock
    const holdRes = await apiClient.acquireHold(listing.id, startDate, endDate);
    if ('error' in holdRes && holdRes.error) {
      setIsLocking(false);
      setHoldError(holdRes.error);
      return;
    }

    const holdId = 'holdId' in holdRes ? holdRes.holdId : undefined;

    // 2. Initialize Order with Razorpay Backend
    const orderRes = await apiClient.createPaymentOrder({
      listingId: listing.id,
      holdId,
      tenure,
      deliveryType,
      studentDiscountApplied
    });

    if ('error' in orderRes && orderRes.error) {
      setIsLocking(false);
      setHoldError(orderRes.error);
      return;
    }

    if ('orderId' in orderRes) {
      const { launchRazorpayCheckout } = await import('../../utils/razorpay');
      await launchRazorpayCheckout({
        keyId: orderRes.keyId,
        orderId: orderRes.orderId,
        amount: orderRes.amount,
        name: 'Rently Tri-City',
        description: `${listing.title} (${tenure} ${isMonthly ? 'Mo' : 'Days'}) + Escrow Deposit`,
        isMock: orderRes.isMock,
        onSuccess: async (rzpResponse) => {
          // 3. Verify Payment Signature & Double-Entry Escrow
          const verifyRes = await apiClient.verifyPayment({
            razorpay_order_id: rzpResponse.razorpay_order_id,
            razorpay_payment_id: rzpResponse.razorpay_payment_id,
            razorpay_signature: rzpResponse.razorpay_signature,
            listingId: listing.id,
            holdId,
            renterName: 'Rohan Sharma',
            renterPhone: '9876543210',
            handoverLocation: deliveryAddress || listing.location,
            tenure,
            deliveryType,
            studentDiscountApplied
          });

          setIsLocking(false);

          if ('error' in verifyRes && verifyRes.error) {
            setHoldError(verifyRes.error);
            return;
          }

          setConfirmedPaymentId(rzpResponse.razorpay_payment_id);
          setIsConfirmed(true);

          setTimeout(() => {
            onConfirmRental({
              listingId: listing.id,
              holdId,
              title: listing.title,
              category: listing.category,
              durationMonths: isMonthly ? tenure : undefined,
              totalAmount: orderRes.breakdown.totalPayable,
              deposit: orderRes.breakdown.securityDeposit,
              deliveryAddress: deliveryAddress || listing.location,
              deliveryType,
              paymentId: rzpResponse.razorpay_payment_id,
              paymentStatus: 'ESCROW_HELD'
            });
          }, 1200);
        },
        onError: (errMsg) => {
          setIsLocking(false);
          setHoldError(errMsg);
        },
        onDismiss: () => {
          setIsLocking(false);
        }
      });
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isConfirmed ? 'Rental Reserved Successfully!' : `Rent ${listing.title}`}
      description={isConfirmed ? undefined : 'Flexible tenure, zero-hassle delivery, and protected deposit.'}
      maxWidth="md"
    >
      {!isConfirmed ? (
        <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {holdError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#ef4444',
              fontSize: '0.875rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Availability Conflict:</strong> {holdError}
              </div>
            </div>
          )}

          {/* Header Item Pill */}
          <div style={{ background: 'var(--surface-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Armchair size={22} color="var(--accent-emerald)" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {listing.title}
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={12} color="var(--accent-emerald)" />
                  <span>{listing.location} · {listing.distanceKm} km away</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tenure Picker */}
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
              Select Rental Tenure ({isMonthly ? 'Months' : 'Days'})
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {(isMonthly ? [1, 2, 3, 6] : [1, 2, 3, 5]).map((qty) => {
                const isSelected = tenure === qty;
                return (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setTenure(qty)}
                    style={{
                      background: isSelected ? 'var(--accent-emerald-subtle)' : 'var(--surface-secondary)',
                      border: `1px solid ${isSelected ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                      color: isSelected ? 'var(--accent-emerald)' : 'var(--text-primary)',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {qty} {isMonthly ? (qty === 1 ? 'Month' : 'Months') : (qty === 1 ? 'Day' : 'Days')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Gate / Room Address */}
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
              Delivery Destination
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <button
                type="button"
                style={{
                  background: deliveryType === 'CAMPUS_GATE' ? 'var(--accent-emerald-subtle)' : 'var(--surface-secondary)',
                  border: `1px solid ${deliveryType === 'CAMPUS_GATE' ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onClick={() => setDeliveryType('CAMPUS_GATE')}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Campus Gate (Free)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  CU Gate 2 / PU Stu-C / CGC Gate 1
                </div>
              </button>

              <button
                type="button"
                style={{
                  background: deliveryType === 'PG_DOORSTEP' ? 'var(--accent-emerald-subtle)' : 'var(--surface-secondary)',
                  border: `1px solid ${deliveryType === 'PG_DOORSTEP' ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onClick={() => setDeliveryType('PG_DOORSTEP')}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Doorstep / PG</span>
                  <span style={{ color: 'var(--accent-emerald)' }}>+₹250</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Direct to room with setup
                </div>
              </button>
            </div>

            <Input
              placeholder={deliveryType === 'CAMPUS_GATE' ? 'Campus gate meetup details (e.g. Hostels Block D)' : 'Full PG / Flat address in Kharar or Mohali'}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          {/* Student Deposit Waiver Toggle */}
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
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} /> Student Deposit Waiver Applied
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                50% reduced refundable security deposit with college roll number
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={studentDiscountApplied} 
              onChange={() => {}} 
              style={{ accentColor: 'var(--accent-blue)', width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          {/* Itemized Cost Summary */}
          <div style={{ background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              <span>Rent for {tenure} {isMonthly ? (tenure === 1 ? 'month' : 'months') : (tenure === 1 ? 'day' : 'days')}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{totalRent.toLocaleString()}</span>
            </div>
            {deliveryType === 'PG_DOORSTEP' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                <span>Move-in Doorstep Delivery</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹250</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <span>Refundable Deposit (Escrow)</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>₹{deposit.toLocaleString()}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border-standard)', margin: '0.4rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              <span>Total Payable Now</span>
              <span style={{ color: 'var(--accent-emerald)' }}>₹{totalPayable.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" />
            <span>Sanitized before dispatch · Deposit refunded within 2 hours of post-semester return</span>
          </div>

          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            type="submit" 
            disabled={isLocking}
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)' }}
          >
            {isLocking ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <Loader2 size={18} className="animate-spin" /> Launching Razorpay Escrow...
              </span>
            ) : (
              `Pay & Reserve with Razorpay (₹${totalPayable.toLocaleString()})`
            )}
          </Button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-emerald-subtle)', display: 'grid', placeItems: 'center', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 800, margin: 0 }}>
              Payment Verified & Escrow Held!
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Your reservation for <strong>{listing.title}</strong> is confirmed. Scheduled for delivery/handover at {deliveryAddress || listing.location}.
            </p>
            {confirmedPaymentId && (
              <div style={{ background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', border: '1px solid var(--border-subtle)', marginTop: '0.85rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                Razorpay Payment: {confirmedPaymentId} · Escrow Trust Active
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
