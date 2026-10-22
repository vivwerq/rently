import React, { useState } from 'react';
import { 
  Clock, MapPin, 
  KeyRound, Car, Armchair, Repeat, Palette, ShieldCheck
} from 'lucide-react';
import type { UserOrder } from '../types/order';
import { Button, EmptyState, Breadcrumbs } from '../components/ui';

interface OrdersPageProps {
  orders: UserOrder[];
  onOpenOrder: (orderId: string) => void;
  onLaunchInspection: (order: UserOrder) => void;
  onCancelOrder: (orderId: string) => void;
  onNavigate: (path: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  onOpenOrder,
  onLaunchInspection,
  onCancelOrder,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

  const activeOrders = orders.filter(o => o.status === 'CONFIRMED' || o.status === 'HANDOVER_IN_PROGRESS' || o.status === 'ACTIVE_TRIP');
  const pastOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED');

  const displayedOrders = activeTab === 'ACTIVE' ? activeOrders : pastOrders;

  const renderCategoryIcon = (cat: UserOrder['category']) => {
    switch (cat) {
      case 'CAR': return <Car size={16} color="var(--accent-emerald)" />;
      case 'ROOM_ESSENTIAL':
      case 'ELECTRONICS': return <Armchair size={16} color="var(--accent-emerald)" />;
      case 'RESALE': return <Repeat size={16} color="var(--accent-blue)" />;
      case 'MAKER': return <Palette size={16} color="#9333ea" />;
      default: return <Car size={16} />;
    }
  };

  const renderStatusBadge = (status: UserOrder['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="order-status-pill confirmed">● Ready for Handover</span>;
      case 'ACTIVE_TRIP':
        return <span className="order-status-pill active">● Active Trip / In Use</span>;
      case 'COMPLETED':
        return <span className="order-status-pill completed">✓ Completed · Refunded</span>;
      case 'CANCELLED':
        return <span className="order-status-pill cancelled">✕ Cancelled</span>;
      default:
        return <span className="order-status-pill">{status}</span>;
    }
  };

  return (
    <main className="details-page-container" role="main">
      <Breadcrumbs
        onNavigate={onNavigate}
        onBack={() => onNavigate('#/')}
        items={[
          { label: 'Home', path: '#/' },
          { label: 'My Orders & Rentals' }
        ]}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Your Rentals & Activity
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Track active handovers, secret OTPs, vehicle inspection checklists, and deposit returns.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="segmented-tab-control" role="tablist" aria-label="Order history view mode">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ACTIVE'}
            className={`segmented-tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setActiveTab('ACTIVE')}
          >
            <span>Active Handover</span>
            {activeOrders.length > 0 && (
              <span className="order-tab-count-badge">{activeOrders.length}</span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'HISTORY'}
            className={`segmented-tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
            onClick={() => setActiveTab('HISTORY')}
          >
            <span>History ({pastOrders.length})</span>
          </button>
        </div>
      </div>

      {displayedOrders.length > 0 ? (
        <div className="orders-list-flow">
          {displayedOrders.map(order => (
            <article key={order.id} className="order-card-panel">
              <div className="order-card-top-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {renderCategoryIcon(order.category)}
                  <span className="order-id-label">{order.id}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>· {order.createdAt}</span>
                </div>
                {renderStatusBadge(order.status)}
              </div>

              <div className="order-card-main-split">
                <div className="order-card-thumb-group">
                  <img src={order.primaryImage} alt={order.title} className="order-card-thumb-img" />
                  <div>
                    <h3 className="order-card-title">{order.title}</h3>
                    <div className="order-card-meta-line">
                      <MapPin size={13} color="var(--accent-emerald)" />
                      <span>{order.handoverLocation}</span>
                      {order.rentalDuration && <span>· {order.rentalDuration}</span>}
                    </div>
                    {order.regNumber && (
                      <div className="order-card-reg-pill">
                        Commercial RC: <strong>{order.regNumber}</strong>
                      </div>
                    )}
                    {order.paymentId && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                        <ShieldCheck size={13} />
                        <span>Razorpay Escrow: {order.paymentId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Handover OTP Box */}
                {order.status === 'CONFIRMED' && (
                  <div className="order-otp-box">
                    <div className="order-otp-label">
                      <KeyRound size={13} />
                      <span>Handover Secret OTP</span>
                    </div>
                    <div className="order-otp-number">{order.handoverOtp}</div>
                    <div className="order-otp-sub">Show to provider at pickup</div>
                  </div>
                )}
              </div>

              {/* Price & Actions Bottom Row */}
              <div className="order-card-bottom-row">
                <div className="order-card-price-summary">
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Total: <strong style={{ color: 'var(--text-primary)' }}>₹{order.totalPayableNow.toLocaleString()}</strong>
                  </div>
                  {order.securityDeposit > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>
                      Includes ₹{order.securityDeposit.toLocaleString()} refundable deposit
                    </div>
                  )}
                </div>

                <div className="order-card-actions">
                  {order.category === 'CAR' && order.status === 'CONFIRMED' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onLaunchInspection(order)}
                    >
                      Launch 6-Point Inspection →
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onOpenOrder(order.id)}
                    >
                      Tracking & Details →
                    </Button>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Cancel booking ${order.id}?`)) {
                          onCancelOrder(order.id);
                        }
                      }}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Clock size={36} />}
          title={activeTab === 'ACTIVE' ? 'No Active Rentals Right Now' : 'No Past Orders Found'}
          description={
            activeTab === 'ACTIVE'
              ? 'When you reserve self-drive cars, semester furniture, or make a resale offer, your active handovers and OTPs will appear here.'
              : 'Completed semester room rentals, returned cars, and completed purchases will be archived here.'
          }
          primaryActionLabel="Browse Available Fleet & Gear →"
          onPrimaryAction={() => onNavigate('#/')}
        />
      )}
    </main>
  );
};
