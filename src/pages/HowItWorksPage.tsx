import { Search, Camera, Key, CheckCircle, ShieldAlert } from 'lucide-react';
import { Breadcrumbs } from '../components/ui';

interface HowItWorksPageProps {
  onBack: () => void;
  onNavigate: (path: string) => void;
}

export const HowItWorksPage = ({ onBack, onNavigate }: HowItWorksPageProps) => {
  return (
    <main className="explainer-container" role="main">
      <Breadcrumbs
        onNavigate={onNavigate}
        onBack={onBack}
        items={[
          { label: 'Home', path: '#/' },
          { label: 'How Handover & Escrow Works' }
        ]}
      />

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          How Rently Works: The 4-Step Verified Handover
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          We engineered Rently to eliminate the two biggest friction points in Indian self-drive and equipment rentals: double-booked reservations and arbitrary deposit deductions. Here is our exact operational workflow.
        </p>
      </div>

      {/* Step 1 */}
      <div className="explainer-step-card">
        <div className="step-number-circle">1</div>
        <div className="step-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Search size={18} color="#10b981" />
            <h3>Search, Compare & Hold</h3>
          </div>
          <p>
            Choose your pickup campus gate or doorstep location in Chandigarh, Mohali, Kharar, or Zirakpur. Review all-in pricing with transparent GST, delivery, and deposit items clearly broken down before payment. When you request a booking, the operator has a <strong>15-minute countdown window</strong> to confirm availability.
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="explainer-step-card">
        <div className="step-number-circle">2</div>
        <div className="step-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Camera size={18} color="#10b981" />
            <h3>Joint 6-Point Photo Inspection</h3>
          </div>
          <p>
            Before keys or equipment change hands, the app guides both the renter and the delivery driver through a synchronized 6-photo reticle checklist (Front, Rear, Left, Right, Tyres, Odometer/Dashboard). The app burns on-device GPS coordinates and atomic timestamps directly into the image pixels to create an unforgeable baseline record.
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="explainer-step-card">
        <div className="step-number-circle">3</div>
        <div className="step-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Key size={18} color="#10b981" />
            <h3>Secret Handover OTP Handshake</h3>
          </div>
          <p>
            Keys or items are never handed over informally. The renter's app generates a secure 6-digit cryptographic OTP. Only when the delivery operator verifies this OTP inside their dispatch console is the booking marked ACTIVE and legal insurance coverage activated.
          </p>
        </div>
      </div>

      {/* Step 4 */}
      <div className="explainer-step-card">
        <div className="step-number-circle">4</div>
        <div className="step-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <CheckCircle size={18} color="#10b981" />
            <h3>Return & Automated Escrow Refund</h3>
          </div>
          <p>
            Upon trip completion, a rapid 2-minute return photo check confirms no new structural damage. Your security deposit is held in a segregated Razorpay escrow account—never in the operator's personal pocket—and is automatically released back to your bank account or UPI within 2 hours.
          </p>
        </div>
      </div>

      {/* Dispute Section */}
      <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <ShieldAlert size={20} color="#f59e0b" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>What Happens in Case of a Damage Dispute?</h3>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          An operator cannot unilaterally deduct money from your deposit. If an operator reports new damage, they must submit photo proof within 24 hours. Our human staff conducts side-by-side arbitration comparing the pickup baseline photos against the return photos. If the mark was pre-existing, your deposit is refunded in full immediately.
        </p>
        <button
          className="nav-action-btn primary"
          onClick={() => onNavigate('#/')}
        >
          Explore Verified Listings →
        </button>
      </div>
    </main>
  );
};
