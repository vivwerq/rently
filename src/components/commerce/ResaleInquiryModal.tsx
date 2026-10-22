import React, { useState } from 'react';
import type { ListingItem } from '../../data/mockData';
import { Repeat, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ResaleInquiryModalProps {
  listing: ListingItem;
  onClose: () => void;
  onConfirmOffer: (orderData: any) => void;
}

export const ResaleInquiryModal: React.FC<ResaleInquiryModalProps> = ({
  listing,
  onClose,
  onConfirmOffer
}) => {
  const [offerPrice, setOfferPrice] = useState(listing.price.toString());
  const [buyerPhone, setBuyerPhone] = useState('');
  const [handoverMethod, setHandoverMethod] = useState<'CAMPUS_MEETUP' | 'ASSISTED_ESCROW'>('CAMPUS_MEETUP');
  const [selectedSpot, setSelectedSpot] = useState('Campus Security Gate 2');
  const [isSuccess, setIsSuccess] = useState(false);

  const priceNum = Number(offerPrice) || listing.price;
  const assistedFee = handoverMethod === 'ASSISTED_ESCROW' ? (listing.resaleSpecs?.assistedFee || 99) : 0;
  const totalPayable = priceNum + assistedFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onConfirmOffer({
        listingId: listing.id,
        title: listing.title,
        category: 'RESALE',
        pricePaid: totalPayable,
        handoverMethod,
        meetupSpot: selectedSpot,
        buyerContact: buyerPhone
      });
    }, 1200);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isSuccess ? 'Purchase Request Sent!' : `Direct Buy: ${listing.title}`}
      description={isSuccess ? undefined : 'Campus peer-to-peer handover with zero rental deposits.'}
      maxWidth="md"
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Item summary */}
          <div style={{ background: 'var(--surface-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Repeat size={20} color="var(--accent-blue)" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {listing.title}
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Condition: <strong>{listing.condition || 'Tested'}</strong> · Listed at ₹{listing.price.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Offer Price Input */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Your Offer Price (₹)"
              type="number"
              required
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              prefixElement={<span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹</span>}
              helperText={`Original MRP was ₹${listing.resaleSpecs?.originalPrice.toLocaleString() || 'N/A'}`}
            />

            <Input
              label="Your Phone / WhatsApp"
              type="tel"
              required
              placeholder="e.g. 98765 43210"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              helperText="For handover OTP and meetup coordination"
            />
          </div>

          {/* Handover Method Selector */}
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
              Handover & Payment Protection
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <button
                type="button"
                style={{
                  background: handoverMethod === 'CAMPUS_MEETUP' ? 'var(--accent-blue-subtle)' : 'var(--surface-secondary)',
                  border: `1px solid ${handoverMethod === 'CAMPUS_MEETUP' ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onClick={() => setHandoverMethod('CAMPUS_MEETUP')}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Campus Meetup (Free)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Direct hand-to-hand at campus gate
                </div>
              </button>

              <button
                type="button"
                style={{
                  background: handoverMethod === 'ASSISTED_ESCROW' ? 'var(--accent-blue-subtle)' : 'var(--surface-secondary)',
                  border: `1px solid ${handoverMethod === 'ASSISTED_ESCROW' ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onClick={() => setHandoverMethod('ASSISTED_ESCROW')}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Assisted Escrow</span>
                  <span style={{ color: 'var(--accent-blue)' }}>+₹99</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Money held until you test the item
                </div>
              </button>
            </div>
          </div>

          {/* Designated Campus Meetup Spot */}
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Designated Safe Meetup Spot
            </label>
            <div style={{ background: 'var(--surface-secondary)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <MapPin size={16} color="var(--accent-blue)" />
              <input
                type="text"
                value={selectedSpot}
                onChange={(e) => setSelectedSpot(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              <span>Offer Amount</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{priceNum.toLocaleString()}</span>
            </div>
            {handoverMethod === 'ASSISTED_ESCROW' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                <span>Platform Escrow Holding Fee</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{assistedFee}</span>
              </div>
            )}
            <div style={{ height: '1px', background: 'var(--border-standard)', margin: '0.4rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              <span>Total Commitment</span>
              <span style={{ color: 'var(--accent-blue)' }}>₹{totalPayable.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" />
            <span>Pass-it-On Guarantee: Inspect the item at the meetup spot before releasing payment.</span>
          </div>

          <Button variant="accent" size="lg" fullWidth type="submit">
            Send Purchase Request to Seller
          </Button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-blue-subtle)', display: 'grid', placeItems: 'center', color: 'var(--accent-blue)' }}>
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 800, margin: 0 }}>
              Offer Sent to Seller!
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Your offer of ₹{priceNum.toLocaleString()} for <strong>{listing.title}</strong> was dispatched. Meetup point: {selectedSpot}.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};
