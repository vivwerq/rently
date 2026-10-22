import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Heart, Menu, PlusCircle, LogIn, ChevronDown, Package 
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import type { LocalityOption } from '../data/mockData';
import { RentalCapsuleBar } from './search/RentalCapsuleBar';
import { CitySelectorModal } from './search/CitySelectorModal';
import { RentalDateRangeModal } from './search/RentalDateRangeModal';
import type { RentalDateRange } from './search/RentalDateRangeModal';
import { NavUserDropdown } from './layout/NavUserDropdown';
import { NavbarMobileDrawer } from './layout/NavbarMobileDrawer';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  selectedLocality: LocalityOption;
  onSelectLocality: (locality: LocalityOption) => void;
  savedCount: number;
  activeOrdersCount?: number;
  isStudentVerified: boolean;
  onOpenStudentModal: () => void;
  onOpenAuthModal?: () => void;
  viewMode?: 'WEB' | 'MOBILE_APP';
  onToggleViewMode?: () => void;
  isLocationModalOpen?: boolean;
  onOpenLocationModal?: () => void;
  onCloseLocationModal?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onExecuteSearch?: () => void;
  rentalDates?: RentalDateRange;
  onApplyRentalDates?: (dates: RentalDateRange) => void;
  isDateModalOpen?: boolean;
  onOpenDateModal?: (focus?: 'delivery' | 'pickup') => void;
  onCloseDateModal?: () => void;
  initialFocus?: 'delivery' | 'pickup';
}

