import React from 'react';
import { 
  X, LogOut, LogIn, PlusCircle, GraduationCap, 
  Car, Armchair, Repeat, Palette, HelpCircle, 
  ShieldCheck, Heart, Clock, User, MapPin, Smartphone, Package 
} from 'lucide-react';
import type { LocalityOption } from '../../data/mockData';

interface NavUserProfile {
  displayName: string;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  isStudentVerified?: boolean;
}

interface NavbarMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  profile: NavUserProfile | null;
  logout: () => void;
  onOpenAuthModal?: () => void;
  onNavigate: (path: string) => void;
  onOpenStudentModal: () => void;
  savedCount: number;
  activeOrdersCount: number;
  selectedLocality: LocalityOption;
  openLocationModal: () => void;
  viewMode?: 'WEB' | 'MOBILE_APP';
  onToggleViewMode?: () => void;
}

export const NavbarMobileDrawer: React.FC<NavbarMobileDrawerProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  profile,
  logout,
  onOpenAuthModal,
  onNavigate,
  onOpenStudentModal,
  savedCount,
  activeOrdersCount,
  selectedLocality,
  openLocationModal,
  viewMode,
  onToggleViewMode
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="apple-mobile-menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Main Navigation Menu"
    >
      {/* Top Sheet Header */}
      <div className="mobile-sheet-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>rently</span>
          <span className="brand-badge">Tri-City</span>
        </div>

        <button
          className="mobile-sheet-close-btn"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Mobile User Profile or Sign In Banner */}
      {isAuthenticated && profile ? (
        <div style={{ 
          background: 'var(--surface-secondary)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '0.85rem 1rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '1.25rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--accent-emerald)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden'
            }}>
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile.displayName.charAt(0)
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{profile.displayName}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{profile.email || profile.phoneNumber}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-rose)',
              cursor: 'pointer',
              padding: '4px'
            }}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            onOpenAuthModal?.();
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.85rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-emerald)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginBottom: '1.25rem'
          }}
        >
          <LogIn size={16} />
          <span>Sign In to Unlock Campus Pass & Escrow</span>
        </button>
      )}

      {/* Quick Action Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => {
            onNavigate('#/list-item');
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.85rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-emerald)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          <PlusCircle size={18} />
          <span>List an Item</span>
        </button>

        <button
          onClick={() => {
            onOpenStudentModal();
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.85rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-standard)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          <GraduationCap size={18} color="var(--accent-emerald)" />
          <span>Campus Pass</span>
        </button>
      </div>

      {/* Large Typography Category Navigation */}
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
        Marketplace Categories
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.5rem' }}>
        <button
          className="mobile-large-nav-link"
          onClick={() => {
            onNavigate('#/category/cars');
            onClose();
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Car size={20} color="var(--accent-emerald)" />
            <span>Self-Drive Cars</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Commercial Fleet</span>
        </button>

        <button
          className="mobile-large-nav-link"
          onClick={() => {
            onNavigate('#/category/room-essentials');
            onClose();
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Armchair size={20} color="var(--accent-blue)" />
            <span>Room Rentals</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Coolers & Desks</span>
        </button>

        <button
          className="mobile-large-nav-link"
          onClick={() => {
            onNavigate('#/category/resale');
            onClose();
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Repeat size={20} color="var(--accent-amber)" />
            <span>Used Resale</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Peer Handovers</span>
        </button>

        <button
          className="mobile-large-nav-link"
          onClick={() => {
            onNavigate('#/category/makers');
            onClose();
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Palette size={20} color="var(--accent-rose)" />
            <span>Local Makers</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Handcrafted</span>
        </button>
      </div>

      {/* Secondary Links & Trust */}
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
        Trust & Support
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <button
          className="mobile-sub-nav-link"
          onClick={() => {
            onNavigate('#/how-it-works');
            onClose();
          }}
        >
          <HelpCircle size={16} />
          <span>How 4-Step Handover & Escrow Works</span>
        </button>

        <button
          className="mobile-sub-nav-link"
          onClick={() => {
            onNavigate('#/trust-safety');
            onClose();
          }}
        >
          <ShieldCheck size={16} color="var(--accent-emerald)" />
          <span>Zero Deposit Extortion & Yellow-Plate Law</span>
        </button>

        <button
          className="mobile-sub-nav-link"
          onClick={() => {
            onNavigate('#/saved');
            onClose();
          }}
        >
          <Heart size={16} color={savedCount > 0 ? 'var(--accent-rose)' : 'currentColor'} fill={savedCount > 0 ? 'var(--accent-rose)' : 'none'} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>Saved Favorites</span>
            {savedCount > 0 && <span className="tab-badge-dot" style={{ position: 'static' }}>{savedCount}</span>}
          </div>
        </button>

        <button
          className="mobile-sub-nav-link"
          onClick={() => {
            onNavigate('#/orders');
            onClose();
          }}
        >
          <Clock size={16} color={activeOrdersCount > 0 ? 'var(--accent-emerald)' : 'currentColor'} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>My Orders & Handover OTPs</span>
            {activeOrdersCount > 0 && (
              <span className="tab-badge-dot" style={{ position: 'static', background: 'var(--accent-emerald)' }}>
                {activeOrdersCount}
              </span>
            )}
          </div>
        </button>

        <button
          className="mobile-sub-nav-link"
          onClick={() => {
            onNavigate('#/dashboard');
            onClose();
          }}
        >
          <Package size={16} color="var(--accent-emerald)" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>Host & Listing Dashboard</span>
            <span className="brand-badge" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
              Portal
            </span>
          </div>
        </button>

        <button
          className="mobile-sub-nav-link"
          onClick={() => {
            onNavigate('#/account');
            onClose();
          }}
        >
          <User size={16} />
          <span>Campus Profile & Preferences</span>
        </button>

        <button
          className="mobile-sub-nav-link"
          onClick={() => {
            openLocationModal();
            onClose();
          }}
        >
          <MapPin size={16} color="var(--accent-blue)" />
          <span>Change Pickup Location ({selectedLocality.name.split(' ')[0]})</span>
        </button>

        {onToggleViewMode && (
          <button
            className="mobile-sub-nav-link"
            onClick={() => {
              onToggleViewMode();
              onClose();
            }}
          >
            <Smartphone size={16} color="var(--accent-emerald)" />
            <span>{viewMode === 'WEB' ? 'Launch Phone Simulator View' : 'Back to Web Platform'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
