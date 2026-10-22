import React, { useState } from 'react';
import { Heart, ShieldCheck } from 'lucide-react';
import type { ListingItem } from '../../data/mockData';

interface ImageGalleryProps {
  listing: ListingItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  listing,
  isFavorite,
  onToggleFavorite
}) => {
  // Generate multi-angle images from primary image or high-res gallery
  const images = [
    listing.primaryImage,
    // Slight crop/angle variations for demonstration
    listing.primaryImage + '&auto=format&fit=crop&w=1200&q=85',
    listing.primaryImage + '&auto=format&fit=crop&w=1000&q=80'
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const renderBadge = () => {
    if (listing.category === 'CAR') {
      return (
        <span className="card-verification-pill" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2 }}>
          <ShieldCheck size={13} />
          Commercial RC · PB RTO Permit
        </span>
      );
    }
    if (listing.mode === 'BUY_USED') {
      return (
        <span className="card-verification-pill" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2, color: 'var(--accent-blue)' }}>
          🔄 Zero Deposit Resale
        </span>
      );
    }
    if (listing.mode === 'MAKER') {
      return (
        <span className="card-verification-pill" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2, color: '#9333ea' }}>
          🎨 Handcrafted in Tri-City
        </span>
      );
    }
    return (
      <span className="card-verification-pill" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2, color: 'var(--accent-emerald)' }}>
        ✓ Sanitized & Serviced
      </span>
    );
  };

  return (
    <div className="commerce-gallery-container">
      <div className="commerce-gallery-hero-wrapper">
        <img
          src={images[activeImageIndex]}
          alt={listing.title}
          className="commerce-gallery-hero-img"
        />

        {renderBadge()}

        <button
          type="button"
          className="card-favorite-btn"
          onClick={(e) => onToggleFavorite(listing.id, e)}
          aria-label={isFavorite ? 'Remove from saved items' : 'Save item'}
          style={{ width: '44px', height: '44px', top: '16px', right: '16px' }}
        >
          <Heart
            size={20}
            color={isFavorite ? '#f43f5e' : '#ffffff'}
            fill={isFavorite ? '#f43f5e' : 'none'}
          />
        </button>
      </div>

      {/* Thumbnail Bar */}
      <div className="commerce-gallery-thumbnails" role="tablist" aria-label="Product thumbnail angles">
        {images.map((imgUrl, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={activeImageIndex === idx}
            className={`commerce-gallery-thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
            onClick={() => setActiveImageIndex(idx)}
          >
            <img src={imgUrl} alt={`${listing.title} view ${idx + 1}`} className="commerce-gallery-thumb-img" />
          </button>
        ))}
      </div>
    </div>
  );
};