export const Navbar = ({
  currentPath: _currentPath,
  onNavigate,
  selectedLocality,
  onSelectLocality,
  savedCount,
  activeOrdersCount = 0,
  isStudentVerified,
  onOpenStudentModal,
  onOpenAuthModal,
  viewMode,
  onToggleViewMode,
  isLocationModalOpen: isLocationModalOpenProp,
  onOpenLocationModal: onOpenLocationModalProp,
  onCloseLocationModal: onCloseLocationModalProp,
  rentalDates: rentalDatesProp,
  onApplyRentalDates: onApplyRentalDatesProp,
  isDateModalOpen: isDateModalOpenProp,
  onOpenDateModal: onOpenDateModalProp,
  onCloseDateModal: onCloseDateModalProp,
  initialFocus = 'delivery'
}: NavbarProps) => {
  const { profile, isAuthenticated, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);

  const [internalLocModalOpen, setInternalLocModalOpen] = useState(false);
  const isLocationModalOpen = isLocationModalOpenProp !== undefined ? isLocationModalOpenProp : internalLocModalOpen;
  
  const [internalDateModalOpen, setInternalDateModalOpen] = useState(false);
  const [dateModalFocus, setDateModalFocus] = useState<'delivery' | 'pickup'>(initialFocus);
  const isDateModalOpen = isDateModalOpenProp !== undefined ? isDateModalOpenProp : internalDateModalOpen;

  const [internalRentalDates, setInternalRentalDates] = useState<RentalDateRange>(() => {
    const today = new Date();
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const p = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4);
    return {
      deliveryDate: d,
      pickupDate: p,
      days: 3
    };
  });
  const effectiveDates = rentalDatesProp || internalRentalDates;

  useEffect(() => {
    const handleDropdownOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    if (showUserDropdown) {
      document.addEventListener('mousedown', handleDropdownOutside);
    }
    return () => document.removeEventListener('mousedown', handleDropdownOutside);
  }, [showUserDropdown]);

  const openLocationModal = useCallback(() => {
    if (onOpenLocationModalProp) {
      onOpenLocationModalProp();
    } else {
      setInternalLocModalOpen(true);
    }
  }, [onOpenLocationModalProp]);

  const closeLocationModal = useCallback(() => {
    if (onCloseLocationModalProp) {
      onCloseLocationModalProp();
    } else {
      setInternalLocModalOpen(false);
    }
  }, [onCloseLocationModalProp]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('rently-theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rently-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLocationModal();
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeLocationModal]);

  return (
    <>
      <header className="site-navbar" role="banner">
        <div className="site-navbar-inner">
          {/* Left: Brand */}
          <div className="nav-left-group">
            <a
              href="#/"
              className="brand-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('#/');
              }}
              aria-label="Rently homepage"
            >
              <span>rently</span>
              <span className="brand-badge">Tri-City</span>
            </a>
          </div>

          {/* Center: Search & Booking Capsule Bar */}
          <div className="navbar-capsule-container">
            <RentalCapsuleBar
              selectedLocality={selectedLocality}
              onOpenCityModal={openLocationModal}
              rentalDates={effectiveDates}
              onOpenDateModal={(focus) => {
                setDateModalFocus(focus || 'delivery');
                if (onOpenDateModalProp) onOpenDateModalProp(focus);
                else setInternalDateModalOpen(true);
              }}
            />
          </div>

          {/* Right: Actions */}
          <div className="nav-right-group">
            {/* Host Dashboard Button (Desktop) */}
            <button
              id="nav-dashboard-btn"
              type="button"
              className="nav-action-btn desktop-only-btn"
              onClick={() => onNavigate('#/dashboard')}
              aria-label="Host and listing dashboard"
              title="Host and listing dashboard"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Package size={14} color="var(--accent-emerald)" />
              <span>Host Hub</span>
            </button>

            {/* List an Item Button */}
            <button
              id="nav-list-item-btn"
              type="button"
              className="nav-action-btn primary"
              onClick={() => onNavigate('#/list-item')}
              aria-label="List your item or asset on Rently"
            >
              <PlusCircle size={15} />
              <span>List Item</span>
            </button>

            {/* Saved Items Link */}
            <button
              id="nav-saved-btn"
              type="button"
              className="nav-icon-btn nav-fav-btn"
              onClick={() => onNavigate('#/saved')}
              aria-label={`Saved items (${savedCount})`}
              title="Saved items"
            >
              <Heart
                size={17}
                color={savedCount > 0 ? "var(--accent-rose)" : "currentColor"}
                fill={savedCount > 0 ? "var(--accent-rose)" : "none"}
              />
              {savedCount > 0 && (
                <span className="nav-badge" aria-hidden="true">
                  {savedCount}
                </span>
              )}
            </button>

            {/* User Account / Sign In */}
            {isAuthenticated && profile ? (
              <div ref={userDropdownRef} className="nav-user-dropdown-container">
                <button
                  id="nav-user-profile-btn"
                  type="button"
                  onClick={() => setShowUserDropdown(prev => !prev)}
                  className="nav-user-pill-btn"
                  aria-expanded={showUserDropdown}
                  aria-haspopup="true"
                  aria-label="User account menu"
                >
                  <div className="nav-user-avatar">
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt={profile.displayName} />
                    ) : (
                      profile.displayName.charAt(0)
                    )}
                  </div>
                  <span className="nav-user-name">
                    {profile.displayName.split(' ')[0]}
                  </span>
                  <ChevronDown size={13} className="nav-user-chevron" />
                </button>

                {showUserDropdown && (
                  <NavUserDropdown
                    profile={profile}
                    isStudentVerified={isStudentVerified}
                    activeOrdersCount={activeOrdersCount}
                    savedCount={savedCount}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    viewMode={viewMode}
                    onToggleViewMode={onToggleViewMode}
                    onNavigate={onNavigate}
                    onOpenStudentModal={onOpenStudentModal}
                    logout={logout}
                    onClose={() => setShowUserDropdown(false)}
                  />
                )}
              </div>
            ) : (
              <button
                id="nav-signin-btn"
                type="button"
                className="nav-action-btn primary desktop-only-btn"
                onClick={onOpenAuthModal}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              className="nav-icon-btn mobile-menu-trigger-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Drawer */}
      <NavbarMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        profile={profile}
        logout={logout}
        onOpenAuthModal={onOpenAuthModal}
        onNavigate={onNavigate}
        onOpenStudentModal={onOpenStudentModal}
        savedCount={savedCount}
        activeOrdersCount={activeOrdersCount}
        selectedLocality={selectedLocality}
        openLocationModal={openLocationModal}
        viewMode={viewMode}
        onToggleViewMode={onToggleViewMode}
      />

      {/* Select Your City Modal */}
      <CitySelectorModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
        selectedLocality={selectedLocality}
        onSelectLocality={onSelectLocality}
      />

      {/* Select Your Dates Modal */}
      <RentalDateRangeModal
        isOpen={isDateModalOpen}
        onClose={() => {
          if (onCloseDateModalProp) onCloseDateModalProp();
          else setInternalDateModalOpen(false);
        }}
        initialDates={effectiveDates}
        initialFocus={dateModalFocus}
        onApplyDates={(dates) => {
          if (onApplyRentalDatesProp) onApplyRentalDatesProp(dates);
          else setInternalRentalDates(dates);
        }}
      />
    </>
  );
};
