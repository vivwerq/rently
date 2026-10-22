import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Play, Pause, ArrowRight, Sparkles, ShieldCheck
} from 'lucide-react';
import type { LocalityOption } from '../data/mockData';
import './heroCarousel.css';

export interface HeroSlideData {
  id: string;
  categoryKey: 'CARS' | 'CAMERAS' | 'GAMING' | 'OUTDOORS' | 'PARTY';
  badge: string;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  highlightType: 'circle' | 'underline';
  subhead: string;
  perks: string[];
  ctaText: string;
  ctaTargetId: string;
  accentColor: string;
  lightBgTint: string;
}

const HERO_SLIDES: HeroSlideData[] = [
  {
    id: 'slide-cars',
    categoryKey: 'CARS',
    badge: '🚗 CAR RENTALS · TRI-CITY PRIORITY',
    headlinePrefix: 'Weekend ka plan? ',
    headlineHighlight: 'Gaadi',
    headlineSuffix: ' yahin hai.',
    highlightType: 'circle',
    subhead: 'Commercial yellow-plate self-drive cars with verified RTO permits for Shimla, Manali & Tri-City getaways.',
    perks: ['From ₹1,400/day', 'Zero permit markup', '50% deposit off with Student ID'],
    ctaText: 'Explore Cars & SUVs',
    ctaTargetId: 'section-cars',
    accentColor: '#ea580c',
    lightBgTint: 'rgba(234, 88, 12, 0.05)'
  },
  {
    id: 'slide-cameras',
    categoryKey: 'CAMERAS',
    badge: '📷 CAMERAS & CREATOR EQUIPMENT',
    headlinePrefix: 'Big ideas. ',
    headlineHighlight: 'Gear on rent.',
    headlineSuffix: '',
    highlightType: 'underline',
    subhead: 'Sony Alpha mirrorless, Canon DSLRs, 4K vlog rigs & DJI gimbal kits with sanitized sensors for your shoots.',
    perks: ['Sanitized sensor & lenses', 'Fast SD cards included', 'Student film project rates'],
    ctaText: 'Explore Camera Gear',
    ctaTargetId: 'section-cameras',
    accentColor: '#0284c7',
    lightBgTint: 'rgba(2, 132, 199, 0.05)'
  },
  {
    id: 'slide-gaming',
    categoryKey: 'GAMING',
    badge: '🎮 GAMING CONSOLES & ACCESSORIES',
    headlinePrefix: 'Game night, ',
    headlineHighlight: 'sorted.',
    headlineSuffix: '',
    highlightType: 'circle',
    subhead: 'PlayStation 5, Xbox Series X, extra dual-sense wireless controllers and high-refresh displays delivered to your door.',
    perks: ['Pre-loaded top titles', '2x wireless controllers', 'Weekend tournament pass'],
    ctaText: 'Explore Gaming Consoles',
    ctaTargetId: 'section-gaming',
    accentColor: '#9333ea',
    lightBgTint: 'rgba(147, 51, 234, 0.05)'
  },
  {
    id: 'slide-outdoors',
    categoryKey: 'OUTDOORS',
    badge: '⛺ CAMPING & OUTDOOR GEAR',
    headlinePrefix: 'Trip ready. ',
    headlineHighlight: 'Gear ready.',
    headlineSuffix: '',
    highlightType: 'underline',
    subhead: 'All-weather waterproof tents, sub-zero sleeping bags, trekking poles, and 60L rucksacks for Kasol, Parvati & Triund.',
    perks: ['All-weather waterproof', 'Inspected after each trek', 'Ultralight camping kits'],
    ctaText: 'Explore Outdoor Gear',
    ctaTargetId: 'section-outdoors',
    accentColor: '#16a34a',
    lightBgTint: 'rgba(22, 163, 74, 0.05)'
  },
  {
    id: 'slide-party',
    categoryKey: 'PARTY',
    badge: '🎉 PARTY & ENTERTAINMENT EQUIPMENT',
    headlinePrefix: 'House party or movie night? ',
    headlineHighlight: 'Sound on rent.',
    headlineSuffix: '',
    highlightType: 'circle',
    subhead: '1080p cinema projectors, 100" foldable screens, high-bass party speakers, and ambient lighting for any event.',
    perks: ['Instant HDMI/AirPlay casting', 'High-bass Bluetooth audio', 'Foldable 100" screen bundle'],
    ctaText: 'Explore Entertainment Gear',
    ctaTargetId: 'section-entertainment',
    accentColor: '#d97706',
    lightBgTint: 'rgba(217, 119, 6, 0.05)'
  }
];

