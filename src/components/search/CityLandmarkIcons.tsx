import React from 'react';

interface LandmarkIconProps {
  size?: number;
  color?: string;
  className?: string;
}

// 1. Delhi - India Gate Landmark Line Art
export const DelhiLandmarkIcon: React.FC<LandmarkIconProps> = ({ size = 48, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Base podium */}
    <line x1="8" y1="56" x2="56" y2="56" />
    <rect x="12" y="52" width="40" height="4" rx="1" />
    
    {/* Side Pylons / Columns */}
    <rect x="14" y="24" width="11" height="28" />
    <rect x="39" y="24" width="11" height="28" />
    
    {/* Inner Pylon Details */}
    <line x1="19.5" y1="28" x2="19.5" y2="48" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="44.5" y1="28" x2="44.5" y2="48" strokeWidth="1" strokeDasharray="2 2" />
    
    {/* Center Archway */}
    <path d="M25 52V36C25 32.134 28.134 29 32 29C35.866 29 39 32.134 39 36V52" />
    <path d="M28 52V37C28 34.7909 29.7909 33 32 33C34.2091 33 36 34.7909 36 37V52" strokeWidth="1.2" />

    {/* Arch Crown & Frieze */}
    <line x1="13" y1="24" x2="51" y2="24" />
    <rect x="14" y="19" width="36" height="5" />
    <circle cx="32" cy="21.5" r="1.2" fill={color} />
    
    {/* Upper Attic Tier */}
    <rect x="17" y="14" width="30" height="5" />
    <line x1="20" y1="14" x2="20" y2="19" strokeWidth="1" />
    <line x1="44" y1="14" x2="44" y2="19" strokeWidth="1" />
    
    {/* Top Dome / Finial */}
    <path d="M24 14C24 11 27.5 9 32 9C36.5 9 40 11 40 14" />
    <line x1="32" y1="9" x2="32" y2="6" />
    <circle cx="32" cy="5.5" r="1" fill={color} />
  </svg>
);

// 2. Hyderabad - Charminar Landmark Line Art
export const HyderabadLandmarkIcon: React.FC<LandmarkIconProps> = ({ size = 48, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Base podium */}
    <line x1="6" y1="56" x2="58" y2="56" />
    
    {/* Main Lower Arch */}
    <path d="M22 56V37C22 31.4772 26.4772 27 32 27C37.5228 27 42 31.4772 42 37V56" />
    <line x1="18" y1="56" x2="22" y2="56" />
    <line x1="42" y1="56" x2="46" y2="56" />
    
    {/* Four Minarets */}
    {/* Outer Left Minaret */}
    <rect x="10" y="20" width="6" height="36" />
    <line x1="9" y1="36" x2="17" y2="36" strokeWidth="1.2" />
    <line x1="9" y1="24" x2="17" y2="24" strokeWidth="1.2" />
    <path d="M10 20L13 10L16 20Z" fill="none" />
    <circle cx="13" cy="8.5" r="1" fill={color} />

    {/* Outer Right Minaret */}
    <rect x="48" y="20" width="6" height="36" />
    <line x1="47" y1="36" x2="55" y2="36" strokeWidth="1.2" />
    <line x1="47" y1="24" x2="55" y2="24" strokeWidth="1.2" />
    <path d="M48 20L51 10L54 20Z" fill="none" />
    <circle cx="51" cy="8.5" r="1" fill={color} />

    {/* Upper Balcony & Gallery */}
    <rect x="16" y="24" width="32" height="6" />
    <circle cx="28" cy="27" r="1" fill={color} />
    <circle cx="32" cy="27" r="1" fill={color} />
    <circle cx="36" cy="27" r="1" fill={color} />

    {/* Inner Minarets / Domes */}
    <rect x="22" y="16" width="5" height="8" />
    <path d="M22 16C22 13 24.5 11 24.5 11C24.5 11 27 13 27 16" />
    <circle cx="24.5" cy="10" r="0.8" fill={color} />

    <rect x="37" y="16" width="5" height="8" />
    <path d="M37 16C37 13 39.5 11 39.5 11C39.5 11 42 13 42 16" />
    <circle cx="39.5" cy="10" r="0.8" fill={color} />

    {/* Center Clock / Crest */}
    <circle cx="32" cy="20" r="2.5" />
  </svg>
);

