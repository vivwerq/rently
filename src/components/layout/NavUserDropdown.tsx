import React from 'react';
import { 
  User, Clock, Heart, GraduationCap, Moon, Sun, 
  Smartphone, LogOut, CheckCircle2, Package
} from 'lucide-react';

interface NavUserProfile {
  displayName: string;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  isStudentVerified?: boolean;
}

interface NavUserDropdownProps {
  profile: NavUserProfile;
  isStudentVerified: boolean;
  activeOrdersCount: number;
  savedCount: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  viewMode?: 'WEB' | 'MOBILE_APP';
  onToggleViewMode?: () => void;
  onNavigate: (path: string) => void;
  onOpenStudentModal: () => void;
  logout: () => void;
  onClose: () => void;
}

export const NavUserDropdown: React.FC<NavUserDropdownProps> = ({
  profile,
  isStudentVerified,
  activeOrdersCount,
  savedCount,
  theme,
  toggleTheme,
  viewMode,
  onToggleViewMode,
  onNavigate,
  onOpenStudentModal,
  logout,
  onClose
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '250px',
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '0.75rem',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem'
      }}
    >
      <div style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
          {profile.displayName}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {profile.email || profile.phoneNumber}
        </div>
        {(isStudentVerified || profile.isStudentVerified) && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--accent-emerald)', marginTop: '4px', fontWeight: 600 }}>
            <CheckCircle2 size={12} />
            <span>Campus Student Pass Verified</span>
          </div>
        )}
      </div>

      <button
        id="nav-dropdown-host-btn"
        className="nav-dropdown-item"
        onClick={() => {
          onNavigate('#/dashboard');
          onClose();
        }}
      >
        <Package size={15} color="var(--accent-emerald)" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>Host & Listing Dashboard</span>
          <span className="brand-badge" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
            Portal
          </span>
        </div>
      </button>

      <button
        className="nav-dropdown-item"
        onClick={() => {
          onNavigate('#/account');
          onClose();
        }}
      >
        <User size={15} />
        <span>My Account & Preferences</span>
      </button>

      <button
        className="nav-dropdown-item"
        onClick={() => {
          onNavigate('#/orders');
          onClose();
        }}
      >
        <Clock size={15} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>Rentals & Activity</span>
          {activeOrdersCount > 0 && (
            <span className="brand-badge" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
              {activeOrdersCount} active
            </span>
          )}
        </div>
      </button>

      <button
        className="nav-dropdown-item"
        onClick={() => {
          onNavigate('#/saved');
          onClose();
        }}
      >
        <Heart size={15} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>Saved Favorites</span>
          {savedCount > 0 && (
            <span className="brand-badge" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
              {savedCount}
            </span>
          )}
        </div>
      </button>

      <button
        className="nav-dropdown-item"
        onClick={() => {
          onOpenStudentModal();
          onClose();
        }}
      >
        <GraduationCap size={15} color={(isStudentVerified || profile.isStudentVerified) ? "var(--accent-emerald)" : "currentColor"} />
        <span>{(isStudentVerified || profile.isStudentVerified) ? "Campus Student Perks (Active)" : "Verify Campus Student Pass"}</span>
      </button>

      <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.25rem 0' }} />

      <button
        className="nav-dropdown-item"
        onClick={() => toggleTheme()}
      >
        {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        <span>{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</span>
      </button>

      {onToggleViewMode && (
        <button
          className="nav-dropdown-item"
          onClick={() => {
            onToggleViewMode();
            onClose();
          }}
        >
          <Smartphone size={15} />
          <span>{viewMode === 'WEB' ? 'Open Mobile App View' : 'Open Web View'}</span>
        </button>
      )}

      <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.25rem 0' }} />

      <button
        id="nav-dropdown-signout-btn"
        className="nav-dropdown-item logout"
        onClick={() => {
          logout();
          onClose();
        }}
        style={{ color: 'var(--accent-rose)' }}
      >
        <LogOut size={15} />
        <span>Sign Out</span>
      </button>
    </div>
  );
};
