import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, X, Check, ArrowRight, Car, Camera, Gamepad2, Tent, Sparkles, AlertCircle } from 'lucide-react';
import { LOCALITIES } from '../data/mockData';
import type { LocalityOption } from '../data/mockData';
import './welcomePrompt.css';

interface WelcomePromptProps {
  currentLocality: LocalityOption;
  onSelectLocality: (locality: LocalityOption) => void;
  onSelectCategory: (categoryIndex: number) => void;
  onOpenFullLocationModal: () => void;
}

const STORAGE_KEY = 'rently_welcome_prompt_dismissed_v1';
const COOLDOWN_DAYS = 7;

export const WelcomePrompt: React.FC<WelcomePromptProps> = ({
  currentLocality,
  onSelectLocality,
  onSelectCategory,
  onOpenFullLocationModal
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCityOption, setSelectedCityOption] = useState<string>('');
  const [selectedInterest, setSelectedInterest] = useState<number>(0); // 0 = Cars
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'denied' | 'unsupported' | 'success'>('idle');
  const [geoMessage, setGeoMessage] = useState<string>('');

  useEffect(() => {
    // Check if dismissed within cooldown period
    try {
      const dismissedTimestamp = localStorage.getItem(STORAGE_KEY);
      if (dismissedTimestamp) {
        const timePassed = Date.now() - parseInt(dismissedTimestamp, 10);
        const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
        if (timePassed < cooldownMs) {
          return;
        }
      }
    } catch {
      // LocalStorage unavailable, continue without breaking
    }

    // Delay showing to ensure page is completely rendered and usable first
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  const dismissPrompt = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore
    }
  };

  // Map predefined quick buttons to actual mockData LOCALITIES
  const handleSelectQuickLocality = (key: 'CHANDIGARH' | 'MOHALI' | 'KHARAR' | 'ZIRAKPUR') => {
    setSelectedCityOption(key);
    let targetLoc: LocalityOption | undefined;

    if (key === 'CHANDIGARH') {
      targetLoc = LOCALITIES.find(l => l.id === 'CHANDIGARH_SEC_35');
    } else if (key === 'MOHALI') {
      targetLoc = LOCALITIES.find(l => l.id === 'MOHALI_PHASE_7');
    } else if (key === 'KHARAR') {
      targetLoc = LOCALITIES.find(l => l.id === 'KHARAR_TOWN');
    } else if (key === 'ZIRAKPUR') {
      targetLoc = LOCALITIES.find(l => l.id === 'ZIRAKPUR_VIP');
    }

    if (targetLoc) {
      onSelectLocality(targetLoc);
      setStep(2);
    }
  };

  // Handle Geolocation with careful error boundaries
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      setGeoMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('locating');
    setGeoMessage('Finding nearby Tri-City verified hubs...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Tri-City center is approx 30.7333° N, 76.7794° E
        // Distance check in km
        const dLat = (latitude - 30.7333) * 111;
        const dLon = (longitude - 76.7794) * 96;
        const distKm = Math.sqrt(dLat * dLat + dLon * dLon);

        if (distKm > 60) {
          setGeoStatus('unsupported');
          setGeoMessage('You appear to be outside the Tri-City service area (Chandigarh, Mohali, Kharar, Zirakpur). Showing Chandigarh as default.');
          const chd = LOCALITIES.find(l => l.id === 'CHANDIGARH_SEC_35');
          if (chd) onSelectLocality(chd);
          setTimeout(() => setStep(2), 2200);
        } else {
          setGeoStatus('success');
          setGeoMessage('Connected to Tri-City network! Mohali & Chandigarh hubs activated.');
          const mohali = LOCALITIES.find(l => l.id === 'MOHALI_PHASE_7');
          if (mohali) onSelectLocality(mohali);
          setTimeout(() => setStep(2), 1200);
        }
      },
      (error) => {
        setGeoStatus('denied');
        if (error.code === error.PERMISSION_DENIED) {
          setGeoMessage('Location permission was denied. Tap one of the city areas below.');
        } else {
          setGeoMessage('Could not retrieve GPS coordinates. Please choose your area manually.');
        }
      },
      { timeout: 7000, maximumAge: 60000 }
    );
  };

  const handleFinish = () => {
    onSelectCategory(selectedInterest);
    dismissPrompt();
    // Smoothly scroll to the relevant carousel section
    setTimeout(() => {
      const sectionIds = ['section-cars', 'section-cameras', 'section-gaming', 'section-outdoors', 'section-entertainment'];
      const targetId = selectedInterest === 5 ? 'section-cars' : sectionIds[selectedInterest];
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div
      className="welcome-prompt-container"
      role="region"
      aria-labelledby="welcome-prompt-title"
      aria-live="polite"
    >
      <div className="welcome-prompt-card">
        {/* Top bar with step pill and close button */}
        <div className="welcome-prompt-header">
          <div className="welcome-step-indicator">
            <span className={`step-dot ${step === 1 ? 'active' : 'completed'}`}>1</span>
            <span className="step-divider" />
            <span className={`step-dot ${step === 2 ? 'active' : ''}`}>2</span>
            <span className="step-label-text">
              {step === 1 ? 'Step 1 of 2 · Location' : 'Step 2 of 2 · Rentals'}
            </span>
          </div>
          <button
            type="button"
            className="welcome-close-btn"
            onClick={dismissPrompt}
            aria-label="Dismiss welcome guide"
          >
            <X size={16} />
          </button>
        </div>

        {/* STEP 1: Location */}
        {step === 1 && (
          <div className="welcome-step-body animate-fade-in">
            <h3 id="welcome-prompt-title" className="welcome-prompt-title">
              Kahan se ho? 👀
            </h3>
            <p className="welcome-prompt-subhead">
              Apna area batao—paas ki rentals dikhate hain.
            </p>

            {/* Geolocation feedback if active */}
            {geoStatus !== 'idle' && (
              <div className={`welcome-geo-banner ${geoStatus}`}>
                {geoStatus === 'locating' && <span className="geo-spinner" />}
                {geoStatus === 'denied' || geoStatus === 'unsupported' ? <AlertCircle size={14} /> : null}
                {geoStatus === 'success' && <Check size={14} />}
                <span>{geoMessage}</span>
              </div>
            )}

            {/* Quick Location Pills */}
            <div className="welcome-loc-pills-grid" role="group" aria-label="Quick location choices">
              <button
                type="button"
                className={`welcome-loc-pill ${selectedCityOption === 'CHANDIGARH' ? 'active' : ''}`}
                onClick={() => handleSelectQuickLocality('CHANDIGARH')}
              >
                <MapPin size={13} className="pill-pin-icon" />
                <span>Chandigarh</span>
              </button>

              <button
                type="button"
                className={`welcome-loc-pill ${selectedCityOption === 'MOHALI' ? 'active' : ''}`}
                onClick={() => handleSelectQuickLocality('MOHALI')}
              >
                <MapPin size={13} className="pill-pin-icon" />
                <span>Mohali / SAS Nagar</span>
              </button>

              <button
                type="button"
                className={`welcome-loc-pill ${selectedCityOption === 'KHARAR' ? 'active' : ''}`}
                onClick={() => handleSelectQuickLocality('KHARAR')}
              >
                <MapPin size={13} className="pill-pin-icon" />
                <span>Kharar</span>
              </button>

              <button
                type="button"
                className={`welcome-loc-pill ${selectedCityOption === 'ZIRAKPUR' ? 'active' : ''}`}
                onClick={() => handleSelectQuickLocality('ZIRAKPUR')}
              >
                <MapPin size={13} className="pill-pin-icon" />
                <span>Zirakpur</span>
              </button>
            </div>

            {/* Extra actions: Full list & Geolocation */}
            <div className="welcome-actions-row">
              <button
                type="button"
                className="welcome-secondary-action-btn"
                onClick={onOpenFullLocationModal}
              >
                <span>Choose another location...</span>
              </button>

              <button
                type="button"
                className="welcome-secondary-action-btn gps"
                onClick={handleUseMyLocation}
                disabled={geoStatus === 'locating'}
              >
                <Navigation size={13} />
                <span>{geoStatus === 'locating' ? 'Locating...' : 'Use my location'}</span>
              </button>
            </div>

            {/* Dismiss link */}
            <div className="welcome-bottom-dismiss-row">
              <button
                type="button"
                className="welcome-skip-link"
                onClick={dismissPrompt}
              >
                Abhi bas dekh raha hoon
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Rental Interest */}
        {step === 2 && (
          <div className="welcome-step-body animate-fade-in">
            <h3 id="welcome-prompt-title" className="welcome-prompt-title">
              Kya rent karna hai? 😄
            </h3>
            <p className="welcome-prompt-subhead">
              Selected: <strong>{currentLocality.name}</strong>. Pick a category to jump straight to live gear.
            </p>

            <div className="welcome-interests-grid" role="radiogroup" aria-label="Rental categories">
              {/* Option 0: Cars (First and visually prominent) */}
              <button
                type="button"
                role="radio"
                aria-checked={selectedInterest === 0}
                className={`welcome-interest-pill car-highlight ${selectedInterest === 0 ? 'selected' : ''}`}
                onClick={() => setSelectedInterest(0)}
              >
                <div className="interest-icon-box car">
                  <Car size={16} />
                </div>
                <div className="interest-text-box">
                  <span className="interest-main-title">Cars & SUVs</span>
                  <span className="interest-sub-tag">Priority · Yellow Plate</span>
                </div>
              </button>

              {/* Option 1: Cameras */}
              <button
                type="button"
                role="radio"
                aria-checked={selectedInterest === 1}
                className={`welcome-interest-pill ${selectedInterest === 1 ? 'selected' : ''}`}
                onClick={() => setSelectedInterest(1)}
              >
                <div className="interest-icon-box camera">
                  <Camera size={16} />
                </div>
                <div className="interest-text-box">
                  <span className="interest-main-title">Cameras</span>
                  <span className="interest-sub-tag">Vlog & DSLR</span>
                </div>
              </button>

              {/* Option 2: Gaming */}
              <button
                type="button"
                role="radio"
                aria-checked={selectedInterest === 2}
                className={`welcome-interest-pill ${selectedInterest === 2 ? 'selected' : ''}`}
                onClick={() => setSelectedInterest(2)}
              >
                <div className="interest-icon-box gaming">
                  <Gamepad2 size={16} />
                </div>
                <div className="interest-text-box">
                  <span className="interest-main-title">Gaming</span>
                  <span className="interest-sub-tag">PS5 & Xbox</span>
                </div>
              </button>

              {/* Option 3: Camping & Outdoor */}
              <button
                type="button"
                role="radio"
                aria-checked={selectedInterest === 3}
                className={`welcome-interest-pill ${selectedInterest === 3 ? 'selected' : ''}`}
                onClick={() => setSelectedInterest(3)}
              >
                <div className="interest-icon-box outdoor">
                  <Tent size={16} />
                </div>
                <div className="interest-text-box">
                  <span className="interest-main-title">Camping / Outdoor</span>
                  <span className="interest-sub-tag">Tents & Packs</span>
                </div>
              </button>

              {/* Option 4: Party Gear */}
              <button
                type="button"
                role="radio"
                aria-checked={selectedInterest === 4}
                className={`welcome-interest-pill ${selectedInterest === 4 ? 'selected' : ''}`}
                onClick={() => setSelectedInterest(4)}
              >
                <div className="interest-icon-box party">
                  <Sparkles size={16} />
                </div>
                <div className="interest-text-box">
                  <span className="interest-main-title">Party Gear</span>
                  <span className="interest-sub-tag">Projector & Audio</span>
                </div>
              </button>

              {/* Option 5: Sab dikhao */}
              <button
                type="button"
                role="radio"
                aria-checked={selectedInterest === 5}
                className={`welcome-interest-pill all ${selectedInterest === 5 ? 'selected' : ''}`}
                onClick={() => setSelectedInterest(5)}
              >
                <div className="interest-icon-box all">
                  <span>✨</span>
                </div>
                <div className="interest-text-box">
                  <span className="interest-main-title">Sab dikhao</span>
                  <span className="interest-sub-tag">Browse all rentals</span>
                </div>
              </button>
            </div>

            {/* Step 2 CTA */}
            <div className="welcome-submit-row">
              <button
                type="button"
                className="welcome-primary-cta"
                onClick={handleFinish}
              >
                <span>Rentals dikhao</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
