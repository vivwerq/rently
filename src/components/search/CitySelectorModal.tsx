import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { LOCALITIES } from '../../data/mockData';
import type { LocalityOption } from '../../data/mockData';
import {
  DelhiLandmarkIcon,
  HyderabadLandmarkIcon,
  MumbaiLandmarkIcon,
  PuneLandmarkIcon,
  ChennaiLandmarkIcon,
  BangaloreLandmarkIcon
} from './CityLandmarkIcons';
import './rentalSearch.css';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocality: LocalityOption;
  onSelectLocality: (locality: LocalityOption) => void;
}

interface PopularCityDef {
  id: string;
  name: string;
  icon: React.FC<{ size?: number; color?: string; className?: string }>;
  localityId: string;
}

const POPULAR_CITIES: PopularCityDef[] = [
  { id: 'delhi', name: 'Delhi', icon: DelhiLandmarkIcon, localityId: 'DELHI' },
  { id: 'hyderabad', name: 'Hyderabad', icon: HyderabadLandmarkIcon, localityId: 'HYDERABAD' },
  { id: 'mumbai', name: 'Mumbai', icon: MumbaiLandmarkIcon, localityId: 'MUMBAI' },
  { id: 'pune', name: 'Pune', icon: PuneLandmarkIcon, localityId: 'PUNE' },
  { id: 'chennai', name: 'Chennai', icon: ChennaiLandmarkIcon, localityId: 'CHENNAI' },
  { id: 'bangalore', name: 'Bangalore', icon: BangaloreLandmarkIcon, localityId: 'BANGALORE' }
];

const OTHER_CITIES = [
  { id: 'faridabad', name: 'Faridabad', localityId: 'FARIDABAD' },
  { id: 'kolkata', name: 'Kolkata', localityId: 'KOLKATA' },
  { id: 'gurgaon', name: 'Gurgaon', localityId: 'GURGAON' },
  { id: 'noida', name: 'Noida', localityId: 'NOIDA' },
  { id: 'ghaziabad', name: 'Ghaziabad', localityId: 'GHAZIABAD' },
  { id: 'chandigarh', name: 'Chandigarh', localityId: 'CHANDIGARH_SEC_35' },
  { id: 'mohali', name: 'Mohali', localityId: 'MOHALI_PHASE_7' },
  { id: 'zirakpur', name: 'Zirakpur', localityId: 'ZIRAKPUR_VIP' },
  { id: 'cu_campus', name: 'CU Campus (Gharuan)', localityId: 'CU_GHARUAN' },
  { id: 'pu_campus', name: 'PU Campus (Sec 14)', localityId: 'PU_CHANDIGARH' }
];

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedLocality,
  onSelectLocality
}) => {

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCitySelect = (localityId: string, fallbackName: string) => {
    const found = LOCALITIES.find(l => l.id === localityId) || {
      id: localityId,
      name: fallbackName,
      cityName: fallbackName,
      type: 'POPULAR_CITY',
      catchment: `${fallbackName} Central`,
      safeHandoverSpot: `${fallbackName} Hub`,
      coordinates: { lat: 28.6139, lng: 77.2090 }
    } as LocalityOption;

    onSelectLocality(found);
    onClose();
  };

  const isCurrentCity = (cityName: string, localityId: string) => {
    if (selectedLocality.id === localityId) return true;
    if (selectedLocality.cityName?.toLowerCase() === cityName.toLowerCase()) return true;
    if (selectedLocality.name.toLowerCase().includes(cityName.toLowerCase())) return true;
    return false;
  };

  return (
    <div
      className="city-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-selector-title"
    >
      <div
        className="city-modal-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          className="city-modal-close-btn"
          onClick={onClose}
          aria-label="Close City Selector"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <h2 id="city-selector-title" className="city-modal-title">
          Select Your City
        </h2>

        {/* POPULAR CITIES SECTION */}
        <div className="city-section">
          <div className="city-section-divider">
            <span className="divider-line" />
            <span className="divider-text">Popular Cities</span>
            <span className="divider-line" />
          </div>

          <div className="popular-cities-grid">
            {POPULAR_CITIES.map(city => {
              const Icon = city.icon;
              const active = isCurrentCity(city.name, city.localityId);

              return (
                <button
                  key={city.id}
                  type="button"
                  className={`popular-city-card ${active ? 'active' : ''}`}
                  onClick={() => handleCitySelect(city.localityId, city.name)}
                  aria-pressed={active}
                >
                  <div className="popular-city-icon-box">
                    <Icon
                      size={48}
                      color={active ? '#4f46e5' : '#64748b'}
                      className="landmark-svg"
                    />
                  </div>
                  <span className="popular-city-name">{city.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* OTHER CITIES SECTION */}
        <div className="city-section">
          <div className="city-section-divider">
            <span className="divider-line" />
            <span className="divider-text">Other Cities</span>
            <span className="divider-line" />
          </div>

          <div className="other-cities-grid">
            {OTHER_CITIES.map(city => {
              const active = isCurrentCity(city.name, city.localityId);

              return (
                <button
                  key={city.id}
                  type="button"
                  className={`other-city-pill ${active ? 'active' : ''}`}
                  onClick={() => handleCitySelect(city.localityId, city.name)}
                  aria-pressed={active}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
