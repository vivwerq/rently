import React, { useState } from 'react';
import type { ListingItem } from '../../data/mockData';
import { Palette, Clock, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface MakerOrderModalProps {
  listing: ListingItem;
  onClose: () => void;
  onConfirmOrder: (orderData: any) => void;
}

export const MakerOrderModal: React.FC<MakerOrderModalProps> = ({
  listing,
  onClose,
  onConfirmOrder
}) => {
  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const unitPrice = listing.price;
  const totalPrice = unitPrice * quantity;
  const leadDays = listing.makerSpecs?.leadDays || 2;
  const advanceDeposit = listing.deposit || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onConfirmOrder({
        listingId: listing.id,
        title: listing.title,
        category: 'MAKER',
        quantity,
        customText,
        totalPrice,
        advanceDeposit,
        deliveryAddress,
        buyerContact: buyerPhone,
        leadDays
      });
    }, 1200);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isSuccess ? 'Craft Order Placed!' : `Order ${listing.title}`}
      description={isSuccess ? undefined : 'Custom made-to-order by local Tri-City artisans.'}
      maxWidth="md"
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Item summary */}
          <div style={{ background: 'var(--surface-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Palette size={20} color="#9333ea" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {listing.title}
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={12} color="var(--accent-amber)" />
                  <span>Ready in {leadDays} {leadDays === 1 ? 'day' : 'days'} · ₹{unitPrice.toLocaleString()} {listing.priceUnit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Engraving Input */}
          {listing.makerSpecs?.customizable && (
            <div>
              <Input
                label="Personalized Engraving / Custom Initials"
                placeholder="e.g. 'A. Sharma · CU 2026' or initials"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                helperText="Artisan will laser-engrave this text onto the natural wood/ceramic"
                prefixElement={<Sparkles size={14} color="#9333ea" />}
              />
            </div>
          )}

          {/* Quantity Selector & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Quantity
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-secondary)', border: '1px solid var(--border-standard)', borderRadius: 'var(--radius-md)', padding: '0.25rem 0.5rem', height: '42px' }}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.1rem', cursor: 'pointer', padding: '0 0.5rem' }}
                >
                  -
                </button>
                <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.1rem', cursor: 'pointer', padding: '0 0.5rem' }}
                >
                  +
                </button>
              </div>
            </div>

            <Input
              label="Contact Phone"
              type="tel"
              required
              placeholder="e.g. 98765 43210"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
            />
          </div>

          {/* Delivery Address */}
          <div>
            <Input
              label="Campus Gate / Delivery Flat Address"
              required
              placeholder="e.g. CU Gate 2 or Sector 70 Studio Pickup"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              helperText="Artisan delivers directly or ships via local courier"
            />
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              <span>Items ({quantity}x @ ₹{unitPrice})</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{totalPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              <span>Laser Customization</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>Free (Campus Special)</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border-standard)', margin: '0.4rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              <span>Total Order Value</span>
              <span style={{ color: '#9333ea' }}>₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" />
            <span>Direct artisan payment. Updates sent via SMS/WhatsApp when production starts.</span>
          </div>

          <Button variant="primary" size="lg" fullWidth type="submit">
            Place Custom Maker Order
          </Button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.15)', display: 'grid', placeItems: 'center', color: '#9333ea' }}>
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 800, margin: 0 }}>
              Custom Craft Queued!
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              The artisan has received your order for {quantity}x <strong>{listing.title}</strong>
              {customText ? ` with custom engraving: "${customText}"` : ''}. Estimated completion in {leadDays} days.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};
