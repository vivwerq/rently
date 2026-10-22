import React from 'react';
import { Car, Heart, PlusCircle, Clock, User } from 'lucide-react';

interface MobileBottomTabBarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  savedCount: number;
  activeOrdersCount?: number;
}

export const MobileBottomTabBar: React.FC<MobileBottomTabBarProps> = ({
  currentPath,
  onNavigate,
  savedCount,
  activeOrdersCount = 0
}) => {
  const isCarsActive = currentPath === '#/' || currentPath === '' || currentPath.startsWith('#/category') || currentPath.startsWith('#/search');
  const isSavedActive = currentPath === '#/saved';
  const isListActive = currentPath === '#/list-item';
  const isOrdersActive = currentPath.startsWith('#/orders');
  const isAccountActive = currentPath === '#/account';

  return (
    <nav className="mobile-bottom-tab-bar" aria-label="Mobile bottom navigation">
      <a
        href="#/"
        className={`bottom-tab-item ${isCarsActive ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          onNavigate('#/');
        }}
        aria-label="Explore marketplace"
        aria-current={isCarsActive ? 'page' : undefined}
      >
        <Car size={20} />
        <span className="bottom-tab-label">Explore</span>
      </a>

      <a
        href="#/saved"
        className={`bottom-tab-item ${isSavedActive ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          onNavigate('#/saved');
        }}
        aria-label={`Saved items (${savedCount})`}
        aria-current={isSavedActive ? 'page' : undefined}
      >
        <div style={{ position: 'relative' }}>
          <Heart size={20} color={savedCount > 0 ? 'var(--accent-rose)' : 'currentColor'} fill={savedCount > 0 ? 'var(--accent-rose)' : 'none'} />
          {savedCount > 0 && <span className="tab-badge-dot">{savedCount}</span>}
        </div>
        <span className="bottom-tab-label">Saved</span>
      </a>

      <a
        href="#/list-item"
        className={`bottom-tab-item ${isListActive ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          onNavigate('#/list-item');
        }}
        aria-label="List an asset"
        aria-current={isListActive ? 'page' : undefined}
      >
        <PlusCircle size={20} color="var(--accent-emerald)" />
        <span className="bottom-tab-label" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>List</span>
      </a>

      <a
        href="#/orders"
        className={`bottom-tab-item ${isOrdersActive ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          onNavigate('#/orders');
        }}
        aria-label={`My Orders (${activeOrdersCount})`}
        aria-current={isOrdersActive ? 'page' : undefined}
      >
        <div style={{ position: 'relative' }}>
          <Clock size={20} color={activeOrdersCount > 0 ? 'var(--accent-emerald)' : 'currentColor'} />
          {activeOrdersCount > 0 && (
            <span className="tab-badge-dot" style={{ background: 'var(--accent-emerald)' }}>
              {activeOrdersCount}
            </span>
          )}
        </div>
        <span className="bottom-tab-label">Orders</span>
      </a>

      <a
        href="#/account"
        className={`bottom-tab-item ${isAccountActive ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          onNavigate('#/account');
        }}
        aria-label="Account and campus profile"
        aria-current={isAccountActive ? 'page' : undefined}
      >
        <User size={20} />
        <span className="bottom-tab-label">Account</span>
      </a>
    </nav>
  );
};

