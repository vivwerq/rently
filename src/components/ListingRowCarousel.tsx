import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import type { ListingItem } from '../data/mockData';
import { ListingCard } from './ListingCard';

interface ListingRowCarouselProps {
  id: string;
  title: string;
  badgeText?: string;
  subtitle?: string;
  viewAllText?: string;
  onViewAll?: () => void;
  items: ListingItem[];
  favorites: { [id: string]: boolean };
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectListing: (item: ListingItem) => void;
  emptyState?: React.ReactNode;
  autoScroll?: boolean;
  rentalDays?: number;
}

export const ListingRowCarousel: React.FC<ListingRowCarouselProps> = ({
  id,
  title,
  badgeText,
  subtitle,
  viewAllText = 'View all',
  onViewAll,
  items,
  favorites,
  onToggleFavorite,
  onSelectListing,
  emptyState,
  autoScroll = false,
  rentalDays
}: ListingRowCarouselProps & { rentalDays?: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  // Auto-scroll track when multiple items exist (e.g. cars row)
  useEffect(() => {
    if (!autoScroll || items.length <= 1 || isHovered) return;
    
    // Respect user prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const interval = setInterval(() => {
      if (document.hidden || !scrollContainerRef.current) return;
      const el = scrollContainerRef.current;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      
      // If we are at the end, smoothly loop back to start
      if (el.scrollLeft >= maxScrollLeft - 25) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 340, behavior: 'smooth' });
      }
    }, 5500);

    return () => clearInterval(interval);
  }, [autoScroll, items.length, isHovered]);

  return (
    <section id={id} className="listing-row-carousel-section" aria-labelledby={`${id}-heading`}>
      {/* Header Row: Title, Subtitle, Arrows, and View All */}
      <div className="row-carousel-header">
        <div className="row-carousel-title-group">
          {badgeText && (
            <span className="row-carousel-badge">
              <ShieldCheck size={12} />
              {badgeText}
            </span>
          )}
          <h2 id={`${id}-heading`} className="row-carousel-title">
            {title}
          </h2>
          {subtitle && <p className="row-carousel-subtitle">{subtitle}</p>}
        </div>

        <div className="row-carousel-actions">
          {/* Desktop Left/Right Navigation Arrows */}
          {items.length > 0 && (
            <div className="row-carousel-arrows-group">
              <button
                type="button"
                className="row-arrow-btn prev"
                onClick={scrollLeft}
                aria-label={`Scroll ${title} left`}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="row-arrow-btn next"
                onClick={scrollRight}
                aria-label={`Scroll ${title} right`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {onViewAll && (
            <button
              type="button"
              className="row-view-all-link"
              onClick={onViewAll}
              aria-label={`View all items in ${title}`}
            >
              <span>{viewAllText}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scroll Track (Native CSS Scroll Snap, touch swiping, no scroll-hijacking) */}
      {items.length > 0 ? (
        <div 
          className="row-carousel-track-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          <div
            ref={scrollContainerRef}
            className="row-carousel-scroll-track"
            role="region"
            aria-label={`${title} listing carousel`}
          >
            {items.map((item) => (
              <div key={item.id} className="row-carousel-card-item">
                <ListingCard
                  item={item}
                  isFavorite={!!favorites[item.id]}
                  onToggleFavorite={onToggleFavorite}
                  onSelect={onSelectListing}
                  rentalDays={rentalDays}
                />
              </div>
            ))}

            {/* Peeking End Card hint: View all in this category */}
            {onViewAll && (
              <div className="row-carousel-card-item view-more-card-item">
                <button
                  type="button"
                  className="row-view-more-card"
                  onClick={onViewAll}
                  aria-label={`Browse full ${title} catalog`}
                >
                  <div className="view-more-icon-circle">
                    <ArrowRight size={20} />
                  </div>
                  <span className="view-more-bold">See all {items.length}+ items</span>
                  <span className="view-more-muted">Filter by dates & specs</span>
                </button>
              </div>
            )}
          </div>
          {/* Subtle gradient scroll hint on the right */}
          <div className="row-carousel-fade-hint" aria-hidden="true" />
        </div>
      ) : (
        /* Honest empty state */
        emptyState || null
      )}
    </section>
  );
};
