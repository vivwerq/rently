import React from 'react';
import { ShieldCheck, Lock, Truck, RotateCcw, ShieldAlert } from 'lucide-react';

export const KnowBeforeYouBookSection: React.FC = () => {
  return (
    <section className="know-before-book-section" aria-labelledby="know-before-book-heading">
      <div className="section-headline-group">
        <div className="section-micro-badge">
          <ShieldCheck size={13} />
          <span>Transparency First</span>
        </div>
        <h2 id="know-before-book-heading" className="section-main-heading">
          Know before you book
        </h2>
        <p className="section-sub-copy">
          Clear, verifiable policies so you always know what to expect before making a booking payment.
        </p>
      </div>

      <div className="policies-grid">
        <div className="policy-card">
          <div className="policy-icon-header">
            <Lock size={20} />
            <h3 className="policy-title">Security Deposits</h3>
          </div>
          <p className="policy-body">
            Deposits are held safely in a segregated third-party escrow account—never in the operator's personal pocket. Automatically released back to your bank account or UPI within 2 hours of return inspection.
          </p>
          <span className="policy-footnote">Operators cannot unilaterally deduct money.</span>
        </div>

        <div className="policy-card">
          <div className="policy-icon-header">
            <Truck size={20} />
            <h3 className="policy-title">Pickup & Delivery</h3>
          </div>
          <p className="policy-body">
            Free self-pickup at verified operator hubs and geofenced campus safe spots (CU Gate 2, PU Stu-C, CGC Gate 1). Doorstep delivery across Chandigarh, Mohali, Kharar, and Zirakpur is available for an optional flat ₹250.
          </p>
          <span className="policy-footnote">Convenient safe zones with CCTV coverage.</span>
        </div>

        <div className="policy-card">
          <div className="policy-icon-header">
            <RotateCcw size={20} />
            <h3 className="policy-title">Cancellations</h3>
          </div>
          <p className="policy-body">
            Free cancellation up to 6 hours before scheduled trip handover. If cancelled within 6 hours of trip start, a nominal operator preparation fee (₹200–₹350 depending on category) is retained, and the remainder refunded immediately.
          </p>
          <span className="policy-footnote">Instant refund processing to original source.</span>
        </div>

        <div className="policy-card">
          <div className="policy-icon-header">
            <ShieldAlert size={20} />
            <h3 className="policy-title">Support & Damage Reporting</h3>
          </div>
          <p className="policy-body">
            Synchronized 6-point GPS-timestamped photos at pickup create the baseline record. If an operator reports new damage, our operations staff conducts independent side-by-side arbitration against baseline photos.
          </p>
          <span className="policy-footnote">Normal wear-and-tear is never charged to the renter.</span>
        </div>
      </div>
    </section>
  );
};
