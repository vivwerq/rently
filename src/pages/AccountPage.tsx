import React from 'react';
import { 
  GraduationCap, MapPin, 
  Heart, Clock, Sun, Moon, 
  CheckCircle2, RefreshCw, User, LogIn, LogOut, ShieldCheck
} from 'lucide-react';
import type { LocalityOption } from '../data/mockData';
import { Button, Breadcrumbs } from '../components/ui';
import { resetAllDemoData } from '../utils/orderStorage';
import { useAuth } from '../context/useAuth';

interface AccountPageProps {
  selectedLocality: LocalityOption;
  isStudentVerified: boolean;
  onOpenStudentModal: () => void;
  onOpenLocationModal: () => void;
  onOpenAuthModal?: () => void;
  savedCount: number;
  ordersCount: number;
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  selectedLocality,
  isStudentVerified,
  onOpenStudentModal,
  onOpenLocationModal,
  onOpenAuthModal,
  savedCount,
  ordersCount,
  onNavigate
}) => {
  const { profile, isAuthenticated, logout } = useAuth();
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('rently-theme', nextTheme);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo orders, saved favorites, and prototype state to clean initial defaults?')) {
      resetAllDemoData();
      window.location.reload();
    }
  };

  return (
    <main className="details-page-container" role="main">
      <Breadcrumbs
        onNavigate={onNavigate}
        onBack={() => onNavigate('#/')}
        items={[
          { label: 'Home', path: '#/' },
          { label: 'My Account' }
        ]}
      />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Account & Campus Preferences
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
          Manage your verified identity, campus student pass, delivery addresses, and session preferences.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* 0. Authenticated User Profile Card */}
        <div className="account-card-panel" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                background: 'var(--accent-emerald)', 
                color: '#ffffff', 
                display: 'grid', 
                placeItems: 'center',
                fontSize: '1.4rem',
                fontWeight: 800,
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {isAuthenticated && profile?.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : isAuthenticated && profile ? (
                  profile.displayName.charAt(0)
                ) : (
                  <User size={28} />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {isAuthenticated && profile ? profile.displayName : 'Guest User'}
                  </h2>
                  {isAuthenticated && (
                    <span className="brand-badge">{profile?.role || 'RENTER'}</span>
                  )}
                  {isAuthenticated && profile?.isListingVerified && (
                    <span className="order-status-pill confirmed" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={12} color="var(--accent-emerald)" /> Standard Host Verified
                    </span>
                  )}
                  {isAuthenticated && profile?.isStudentVerified && (
                    <span className="order-status-pill confirmed" style={{ fontSize: '0.75rem' }}>
                      <CheckCircle2 size={12} /> Campus Student Pass Active
                    </span>
                  )}
                  {isAuthenticated && profile?.drivingLicenseVerified && (
                    <span className="order-status-pill" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={12} color="var(--accent-emerald)" /> DL Verified
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  {isAuthenticated && profile
                    ? (profile.email || profile.phoneNumber || 'Authenticated Session')
                    : 'Sign in to access verified rentals, campus deposit reductions, and OTP handovers.'}
                </div>
              </div>
            </div>

            <div>
              {isAuthenticated ? (
                <Button
                  id="account-signout-btn"
                  variant="outline"
                  size="sm"
                  leftIcon={<LogOut size={14} />}
                  onClick={logout}
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  id="account-signin-btn"
                  variant="primary"
                  size="sm"
                  leftIcon={<LogIn size={14} />}
                  onClick={onOpenAuthModal}
                >
                  Sign In / Register
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 0.5 Host & Asset Listing Dashboard Panel */}
        <div className="account-card-panel" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, var(--surface-primary) 0%, var(--surface-secondary) 100%)', border: '1.5px solid var(--border-standard)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--accent-emerald-subtle)', color: 'var(--accent-emerald)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Host & Asset Listing Dashboard
                  </h3>
                  <span className="brand-badge">Operator Portal</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Manage your items, public internet publishing, local device cache drafts, and verified credentials.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('#/dashboard')}
              >
                Open Host Dashboard →
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('#/list-item')}
              >
                + List New Item
              </Button>
            </div>
          </div>
        </div>
        {/* 1. Student Pass Status */}
        <div className="account-card-panel">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: isStudentVerified ? 'var(--accent-emerald-subtle)' : 'var(--surface-secondary)', display: 'grid', placeItems: 'center', color: isStudentVerified ? 'var(--accent-emerald)' : 'var(--text-tertiary)' }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Campus Student ID Pass
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {isStudentVerified ? 'Verified Active Status' : 'Not Verified Yet'}
                </div>
              </div>
            </div>

            {isStudentVerified ? (
              <span className="order-status-pill confirmed">
                <CheckCircle2 size={12} /> Verified
              </span>
            ) : (
              <span className="order-status-pill cancelled">Unverified</span>
            )}
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            {isStudentVerified
              ? 'Your verified student ID unlocks 50% deposit reductions on semester room furniture, zero resale fees, and 20% extra kilometer road trip packages.'
              : 'Upload your student roll number or institutional email to access reduced security deposits and campus gate handovers.'}
          </p>

          <Button
            variant={isStudentVerified ? 'outline' : 'primary'}
            size="sm"
            fullWidth
            onClick={onOpenStudentModal}
          >
            {isStudentVerified ? 'Re-verify or Update Campus →' : 'Verify Student ID Now →'}
          </Button>
        </div>

        {/* 2. Selected Browsing Locality */}
        <div className="account-card-panel">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-blue-subtle)', display: 'grid', placeItems: 'center', color: 'var(--accent-blue)' }}>
                <MapPin size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Primary Browsing Locality
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedLocality.name}
                </div>
              </div>
            </div>
            <span className="brand-badge">{selectedLocality.type}</span>
          </div>

          <div style={{ background: 'var(--surface-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <div><strong>Handover Zone:</strong> {selectedLocality.safeHandoverSpot}</div>
            <div style={{ marginTop: '2px', color: 'var(--text-tertiary)' }}>Catchment: {selectedLocality.catchment}</div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={onOpenLocationModal}
          >
            Switch Campus / Sector Location
          </Button>
        </div>

        {/* 3. Orders & Saved Summary */}
        <div className="account-card-panel">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Activity & Bookings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              className="account-stat-box"
              onClick={() => onNavigate('#/orders')}
              role="button"
              tabIndex={0}
            >
              <Clock size={20} color="var(--accent-emerald)" />
              <div className="account-stat-val">{ordersCount}</div>
              <div className="account-stat-label">Rentals / Orders</div>
            </div>

            <div
              className="account-stat-box"
              onClick={() => onNavigate('#/saved')}
              role="button"
              tabIndex={0}
            >
              <Heart size={20} color="var(--accent-rose)" />
              <div className="account-stat-val">{savedCount}</div>
              <div className="account-stat-label">Saved Favorites</div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => onNavigate('#/orders')}
          >
            Open Active Orders Portal →
          </Button>
        </div>

        {/* 4. Prototype & Appearance Settings */}
        <div className="account-card-panel">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            App Preferences & Demo Controls
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Interface Appearance</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Current theme: {currentTheme}</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={currentTheme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              onClick={toggleTheme}
            >
              Switch to {currentTheme === 'light' ? 'Dark' : 'Light'}
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-rose)' }}>Reset Prototype Session</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Clears local orders, bookings & favorites</div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              leftIcon={<RefreshCw size={13} />}
              onClick={handleResetDemo}
            >
              Reset All
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};
