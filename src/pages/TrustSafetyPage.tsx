import { ShieldCheck, Lock, MapPin, Scale } from 'lucide-react';
import { Breadcrumbs } from '../components/ui';

interface TrustSafetyPageProps {
  onBack: () => void;
  onNavigate: (path: string) => void;
}

export const TrustSafetyPage = ({ onBack, onNavigate }: TrustSafetyPageProps) => {
  return (
    <main className="explainer-container" role="main">
      <Breadcrumbs
        onNavigate={onNavigate}
        onBack={onBack}
        items={[
          { label: 'Home', path: '#/' },
          { label: 'Trust & Verification Standards' }
        ]}
      />

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          Trust, Legality & Safety Architecture
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Rently was founded on one non-negotiable principle: complete transparency and strict legal compliance. We do not permit unregulated grey-market rentals that expose renters to police harassment or lost deposits.
        </p>
      </div>

      {/* Trust Standard 1: Yellow Plates */}
      <div className="explainer-step-card">
        <div className="step-number-circle" style={{ background: 'var(--accent-amber-subtle)', borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--accent-amber)' }}>
          <Scale size={20} />
        </div>
        <div className="step-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <h3 style={{ color: 'var(--text-primary)' }}>1. 100% Commercial Yellow-Plate Fleet Mandate</h3>
          </div>
          <p style={{ marginBottom: '0.75rem' }}>
            Under Section 66 and 192A of the Motor Vehicles Act, <strong>renting out private (white-plate) vehicles for self-drive commercial use is illegal across Punjab and Chandigarh</strong>. If stopped at a police checkpost (such as Zirakpur barrier or Chandigarh Tribune Chowk), unauthorized private rental cars can be immediately seized, impounded, and fined up to ₹10,000, leaving students and families stranded.
          </p>
          <div style={{ background: 'var(--surface-secondary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-emerald)', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            <strong>Our Guarantee:</strong> Every vehicle listed on Rently holds a verified commercial Rent-a-Cab permit, valid commercial fitness certificate, and comprehensive commercial passenger insurance.
          </div>
        </div>
      </div>

      {/* Trust Standard 2: Escrow Protection */}
      <div className="explainer-step-card">
        <div className="step-number-circle">
          <Lock size={20} />
        </div>
        <div className="step-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <h3 style={{ color: 'var(--text-primary)' }}>2. Zero Deposit Extortion via Razorpay Escrow</h3>
          </div>
          <p style={{ marginBottom: '0.75rem' }}>
            In traditional local rentals, operators ask for cash or direct UPI deposits. When you return the vehicle, shady operators frequently invent or point to pre-existing bumper scratches to withhold your money.
          </p>
          <div style={{ background: 'var(--surface-secondary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-emerald)', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            <strong>Our Guarantee:</strong> Your deposit is held in a segregated third-party escrow account. Operators cannot touch these funds. Refunds are automatically triggered within 2 hours of return unless a verified dispute with clear photo evidence is logged.
          </div>
        </div>
      </div>

      {/* Trust Standard 3: Campus Safe Meetup Zones */}
      <div className="explainer-step-card">
        <div className="step-number-circle" style={{ background: 'var(--accent-blue-subtle)', borderColor: 'rgba(56, 189, 248, 0.4)', color: 'var(--accent-blue)' }}>
          <MapPin size={20} />
        </div>
        <div className="step-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <h3 style={{ color: 'var(--text-primary)' }}>3. Geofenced Campus Safe Meetup Zones</h3>
          </div>
          <p>
            For college students living in hostels or off-campus PGs in Kharar and Mohali, handovers occur at well-lit, CCTV-monitored university security gates:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <li><strong>Chandigarh University (CU)</strong>: Gate 2 Main Entrance & Food Court</li>
            <li><strong>Panjab University (PU)</strong>: Stu-C (Student Centre) Fountain & Sector 14 Gate</li>
            <li><strong>CGC Landran & Jhanjeri</strong>: Admin Block Gate 1</li>
            <li><strong>PEC Chandigarh</strong>: Main Market Gate Sector 12</li>
            <li><strong>Knowledge City</strong>: IISER & ISB Main Gate Hub</li>
          </ul>
        </div>
      </div>

      {/* Operator Verification Checklist */}
      <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <ShieldCheck size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>How We Onboard Commercial Fleet Partners</h3>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Before any vehicle goes live on Rently, our field operations team verifies:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          <div>✓ RTO Yellow-Plate Commercial Permit</div>
          <div>✓ Valid Pollution & Fitness Certificates</div>
          <div>✓ Speed Governor Telematics Check</div>
          <div>✓ Operator Police Verification Record</div>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <button className="nav-action-btn primary" onClick={() => onNavigate('#/')}>
            Browse Verified Assets →
          </button>
        </div>
      </div>
    </main>
  );
};