// 3. Mumbai - Gateway of India Landmark Line Art
export const MumbaiLandmarkIcon: React.FC<LandmarkIconProps> = ({ size = 48, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Base */}
    <line x1="6" y1="56" x2="58" y2="56" />
    
    {/* Water ripples below podium */}
    <path d="M12 59C14 58 16 58 18 59C20 60 22 60 24 59C26 58 28 58 30 59C32 60 34 60 36 59C38 58 40 58 42 59C44 60 46 60 48 59C50 58 52 58 54 59" strokeWidth="1" />

    {/* Main Central Arch */}
    <path d="M24 56V34C24 29.5817 27.5817 26 32 26C36.4183 26 40 29.5817 40 34V56" />
    
    {/* Side Arches (Left & Right) */}
    <path d="M14 56V42C14 39.7909 15.7909 38 18 38C20.2091 38 22 39.7909 22 42V56" strokeWidth="1.2" />
    <path d="M42 56V42C42 39.7909 43.7909 38 46 38C48.2091 38 50 39.7909 50 42V56" strokeWidth="1.2" />

    {/* Outer Pillars */}
    <line x1="11" y1="24" x2="11" y2="56" />
    <line x1="53" y1="24" x2="53" y2="56" />

    {/* Upper Frieze / Cornice */}
    <rect x="10" y="20" width="44" height="4" />
    <line x1="12" y1="24" x2="52" y2="24" />

    {/* Turrets and Domes */}
    {/* Left Turret Dome */}
    <path d="M10 20C10 16 13 13 13 13C13 13 16 16 16 20" />
    <circle cx="13" cy="11.5" r="0.9" fill={color} />

    {/* Right Turret Dome */}
    <path d="M48 20C48 16 51 13 51 13C51 13 54 16 54 20" />
    <circle cx="51" cy="11.5" r="0.9" fill={color} />

    {/* Center Dome & Finials */}
    <rect x="23" y="16" width="18" height="4" />
    <path d="M26 16C26 11 32 8 32 8C32 8 38 11 38 16" />
    <line x1="32" y1="8" x2="32" y2="5" />
    <circle cx="32" cy="4.5" r="1" fill={color} />
  </svg>
);

// 4. Pune - Shaniwar Wada Fortified Gateway Line Art
export const PuneLandmarkIcon: React.FC<LandmarkIconProps> = ({ size = 48, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Ground */}
    <line x1="8" y1="56" x2="56" y2="56" />

    {/* Massive Stone Bastions Left & Right */}
    <path d="M12 56V26C12 24 14 22 17 22H23V56" />
    <path d="M41 56V22H47C50 22 52 24 52 26V56" />

    {/* Bastion Slits / Embrasures */}
    <line x1="17" y1="32" x2="17" y2="38" strokeWidth="1.2" />
    <line x1="17" y1="44" x2="17" y2="50" strokeWidth="1.2" />
    <line x1="47" y1="32" x2="47" y2="38" strokeWidth="1.2" />
    <line x1="47" y1="44" x2="47" y2="50" strokeWidth="1.2" />

    {/* Central Dilli Darwaza Gateway */}
    <path d="M25 56V36C25 31 28 28 32 28C36 28 39 31 39 36V56" />
    {/* Wooden Spiked Gate Studs */}
    <circle cx="28" cy="42" r="0.8" fill={color} />
    <circle cx="28" cy="48" r="0.8" fill={color} />
    <circle cx="36" cy="42" r="0.8" fill={color} />
    <circle cx="36" cy="48" r="0.8" fill={color} />

    {/* Fortified Battlement Parapet */}
    <path d="M12 22V18H15V20H18V18H21V20H24V18H40V20H43V18H46V20H49V18H52V22" />

    {/* Maratha Saffron Flagpole on Top */}
    <line x1="32" y1="28" x2="32" y2="10" />
    <path d="M32 10L41 14L32 18Z" fill={color} opacity="0.3" stroke={color} strokeWidth="1.2" />
  </svg>
);

// 5. Chennai - Dravidian Temple Gopuram Line Art
export const ChennaiLandmarkIcon: React.FC<LandmarkIconProps> = ({ size = 48, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Ground */}
    <line x1="8" y1="56" x2="56" y2="56" />

    {/* Bottom Base Entrance Arch */}
    <rect x="16" y="44" width="32" height="12" />
    <path d="M26 56V48C26 45 28.5 43 32 43C35.5 43 38 45 38 48V56" strokeWidth="1.4" />

    {/* Tier 1 (Widest) */}
    <path d="M18 44L20 37H44L46 44Z" />
    <line x1="26" y1="37" x2="26" y2="44" strokeWidth="1" />
    <line x1="38" y1="37" x2="38" y2="44" strokeWidth="1" />

    {/* Tier 2 */}
    <path d="M21 37L23 30H41L43 37Z" />
    <line x1="28" y1="30" x2="28" y2="37" strokeWidth="1" />
    <line x1="36" y1="30" x2="36" y2="37" strokeWidth="1" />

    {/* Tier 3 */}
    <path d="M24 30L26 23H38L40 30Z" />
    <circle cx="32" cy="26.5" r="1.2" fill={color} />

    {/* Tier 4 (Top Tier) */}
    <path d="M27 23L29 17H35L37 23Z" />

    {/* Barrel-vaulted Shikhar Roof */}
    <path d="M28 17C28 13.5 30 12 32 12C34 12 36 13.5 36 17H28Z" />

    {/* Kalasams (Finials) on Top */}
    <line x1="28.5" y1="12" x2="28.5" y2="7.5" strokeWidth="1.2" />
    <circle cx="28.5" cy="7" r="0.9" fill={color} />

    <line x1="32" y1="11" x2="32" y2="6" strokeWidth="1.4" />
    <circle cx="32" cy="5.5" r="1" fill={color} />

    <line x1="35.5" y1="12" x2="35.5" y2="7.5" strokeWidth="1.2" />
    <circle cx="35.5" cy="7" r="0.9" fill={color} />
  </svg>
);

