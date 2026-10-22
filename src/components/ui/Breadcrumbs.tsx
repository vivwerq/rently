import React from 'react';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onNavigate,
  onBack,
  showBackButton = true,
  className = ''
}) => {
  return (
    <nav className={`app-breadcrumbs ${className}`} aria-label="Breadcrumb navigation">
      {showBackButton && onBack && (
        <>
          <button
            type="button"
            onClick={onBack}
            className="breadcrumb-back-button"
            aria-label="Navigate back"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
          <span className="breadcrumb-divider-vertical" aria-hidden="true" />
        </>
      )}

      <ol className="breadcrumb-list">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const isHome = idx === 0 && (item.label === 'Home' || item.path === '#/');

          return (
            <li key={idx} className="breadcrumb-item">
              {idx > 0 && (
                <ChevronRight size={12} className="breadcrumb-separator-icon" aria-hidden="true" />
              )}
              {isLast || !item.path ? (
                <span
                  className="breadcrumb-item-current"
                  aria-current="page"
                  title={item.label}
                >
                  {isHome && <Home size={12} className="breadcrumb-home-icon" />}
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate(item.path!)}
                  className="breadcrumb-item-link"
                >
                  {isHome && <Home size={12} className="breadcrumb-home-icon" />}
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
