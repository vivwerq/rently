import React from 'react';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import type { ListingItem } from '../../data/mockData';

export interface PriceBreakdownProps {
  listing: ListingItem;
  rentalDuration?: number; // days for cars/gear, months for room essentials
  includeDelivery?: boolean;
  isStudentVerified?: boolean;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  listing,
  rentalDuration = 1,
  includeDelivery = true,
  isStudentVerified = true
}) => {
  if (listing.category === 'CAR') {
    const days = rentalDuration;
    const baseRent = listing.price * days;
    const deliveryFee = includeDelivery ? 250 : 0;
    const gst = Math.round((baseRent + deliveryFee) * 0.18);
    const deposit = isStudentVerified ? Math.round(listing.deposit * 0.8) : listing.deposit;
    const total = baseRent + deliveryFee + gst + deposit;
    const dailyKm = listing.carSpecs?.kmLimitDaily || 250;
    const totalKm = dailyKm * days + (isStudentVerified ? 50 : 0);

    return (
      <div className="quote-breakdown-card">
        <h3 className="quote-breakdown-heading">Itemized All-In Price Breakdown</h3>

        <div className="quote-line-item">
          <span>Base Vehicle Rent ({days} {days === 1 ? 'Day' : 'Days'} @ ₹{listing.price.toLocaleString()}/day)</span>
          <span className="quote-line-val">₹{baseRent.toLocaleString()}</span>
        </div>

        <div className="quote-line-item">
          <span>Kilometer Quota Included</span>
          <span className="quote-line-val highlight-green">{totalKm} km (Extra: ₹{listing.carSpecs?.extraKmRate || 12}/km)</span>
        </div>

        <div className="quote-line-item">
          <span>Campus Doorstep Handover</span>
          <span className="quote-line-val">{includeDelivery ? '₹250' : '₹0 (Self-Pickup)'}</span>
        </div>

        <div className="quote-line-item">
          <span>GST on Mobility Service (18%)</span>
          <span className="quote-line-val">₹{gst.toLocaleString()}</span>
        </div>

        <div className="quote-line-item">
          <span>
            Refundable Security Deposit (Escrow)
            {isStudentVerified && (
              <span className="quote-sub-label">20% student deposit reduction applied</span>
            )}
          </span>
          <span className="quote-line-val highlight-amber">₹{deposit.toLocaleString()}</span>
        </div>

        <div className="quote-divider" />

        <div className="quote-line-item total-line">
          <div>
            <div className="total-title">Total Payable Now</div>
            <div className="total-sub">Includes ₹{deposit.toLocaleString()} refundable deposit</div>
          </div>
          <div className="total-price">₹{total.toLocaleString()}</div>
        </div>

        <div className="quote-deposit-callout">
          <div className="callout-title">
            <CheckCircle size={14} />
            <span>Zero Deposit Extortion Guarantee</span>
          </div>
          <p className="callout-desc">
            Held in platform escrow. Undisputed refunds are initiated within 24 hours of documented vehicle return.
          </p>
        </div>
      </div>
    );
  }

  if (listing.category === 'ROOM_ESSENTIAL') {
    const months = rentalDuration;
    const baseRent = listing.price * months;
    const deliveryFee = includeDelivery ? 250 : 0;
    const deposit = isStudentVerified ? Math.round(listing.deposit * 0.5) : listing.deposit;
    const total = baseRent + deliveryFee + deposit;

    return (
      <div className="quote-breakdown-card">
        <h3 className="quote-breakdown-heading">Semester Rental Terms</h3>

        <div className="quote-line-item">
          <span>Monthly Rental ({months} {months === 1 ? 'Month' : 'Months'} @ ₹{listing.price}/mo)</span>
          <span className="quote-line-val">₹{baseRent.toLocaleString()}</span>
        </div>

        <div className="quote-line-item">
          <span>PG Move-In Delivery & Setup</span>
          <span className="quote-line-val">{includeDelivery ? '₹250' : '₹0 (Self-Pickup)'}</span>
        </div>

        <div className="quote-line-item">
          <span>Seasonal Maintenance & Servicing</span>
          <span className="quote-line-val highlight-green">Free (Included)</span>
        </div>

        <div className="quote-line-item">
          <span>
            Refundable Security Deposit
            {isStudentVerified && (
              <span className="quote-sub-label">50% student waiver applied</span>
            )}
          </span>
          <span className="quote-line-val highlight-amber">₹{deposit.toLocaleString()}</span>
        </div>

        <div className="quote-divider" />

        <div className="quote-line-item total-line">
          <div>
            <div className="total-title">Total First Month & Deposit</div>
            <div className="total-sub">Includes ₹{deposit.toLocaleString()} refundable deposit</div>
          </div>
          <div className="total-price">₹{total.toLocaleString()}</div>
        </div>

        <div className="quote-deposit-callout">
          <div className="callout-title">
            <ShieldCheck size={14} />
            <span>Sanitization & Pre-Delivery Inspection</span>
          </div>
          <p className="callout-desc">
            All room appliances are sanitized and tested before dispatch. Free replacement if any fault occurs.
          </p>
        </div>
      </div>
    );
  }

  if (listing.mode === 'BUY_USED') {
    const originalPrice = listing.resaleSpecs?.originalPrice || listing.price * 2;
    const savings = Math.max(0, originalPrice - listing.price);
    const assistedFee = listing.resaleSpecs?.assistedFee || 99;
    const total = listing.price + (includeDelivery ? assistedFee : 0);

    return (
      <div className="quote-breakdown-card">
        <h3 className="quote-breakdown-heading">Resale Deal Summary</h3>

        <div className="quote-line-item">
          <span>Agreed Purchase Price</span>
          <span className="quote-line-val">₹{listing.price.toLocaleString()}</span>
        </div>

        <div className="quote-line-item">
          <span>Original Retail MRP</span>
          <span className="quote-line-val strike-through">₹{originalPrice.toLocaleString()}</span>
        </div>

        <div className="quote-line-item">
          <span>Direct Savings</span>
          <span className="quote-line-val highlight-green">Save ₹{savings.toLocaleString()}</span>
        </div>

        <div className="quote-line-item">
          <span>Campus Safe Meetup Handover</span>
          <span className="quote-line-val">{includeDelivery ? `₹${assistedFee} (Assisted Escrow)` : 'Free (Direct Peer Meetup)'}</span>
        </div>

        <div className="quote-line-item">
          <span>Security Deposit</span>
          <span className="quote-line-val highlight-green">₹0 (Outright Ownership)</span>
        </div>

        <div className="quote-divider" />

        <div className="quote-line-item total-line">
          <div>
            <div className="total-title">Total Outright Purchase</div>
            <div className="total-sub">Zero rental deposit · Full ownership</div>
          </div>
          <div className="total-price">₹{total.toLocaleString()}</div>
        </div>

        <div className="quote-deposit-callout">
          <div className="callout-title">
            <CheckCircle size={14} />
            <span>Campus Pass-it-On Protection</span>
          </div>
          <p className="callout-desc">
            Meet at campus security gates (CU Gate 2, PU Stu-C) to verify the item condition before releasing payment.
          </p>
        </div>
      </div>
    );
  }

  // Maker product breakdown
  const advanceDeposit = listing.deposit || 0;
  const unitPrice = listing.price;
  const leadDays = listing.makerSpecs?.leadDays || 2;

  return (
    <div className="quote-breakdown-card">
      <h3 className="quote-breakdown-heading">Custom Maker Crafting Quote</h3>

      <div className="quote-line-item">
        <span>Handcrafted Item Price</span>
        <span className="quote-line-val">₹{unitPrice.toLocaleString()}</span>
      </div>

      <div className="quote-line-item">
        <span>Personalized Initials / Laser Engraving</span>
        <span className="quote-line-val highlight-green">{isStudentVerified ? 'Free for Students' : 'Included'}</span>
      </div>

      <div className="quote-line-item">
        <span>Crafting Lead Time</span>
        <span className="quote-line-val highlight-amber">{leadDays} {leadDays === 1 ? 'Day' : 'Days'}</span>
      </div>

      <div className="quote-line-item">
        <span>Booking Advance Lock</span>
        <span className="quote-line-val">{advanceDeposit > 0 ? `₹${advanceDeposit}` : 'Pay on Delivery'}</span>
      </div>

      <div className="quote-divider" />

      <div className="quote-line-item total-line">
        <div>
          <div className="total-title">Total Handcrafted Price</div>
          <div className="total-sub">Direct artisan compensation</div>
        </div>
        <div className="total-price">₹{unitPrice.toLocaleString()}</div>
      </div>

      <div className="quote-deposit-callout">
        <div className="callout-title">
          <ShieldCheck size={14} />
          <span>Locally Made in Tri-City</span>
        </div>
        <p className="callout-desc">
          Crafted by vetted local artisans in Mohali & Chandigarh using natural and sustainable materials.
        </p>
      </div>
    </div>
  );
};
