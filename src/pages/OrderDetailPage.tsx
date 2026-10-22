import React from 'react';
import { 
  KeyRound, Phone, HelpCircle
} from 'lucide-react';
import type { UserOrder } from '../types/order';
import { Button, Breadcrumbs } from '../components/ui';

interface OrderDetailPageProps {
  order: UserOrder;
  onBack: () => void;
  onLaunchInspection?: () => void;
  onNavigate: (path: string) => void;
}

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({
  order,
  onBack,
  onLaunchInspection,
  onNavigate
}) => {
  return (
    <main className="details-page-container" role="main">
      <Breadcrumbs
        onNavigate={onNavigate}
        onBack={onBack}
        items={[
          { label: 'Home', path: '#/' },
          { label: 'Orders', path: '#/orders' },
          { label: order.id }
        ]}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="brand-badge">{order.category}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Created: {order.createdAt}</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            {order.title}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="order-id-label" style={{ fontSize: '0.95rem' }}>{order.id}</span>
        </div>
      </div>

      <div className="details-grid">
        {/* Left Column: Handover Timeline & Item Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* OTP Banner Card */}
          <div className="order-detail-otp-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-emerald-subtle)', display: 'grid', placeItems: 'center', color: 'var(--accent-emerald)' }}>
                <KeyRound size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Handover Verification Secret OTP
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
                  {order.handoverOtp}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0' }}>
              Only reveal this OTP after you have physically inspected the item at <strong>{order.handoverLocation}</strong>.
            </p>
          </div>

          {/* 4-Step Handover Timeline */}
          <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Handover & Escrow Timeline
            </h3>

            <div className="order-timeline-flow">
              <div className="order-timeline-step completed">
                <div className="timeline-marker">✓</div>
                <div className="timeline-content">
                  <div className="timeline-title">1. Order Confirmed & Escrow Held</div>
                  <div className="timeline-desc">Refundable deposit safely secured in segregated trust account.</div>
                </div>
              </div>

              <div className="order-timeline-step active">
                <div className="timeline-marker">2</div>
                <div className="timeline-content">
                  <div className="timeline-title">2. Handover Staging & OTP Match</div>
                  <div className="timeline-desc">Meet provider at {order.handoverLocation}. Show OTP <strong>{order.handoverOtp}</strong>.</div>
                </div>
              </div>

              <div className="order-timeline-step pending">
                <div className="timeline-marker">3</div>
                <div className="timeline-content">
                  <div className="timeline-title">3. Joint Condition Verification</div>
                  <div className="timeline-desc">
                    {order.category === 'CAR' ? 'Mandatory 6-point synchronized photo check.' : 'Physical inspection and condition sign-off.'}
                  </div>
                </div>
              </div>

              <div className="order-timeline-step pending">
                <div className="timeline-marker">4</div>
                <div className="timeline-content">
                  <div className="timeline-title">4. Trip / Rental Complete & Deposit Release</div>
                  <div className="timeline-desc">Undisputed deposit returned automatically to your payment source.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Provider / Operator Contact */}
          <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Provider & Handover Contact
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {order.operatorName || 'Verified Campus Supplier'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Coordinating at: {order.handoverLocation}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Phone size={13} />}
                onClick={() => alert(`Calling provider support line for order ${order.id}...`)}
              >
                Contact
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Help */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Payment & Security Breakdown
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <span>Item / Rental Total</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{(order.totalPayableNow - order.securityDeposit).toLocaleString()}</span>
            </div>

            {order.securityDeposit > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <span>Refundable Escrow Deposit</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>₹{order.securityDeposit.toLocaleString()}</span>
              </div>
            )}

            <div style={{ height: '1px', background: 'var(--border-standard)', margin: '0.5rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              <span>Total Paid</span>
              <span style={{ color: 'var(--accent-emerald)' }}>₹{order.totalPayableNow.toLocaleString()}</span>
            </div>
          </div>

          {/* Action CTAs */}
          {order.category === 'CAR' && onLaunchInspection && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onLaunchInspection}
            >
              Launch 6-Point Vehicle Inspection →
            </Button>
          )}

          <div style={{ background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              <HelpCircle size={15} color="var(--accent-blue)" />
              <span>Need Help with this Order?</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.65rem', lineHeight: 1.5 }}>
              Our operations team reviews all pickup and return photos within 2 hours. If a provider is delayed, reach out immediately.
            </p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => onNavigate('#/trust-safety')}
            >
              View Handover Safety Guidelines →
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};
