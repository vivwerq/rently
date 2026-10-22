import React from 'react';
import { Sparkles, ArrowUpRight, ShieldCheck, Lock, FileText, CheckCircle } from 'lucide-react';

interface SupplierInviteSectionProps {
  onNavigate: (path: string) => void;
}

export const SupplierInviteSection: React.FC<SupplierInviteSectionProps> = ({ onNavigate }) => {
  return (
    <section className="supplier-invite-section" aria-labelledby="supplier-heading">
      <div className="supplier-invite-card">
        <div>
          <div className="section-micro-badge" style={{ color: 'var(--accent-amber)' }}>
            <Sparkles size={13} />
            <span>Host & Supplier Network</span>
          </div>
          <h2 id="supplier-heading" className="supplier-invite-heading">
            Got something useful sitting idle?
          </h2>
          <p className="supplier-invite-copy">
            Turn your commercial vehicle, creator camera kit, camping tent, or hostel room essentials into steady income. You set your availability and pricing, while Rently handles renter identity verification, 6-point condition photos, and escrow deposit security.
          </p>
          <div className="supplier-compliance-notes">
            <div><strong>• Commercial Fleet Mandate:</strong> Vehicle listings require a verified commercial Rent-a-Cab yellow plate permit under Punjab & Chandigarh RTO regulations.</div>
            <div><strong>• Equipment & Essentials:</strong> Gear and student room kits must be fully operational, clean, and inspected before each handover.</div>
          </div>
          <button
            type="button"
            className="supplier-cta-btn"
            onClick={() => onNavigate('#/list-item')}
            aria-label="List your item or asset on Rently"
          >
            <span>List your item</span>
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="supplier-invite-badge-box">
          <div className="supplier-perk-line">
            <ShieldCheck size={18} color="#10b981" />
            <span>100% Verified Renter Profiles</span>
          </div>
          <div className="supplier-perk-line">
            <Lock size={18} color="#0284c7" />
            <span>Escrow Damage Deposit Protection</span>
          </div>
          <div className="supplier-perk-line">
            <FileText size={18} color="#f59e0b" />
            <span>6-Point GPS Photo Inspection Records</span>
          </div>
          <div className="supplier-perk-line">
            <CheckCircle size={18} color="#10b981" />
            <span>Direct Bank / UPI Automated Payouts</span>
          </div>
        </div>
      </div>
    </section>
  );
};