// 6. Bangalore - Vidhana Soudha Landmark Line Art
export const BangaloreLandmarkIcon: React.FC<LandmarkIconProps> = ({ size = 48, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Base Podium & Steps */}
    <line x1="6" y1="56" x2="58" y2="56" />
    <rect x="10" y="52" width="44" height="4" />
    <line x1="14" y1="52" x2="50" y2="52" />

    {/* Main Wings Left & Right */}
    <rect x="12" y="34" width="13" height="18" />
    <rect x="39" y="34" width="13" height="18" />
    
    {/* Wing Windows */}
    <circle cx="18.5" cy="40" r="1.5" />
    <circle cx="18.5" cy="46" r="1.5" />
    <circle cx="45.5" cy="40" r="1.5" />
    <circle cx="45.5" cy="46" r="1.5" />

    {/* Central Portico with Grand Columns */}
    <rect x="25" y="32" width="14" height="20" />
    <line x1="28" y1="36" x2="28" y2="52" strokeWidth="1.4" />
    <line x1="32" y1="36" x2="32" y2="52" strokeWidth="1.4" />
    <line x1="36" y1="36" x2="36" y2="52" strokeWidth="1.4" />

    {/* Portico Pediment */}
    <path d="M23 32L32 25L41 32H23Z" />

    {/* Upper Drum Tier */}
    <rect x="27" y="21" width="10" height="4" />
    <line x1="30" y1="21" x2="30" y2="25" strokeWidth="1" />
    <line x1="34" y1="21" x2="34" y2="25" strokeWidth="1" />

    {/* Grand Central Dome */}
    <path d="M26 21C26 15 29 12 32 12C35 12 38 15 38 21" />

    {/* Side Corner Pavilions (Chhatris) */}
    <path d="M14 34C14 30 18.5 28 18.5 28C18.5 28 23 30 23 34" strokeWidth="1.2" />
    <line x1="18.5" y1="28" x2="18.5" y2="25" strokeWidth="1.2" />

    <path d="M41 34C41 30 45.5 28 45.5 28C45.5 28 50 30 50 34" strokeWidth="1.2" />
    <line x1="45.5" y1="28" x2="45.5" y2="25" strokeWidth="1.2" />

    {/* Top Ashoka Emblem Spire */}
    <line x1="32" y1="12" x2="32" y2="7" strokeWidth="1.5" />
    <circle cx="32" cy="6" r="1.2" fill={color} />
  </svg>
);

// 7. Chandigarh - Open Hand Monument Line Art
export const ChandigarhLandmarkIcon: React.FC<LandmarkIconProps> = ({ size = 48, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Trench Pit & Stepped Base */}
    <line x1="8" y1="56" x2="56" y2="56" />
    <path d="M16 56L22 48H42L48 56" />
    
    {/* Base Column / Concrete Bearing Shaft */}
    <rect x="29" y="32" width="6" height="16" />
    <line x1="27" y1="32" x2="37" y2="32" />

    {/* Le Corbusier's Open Hand Silhouette */}
    <path
      d="M32 32C30 30 26 27 24 23C22 19 23 15 26 15C28 15 29 17 30 19C30 16 31 12 34 12C36.5 12 37.5 14.5 37.5 17.5C38.5 15.5 40 14 42.5 14C45 14 46 16.5 45.5 20C46.5 19 48 18.5 49.5 19.5C51 20.5 50.5 23 48.5 25.5C45 30 38 32 32 32Z"
      fill={color}
      fillOpacity="0.08"
    />
  </svg>
);

// 8. Generic / Campus Hub Icon
export const CampusLandmarkIcon: React.FC<LandmarkIconProps> = ({ size = 48, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="56" x2="56" y2="56" />
    {/* Classical University Hall Arch with Columns */}
    <rect x="14" y="28" width="36" height="28" rx="2" />
    <line x1="20" y1="36" x2="20" y2="52" strokeWidth="1.4" />
    <line x1="26" y1="36" x2="26" y2="52" strokeWidth="1.4" />
    <line x1="38" y1="36" x2="38" y2="52" strokeWidth="1.4" />
    <line x1="44" y1="36" x2="44" y2="52" strokeWidth="1.4" />
    <path d="M29 56V44C29 42 30.5 40 32 40C33.5 40 35 42 35 44V56" />
    {/* Pediment Roof */}
    <path d="M12 28L32 14L52 28H12Z" />
    <circle cx="32" cy="22" r="2.5" />
  </svg>
);