interface HeroCarouselProps {
  selectedLocality?: LocalityOption;
  onOpenLocationModal?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onExecuteSearch?: () => void;
  activeSlideIndex: number;
  onSlideChange: (index: number) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  activeSlideIndex,
  onSlideChange
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const carouselContainerRef = useRef<HTMLDivElement | null>(null);
  const autoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch swiping tracking
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Check user prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Next / Prev slide handlers
  const handleNextSlide = useCallback(() => {
    onSlideChange((activeSlideIndex + 1) % HERO_SLIDES.length);
  }, [activeSlideIndex, onSlideChange]);

  const handlePrevSlide = useCallback(() => {
    onSlideChange((activeSlideIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, [activeSlideIndex, onSlideChange]);

  // Continuous Auto-scroll effect: advances every 4.5s unless paused or hovered
  useEffect(() => {
    if (prefersReducedMotion || !isPlaying || isHovered) {
      if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
      return;
    }

    autoScrollTimerRef.current = setTimeout(() => {
      if (!document.hidden) {
        handleNextSlide();
      }
    }, 4500);

    return () => {
      if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
    };
  }, [isPlaying, isHovered, prefersReducedMotion, activeSlideIndex, handleNextSlide]);

  // Manual interaction switches slide and keeps auto-scroll running (restarts timer)
  const handleManualSlideSelect = (index: number) => {
    onSlideChange(index);
  };

  const handleManualPrev = () => {
    handlePrevSlide();
  };

  const handleManualNext = () => {
    handleNextSlide();
  };

  // Touch event handlers for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Swiped left -> next
      handleManualNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev
      handleManualPrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Scroll to CTA section
  const handleCtaClick = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentSlide = HERO_SLIDES[activeSlideIndex] || HERO_SLIDES[0];

  return (
    <div 
      className="sharepal-hero-container"
      ref={carouselContainerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Rently Category Showcase Carousel"
    >
      {/* Background Decorative Rings (Clean concentric ripple curves inspired by SharePal) */}
      <div className="hero-concentric-rings" aria-hidden="true">
        <svg viewBox="0 0 1200 600" className="rings-svg" fill="none">
          <circle cx="600" cy="240" r="160" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity="0.14" />
          <circle cx="600" cy="240" r="280" stroke="currentColor" strokeWidth="1" opacity="0.1" />
          <circle cx="600" cy="240" r="420" stroke="currentColor" strokeWidth="1" opacity="0.07" />
          <circle cx="600" cy="240" r="580" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.05" />
        </svg>
      </div>

      {/* Trust Badge Top Pill (Good for Planet · Good for Pocket) */}
      <div className="hero-trust-header-pill">
        <span className="trust-pill-tag green">
          <span className="trust-emoji">🌱</span> Good for our Planet
        </span>
        <span className="trust-pill-divider">|</span>
        <span className="trust-pill-tag blue">
          <span className="trust-emoji">👛</span> Good for your Pocket
        </span>
        <span className="trust-pill-divider">|</span>
        <span className="trust-pill-tag amber">
          <ShieldCheck size={13} className="trust-icon" /> 100% Tri-City Verified
        </span>
      </div>

      {/* Category Tab Selector Bar */}
      <nav className="hero-category-nav-dock" role="tablist" aria-label="Hero category tabs">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;
          return (
            <button
              key={slide.id}
              role="tab"
              id={`hero-tab-${idx}`}
              aria-selected={isActive}
              aria-controls={`hero-slide-panel-${idx}`}
              className={`hero-category-dock-btn ${isActive ? 'active' : ''} ${!isPlaying || isHovered ? 'paused' : ''}`}
              onClick={() => handleManualSlideSelect(idx)}
              style={isActive ? { borderColor: slide.accentColor, color: slide.accentColor } : {}}
            >
              <span className="category-dock-num">0{idx + 1}</span>
              <span className="category-dock-title">
                {slide.categoryKey === 'CARS' && '🚗 Cars'}
                {slide.categoryKey === 'CAMERAS' && '📷 Cameras'}
                {slide.categoryKey === 'GAMING' && '🎮 Gaming'}
                {slide.categoryKey === 'OUTDOORS' && '⛺ Outdoors'}
                {slide.categoryKey === 'PARTY' && '🎉 Party'}
              </span>
              {isActive && (
                <span className="category-dock-progress-line" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Dynamic Slide Content Window with key for smooth sliding entrance */}
      <div 
        key={activeSlideIndex}
        className="hero-slide-stage"
        id={`hero-slide-panel-${activeSlideIndex}`}
        role="tabpanel"
        aria-labelledby={`hero-tab-${activeSlideIndex}`}
      >
        <div className="hero-slide-inner">
          {/* Left / Center Text Column */}
          <div className="hero-slide-text-col">
            <div className="hero-category-micro-badge" style={{ color: currentSlide.accentColor, borderColor: `${currentSlide.accentColor}33` }}>
              <Sparkles size={13} />
              <span>{currentSlide.badge}</span>
            </div>

            {/* Bold Playful SharePal-style Headline with Quotes and Hand-drawn SVG accents */}
            <h1 className="sharepal-bold-headline">
              <span className="quote-mark">“</span>
              {currentSlide.headlinePrefix}
              
              {currentSlide.highlightType === 'circle' ? (
                <span className="handdrawn-circle-wrapper">
                  <span className="handdrawn-text">{currentSlide.headlineHighlight}</span>
                  <svg className="handdrawn-circle-svg" viewBox="0 0 160 65" fill="none" preserveAspectRatio="none" aria-hidden="true">
                    <path
                      d="M8 32 C12 12, 148 10, 152 30 C156 50, 20 58, 12 36"
                      stroke={currentSlide.accentColor}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : (
                <span className="handdrawn-underline-wrapper">
                  <span className="handdrawn-text">{currentSlide.headlineHighlight}</span>
                  <svg className="handdrawn-underline-svg" viewBox="0 0 180 20" fill="none" preserveAspectRatio="none" aria-hidden="true">
                    <path
                      d="M4 14 Q45 4, 90 12 T176 10"
                      stroke={currentSlide.accentColor}
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              )}

              {currentSlide.headlineSuffix}
              <span className="quote-mark">”</span>
            </h1>

            {/* Supporting Sentence */}
            <p className="sharepal-hero-subtext">
              {currentSlide.subhead}
            </p>

            {/* Quick Specs / Perks Chips */}
            <div className="hero-perks-row" aria-label="Key highlights">
              {currentSlide.perks.map((perk, i) => (
                <span key={i} className="hero-perk-pill">
                  <span className="perk-check">✓</span> {perk}
                </span>
              ))}
            </div>

            {/* Primary Slide CTA */}
            <div className="hero-slide-cta-row">
              <button
                type="button"
                className="sharepal-primary-slide-btn"
                style={{ background: currentSlide.accentColor }}
                onClick={() => handleCtaClick(currentSlide.ctaTargetId)}
              >
                <span>{currentSlide.ctaText}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Product Cutouts & Restrained Moving Artwork Column */}
          <div className="hero-slide-artwork-col" aria-hidden="true">
            {/* CARS SLIDE ARTWORK */}
            {currentSlide.categoryKey === 'CARS' && (
              <div className="artwork-stage car-stage">
                <div className="floating-cutout main-car float-soft">
                  <svg viewBox="0 0 420 220" className="artwork-svg car-cutout-svg">
                    <defs>
                      <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="60%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#020617" />
                      </linearGradient>
                      <linearGradient id="yellowPlate" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#eab308" />
                      </linearGradient>
                      <linearGradient id="carGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Shadow base */}
                    <ellipse cx="210" cy="195" rx="170" ry="18" fill="rgba(0,0,0,0.18)" />
                    {/* Car Silhouette SUV */}
                    <path d="M50 160 L70 125 L130 95 L260 90 L320 120 L370 135 L385 165 L375 178 L345 178 Q335 150 295 150 Q255 150 245 178 L145 178 Q135 150 95 150 Q55 150 45 178 Z" fill="url(#carBodyGrad)" stroke="#334155" strokeWidth="2" />
                    {/* Roof Rack & Mountain Carrier */}
                    <rect x="135" y="80" width="130" height="8" rx="3" fill="#64748b" />
                    <rect x="155" y="70" width="90" height="10" rx="4" fill="#0284c7" />
                    {/* Windows */}
                    <path d="M138 100 L185 100 L185 130 L95 130 Z" fill="#93c5fd" opacity="0.65" />
                    <path d="M195 100 L255 100 L295 130 L195 130 Z" fill="#93c5fd" opacity="0.65" />
                    {/* Headlight beam */}
                    <polygon points="380,140 420,130 420,175 380,165" fill="url(#carGlow)" />
                    {/* Wheels */}
                    <circle cx="95" cy="178" r="30" fill="#0f172a" stroke="#475569" strokeWidth="4" />
                    <circle cx="95" cy="178" r="14" fill="#94a3b8" />
                    <circle cx="295" cy="178" r="30" fill="#0f172a" stroke="#475569" strokeWidth="4" />
                    <circle cx="295" cy="178" r="14" fill="#94a3b8" />
                    {/* Commercial Yellow Plate Badge */}
                    <rect x="365" y="152" width="40" height="16" rx="3" fill="url(#yellowPlate)" />
                    <text x="385" y="164" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#000">PB 65</text>
                  </svg>
                </div>
                {/* Floating Badge: 100% Commercial RTO */}
                <div className="floating-artwork-badge badge-top-right float-offset-1">
                  <span className="badge-bullet yellow">●</span>
                  <div className="badge-text-group">
                    <span className="badge-strong">RTO Commercial</span>
                    <span className="badge-muted">Legal Himachal Permitted</span>
                  </div>
                </div>
                {/* Floating Badge: Fuel / Speed */}
                <div className="floating-artwork-badge badge-bottom-left float-offset-2">
                  <span className="badge-bullet green">●</span>
                  <div className="badge-text-group">
                    <span className="badge-strong">Diesel & EV Fleet</span>
                    <span className="badge-muted">250–400 km/day included</span>
                  </div>
                </div>
              </div>
            )}

            {/* CAMERAS SLIDE ARTWORK */}
            {currentSlide.categoryKey === 'CAMERAS' && (
              <div className="artwork-stage camera-stage">
                <div className="floating-cutout main-camera float-soft">
                  <svg viewBox="0 0 380 240" className="artwork-svg camera-cutout-svg">
                    <defs>
                      <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="50%" stopColor="#0369a1" />
                        <stop offset="100%" stopColor="#082f49" />
                      </linearGradient>
                    </defs>
                    {/* Camera Body */}
                    <rect x="80" y="80" width="220" height="130" rx="16" fill="#1e293b" stroke="#334155" strokeWidth="3" />
                    {/* Grip */}
                    <rect x="65" y="90" width="30" height="110" rx="8" fill="#0f172a" />
                    {/* Top dial & Flash mount */}
                    <rect x="130" y="65" width="50" height="16" rx="4" fill="#334155" />
                    <rect x="230" y="70" width="30" height="12" rx="3" fill="#475569" />
                    <circle cx="95" cy="74" r="8" fill="#ea580c" />
                    {/* Big Lens Outer Ring */}
                    <circle cx="190" cy="145" r="58" fill="#0f172a" stroke="#64748b" strokeWidth="5" />
                    <circle cx="190" cy="145" r="46" fill="url(#lensGrad)" />
                    <circle cx="178" cy="132" r="16" fill="#38bdf8" opacity="0.4" />
                    {/* Red G-Master Ring */}
                    <circle cx="190" cy="145" r="50" fill="none" stroke="#ef4444" strokeWidth="2" />
                  </svg>
                </div>
                {/* Floating Studio Mic badge */}
                <div className="floating-artwork-badge badge-top-right float-offset-1">
                  <span className="badge-bullet blue">●</span>
                  <div className="badge-text-group">
                    <span className="badge-strong">4K 120fps Vlog Kit</span>
                    <span className="badge-muted">Rode Mic + 256GB Card</span>
                  </div>
                </div>
                <div className="floating-artwork-badge badge-bottom-left float-offset-2">
                  <span className="badge-bullet green">●</span>
                  <div className="badge-text-group">
                    <span className="badge-strong">Sanitized Sensors</span>
                    <span className="badge-muted">Inspected optical glass</span>
                  </div>
                </div>
              </div>
            )}

            {/* GAMING SLIDE ARTWORK */}
            {currentSlide.categoryKey === 'GAMING' && (
              <div className="artwork-stage gaming-stage">
                <div className="floating-cutout main-gaming float-soft">
                  <svg viewBox="0 0 380 240" className="artwork-svg gaming-cutout-svg">
                    <defs>
                      <linearGradient id="psLight" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                    {/* Console Tower */}
                    <path d="M100 40 Q130 50 140 200 L90 200 Q80 100 100 40 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                    <path d="M140 50 Q160 60 170 200 L140 200 Z" fill="#0f172a" />
                    <line x1="125" y1="50" x2="135" y2="190" stroke="url(#psLight)" strokeWidth="3" />
                    {/* Wireless Controller */}
                    <rect x="180" y="90" width="160" height="95" rx="35" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" />
                    {/* Thumbsticks */}
                    <circle cx="230" cy="150" r="16" fill="#1e293b" />
                    <circle cx="280" cy="150" r="16" fill="#1e293b" />
                    {/* D-Pad & Action Buttons */}
                    <rect x="205" y="112" width="16" height="16" rx="2" fill="#475569" />
                    <circle cx="305" cy="120" r="6" fill="#38bdf8" />
                    <circle cx="318" cy="110" r="6" fill="#f43f5e" />
                    <circle cx="292" cy="110" r="6" fill="#10b981" />
                    <circle cx="305" cy="100" r="6" fill="#eab308" />
                    {/* Center Lightbar */}
                    <path d="M240 105 L270 105" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="floating-artwork-badge badge-top-right float-offset-1">
                  <span className="badge-bullet purple">●</span>
                  <div className="badge-text-group">
                    <span className="badge-strong">DualSense Controllers</span>
                    <span className="badge-muted">2x Included with cables</span>
                  </div>
                </div>
                <div className="floating-artwork-badge badge-bottom-left float-offset-2">
                  <span className="badge-bullet blue">●</span>
                  <div className="badge-text-group">
                    <span className="badge-strong">FIFA 24 + GTA 5</span>
                    <span className="badge-muted">Pre-installed SSD titles</span>
                  </div>
                </div>
              </div>
            )}

            {/* OUTDOORS SLIDE ARTWORK */}
            {currentSlide.categoryKey === 'OUTDOORS' && (
              <div className="artwork-stage outdoor-stage">
                <div className="floating-cutout main-outdoor float-soft">
                  <svg viewBox="0 0 380 240" className="artwork-svg outdoor-cutout-svg">
                    <defs>
                      <linearGradient id="tentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#16a34a" />
                        <stop offset="100%" stopColor="#15803d" />
                      </linearGradient>
                    </defs>
                    {/* Mountain background silhouettes */}
                    <polygon points="40,160 110,90 180,160" fill="#e2e8f0" opacity="0.6" />
                    <polygon points="120,160 190,70 260,160" fill="#cbd5e1" opacity="0.8" />
                    {/* Dome Tent */}
                    <path d="M90 190 Q180 80 270 190 Z" fill="url(#tentGrad)" stroke="#166534" strokeWidth="3" />
                    {/* Tent Door Opening */}
                    <path d="M150 190 Q180 110 210 190 Z" fill="#0f172a" opacity="0.75" />
                    {/* Ground Peg Lines */}
                    <line x1="90" y1="190" x2="60" y2="200" stroke="#f59e0b" strokeWidth="2" />
                    <line x1="270" y1="190" x2="300" y2="200" stroke="#f59e0b" strokeWidth="2" />
                    {/* Trekking Rucksack */}
                    <rect x="260" y="120" width="55" height="75" rx="12" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
                    <rect x="270" y="105" width="35" height="16" rx="4" fill="#f59e0b" />
                  </svg>
                </div>
                <div className="floating-artwork-badge badge-top-right float-offset-1">
                  <span className="badge-bullet green">●</span>
                  <div className="badge-text-group">
                    <span className="badge-strong">Kasol & Triund Ready</span>
                    <span className="badge-muted">3-Season Double Layer</span>
                  </div>
                </div>
                <div className="floating-artwork-badge badge-bottom-left float-offset-2">
                  <span className="badge-bullet yellow">●</span>
                  <div className="badge-text-group">
                    <span className="badge-strong">Ultralight Pack</span>
                    <span className="badge-muted">Trek poles & sleeping mat</span>
                  </div>
                </div>
              </div>
            )}

            {/* PARTY SLIDE ARTWORK */}
            {currentSlide.categoryKey === 'PARTY' && (
              <div className="artwork-stage party-stage">
                <div className="floating-cutout main-party float-soft">
                  <svg viewBox="0 0 380 240" className="artwork-svg party-cutout-svg">
                    <defs>
                      <linearGradient id="beamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    {/* Projector Body */}
                    <rect x="60" y="110" width="130" height="60" rx="10" fill="#1e293b" stroke="#475569" strokeWidth="3" />
                    <circle cx="85" cy="140" r="18" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />
                    <circle cx="85" cy="140" r="9" fill="#38bdf8" />
                    {/* Projector Light Beam */}
                    <polygon points="90,135 320,80 320,200 90,145" fill="url(#beamGrad)" />
                    {/* 100 Inch Screen Outline */}
                    <rect x="240" y="60" width="120" height="85" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" opacity="0.85" />
                    {/* Party Speaker Tower */}
                    <rect x="20" y="80" width="35" height="95" rx="8" fill="#0f172a" stroke="#d97706" strokeWidth="2" />
                    <circle cx="37" cy="105" r="10" fill="#334155" />
                    <circle cx="37" cy="145" r="12" fill="#334155" />
                  </svg>
                </div>
                <div className="floating-artwork-badge badge-top-right float-offset-1">
                  <span className="badge-bullet amber">●</span>
                  <div className="badge-text-group">
                    <span className="badge-strong">1080p Full HD</span>
                    <span className="badge-muted">3,800 Lumens High Brightness</span>
                  </div>
                </div>
                <div className="floating-artwork-badge badge-bottom-left float-offset-2">
                  <span className="badge-bullet green">●</span>
                  <div className="badge-text-group">
                    <span className="badge-strong">Hostel Movie Nights</span>
                    <span className="badge-muted">HDMI & Bluetooth Sync</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls: Prev, Next, Slide Indicator & Play/Pause */}
      <div className="hero-carousel-controls-bar">
        {/* Prev Button */}
        <button
          type="button"
          className="hero-nav-arrow-btn"
          onClick={handleManualPrev}
          aria-label="Previous category slide"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Labeled Progress Dots */}
        <div className="hero-slide-dots-group" role="tablist" aria-label="Slide indicators">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              className={`hero-dot-pill ${idx === activeSlideIndex ? 'active' : ''} ${!isPlaying || isHovered ? 'paused' : ''}`}
              onClick={() => handleManualSlideSelect(idx)}
              aria-label={`Go to slide ${idx + 1}: ${slide.badge}`}
              aria-selected={idx === activeSlideIndex}
            >
              <span className="dot-fill" />
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          type="button"
          className="hero-nav-arrow-btn"
          onClick={handleManualNext}
          aria-label="Next category slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Play / Pause Toggle Button */}
        <button
          type="button"
          className="hero-play-pause-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause auto-sliding' : 'Resume auto-sliding'}
          title={isPlaying ? 'Pause auto-scroll' : 'Resume auto-scroll'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>
    </div>
  );
};
