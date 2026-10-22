import { calculateDistanceKm } from '../utils/geoUtils';
import type { Coordinates } from '../utils/geoUtils';

export type { Coordinates };

export interface LocalityOption {
  id: string;
  name: string;
  type: 'CAMPUS' | 'CITY_SECTOR' | 'POPULAR_CITY' | 'OTHER_CITY';
  cityName?: string;
  studentCount?: string;
  catchment: string;
  safeHandoverSpot: string;
  coordinates: Coordinates;
}

export const LOCALITIES: LocalityOption[] = [
  {
    id: 'CU_GHARUAN',
    name: 'Chandigarh University (CU)',
    cityName: 'Mohali',
    type: 'CAMPUS',
    studentCount: '45,000+ Students',
    catchment: 'Gharuan & Kharar PGs',
    safeHandoverSpot: 'Gate 2 Main Entrance / Food Court',
    coordinates: { lat: 30.7700, lng: 76.5760 }
  },
  {
    id: 'PU_CHANDIGARH',
    name: 'Panjab University (PU)',
    cityName: 'Chandigarh',
    type: 'CAMPUS',
    studentCount: '20,000+ Students',
    catchment: 'Sectors 14, 15 & 25',
    safeHandoverSpot: 'Stu-C (Student Centre) Fountain',
    coordinates: { lat: 30.7600, lng: 76.7680 }
  },
  {
    id: 'CGC_LANDRAN',
    name: 'CGC Landran & Jhanjeri',
    cityName: 'Mohali',
    type: 'CAMPUS',
    studentCount: '25,000+ Students',
    catchment: 'Landran Road & Sector 71',
    safeHandoverSpot: 'CGC Admin Block Gate 1',
    coordinates: { lat: 30.6900, lng: 76.6660 }
  },
  {
    id: 'PEC_CHANDIGARH',
    name: 'Punjab Engineering College (PEC)',
    cityName: 'Chandigarh',
    type: 'CAMPUS',
    studentCount: '8,000+ Students',
    catchment: 'Sector 12 & Naya Gaon',
    safeHandoverSpot: 'PEC Market Gate',
    coordinates: { lat: 30.7650, lng: 76.7860 }
  },
  {
    id: 'KNOWLEDGE_CITY',
    name: 'Knowledge City (ISB, IISER, NIPER)',
    cityName: 'Mohali',
    type: 'CAMPUS',
    studentCount: '5,000+ Researchers',
    catchment: 'Sector 81 & Sector 67 Mohali',
    safeHandoverSpot: 'IISER Main Gate Hub',
    coordinates: { lat: 30.6660, lng: 76.7320 }
  },
  {
    id: 'PLAKSHA_MOHALI',
    name: 'Plaksha University',
    cityName: 'Mohali',
    type: 'CAMPUS',
    studentCount: '3,000+ Tech Students',
    catchment: 'IT City Sector 101 Mohali',
    safeHandoverSpot: 'Plaksha Campus Plaza',
    coordinates: { lat: 30.6300, lng: 76.7200 }
  },
  {
    id: 'MOHALI_PHASE_7',
    name: 'Mohali Phase 7 & 3B2',
    cityName: 'Mohali',
    type: 'CITY_SECTOR',
    catchment: 'Phase 7 Market & Residential',
    safeHandoverSpot: 'Phase 7 Main Market Parking',
    coordinates: { lat: 30.7100, lng: 76.7220 }
  },
  {
    id: 'KHARAR_TOWN',
    name: 'Kharar Town & Chajju Majra',
    cityName: 'Kharar',
    type: 'CITY_SECTOR',
    catchment: 'Flyover & Kurali Highway',
    safeHandoverSpot: 'Kharar Bus Stand Transit Hub',
    coordinates: { lat: 30.7450, lng: 76.6450 }
  },
  {
    id: 'CHANDIGARH_SEC_35',
    name: 'Sector 35 & 17 Chandigarh',
    cityName: 'Chandigarh',
    type: 'CITY_SECTOR',
    catchment: 'Commercial Heart & Sector 15 PGs',
    safeHandoverSpot: 'Sector 35 Commercial Complex',
    coordinates: { lat: 30.7250, lng: 76.7670 }
  },
  {
    id: 'ZIRAKPUR_VIP',
    name: 'Zirakpur VIP Road',
    cityName: 'Zirakpur',
    type: 'CITY_SECTOR',
    catchment: 'VIP Road & High Ground',
    safeHandoverSpot: 'VIP Road Central Mall',
    coordinates: { lat: 30.6420, lng: 76.8200 }
  },
  // Popular Cities (SharePal Reference)
  {
    id: 'DELHI',
    name: 'Delhi',
    cityName: 'Delhi',
    type: 'POPULAR_CITY',
    catchment: 'Connaught Place & South Delhi',
    safeHandoverSpot: 'Connaught Place Metro Gate 1',
    coordinates: { lat: 28.6139, lng: 77.2090 }
  },
  {
    id: 'HYDERABAD',
    name: 'Hyderabad',
    cityName: 'Hyderabad',
    type: 'POPULAR_CITY',
    catchment: 'Hitec City & Banjara Hills',
    safeHandoverSpot: 'Cyber Towers Central Hub',
    coordinates: { lat: 17.3850, lng: 78.4867 }
  },
  {
    id: 'MUMBAI',
    name: 'Mumbai',
    cityName: 'Mumbai',
    type: 'POPULAR_CITY',
    catchment: 'BKC & Bandra West',
    safeHandoverSpot: 'Bandra-Kurla Complex Transit Hub',
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: 'PUNE',
    name: 'Pune',
    cityName: 'Pune',
    type: 'POPULAR_CITY',
    catchment: 'Koregaon Park & Hinjewadi',
    safeHandoverSpot: 'Hinjewadi Phase 1 Circle',
    coordinates: { lat: 18.5204, lng: 73.8567 }
  },
  {
    id: 'CHENNAI',
    name: 'Chennai',
    cityName: 'Chennai',
    type: 'POPULAR_CITY',
    catchment: 'OMR Tech Corridor & Guindy',
    safeHandoverSpot: 'Tidel Park Main Gate',
    coordinates: { lat: 13.0827, lng: 80.2707 }
  },
  {
    id: 'BANGALORE',
    name: 'Bangalore',
    cityName: 'Bangalore',
    type: 'POPULAR_CITY',
    catchment: 'Koramangala & Indiranagar',
    safeHandoverSpot: 'Sony World Junction Transit Hub',
    coordinates: { lat: 12.9716, lng: 77.5946 }
  },
  // Other Cities
  {
    id: 'FARIDABAD',
    name: 'Faridabad',
    cityName: 'Faridabad',
    type: 'OTHER_CITY',
    catchment: 'Sector 15 & Badkhal',
    safeHandoverSpot: 'Bata Chowk Metro Hub',
    coordinates: { lat: 28.4089, lng: 77.3178 }
  },
  {
    id: 'KOLKATA',
    name: 'Kolkata',
    cityName: 'Kolkata',
    type: 'OTHER_CITY',
    catchment: 'Salt Lake Sector V & Park Street',
    safeHandoverSpot: 'Karunamoyee Bus & Metro Hub',
    coordinates: { lat: 22.5726, lng: 88.3639 }
  },
  {
    id: 'GURGAON',
    name: 'Gurgaon',
    cityName: 'Gurgaon',
    type: 'OTHER_CITY',
    catchment: 'Cyber City & Golf Course Rd',
    safeHandoverSpot: 'Cyber City Rapid Metro',
    coordinates: { lat: 28.4595, lng: 77.0266 }
  },
  {
    id: 'NOIDA',
    name: 'Noida',
    cityName: 'Noida',
    type: 'OTHER_CITY',
    catchment: 'Sector 18 & Sector 62',
    safeHandoverSpot: 'Sector 18 Metro Plaza',
    coordinates: { lat: 28.5355, lng: 77.3910 }
  },
  {
    id: 'GHAZIABAD',
    name: 'Ghaziabad',
    cityName: 'Ghaziabad',
    type: 'OTHER_CITY',
    catchment: 'Indirapuram & Raj Nagar',
    safeHandoverSpot: 'Vaishali Metro Station',
    coordinates: { lat: 28.6692, lng: 77.4538 }
  }
];

export interface ListingItem {
  id: string;
  title: string;
  category: 'CAR' | 'ROOM_ESSENTIAL' | 'ELECTRONICS' | 'RESALE' | 'MAKER';
  mode: 'RENT' | 'BUY_USED' | 'MAKER';
  price: number;
  priceUnit: string;
  deposit: number;
  condition?: string;
  location: string;
  distanceKm: number;
  coordinates: Coordinates;
  hubLocalityId: string;
  primaryImage: string;
  description?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerUid?: string;
  status?: 'PUBLISHED' | 'LOCAL_DRAFT' | 'PAUSED';
  isLocalCache?: boolean;
  viewsCount?: number;
  inquiriesCount?: number;
  createdAt?: string;
  updatedAt?: string;
  verificationDoc?: string;
  operator?: {
    name: string;
    verified: boolean;
    rating: number;
    tripsCompleted: number;
    permitVerified: boolean;
  };
  carSpecs?: {
    fuel: string;
    transmission: string;
    seats: number;
    kmLimitDaily: number;
    extraKmRate: number;
    regNumber: string;
  };
  makerSpecs?: {
    leadDays: number;
    customizable: boolean;
    materials: string;
  };
  resaleSpecs?: {
    originalPrice: number;
    assistedFee: number;
    knownDefects: string;
    isNegotiable?: boolean;
    semesterBatch?: string;
  };
  roomEssentialSpecs?: {
    minTenureMonths?: number;
    freeDelivery?: boolean;
    maintenanceIncluded?: boolean;
  };
  electronicsSpecs?: {
    warrantyMonths?: number;
    batteryHealth?: string;
    chargerIncluded?: boolean;
    originalBill?: boolean;
  };
  studentPerk?: string;
  campusEligible: boolean;
}

export const LISTINGS: ListingItem[] = [
  {
    id: 'car-1',
    title: 'Hyundai Creta SX (O) Diesel AT (2024)',
    category: 'CAR',
    mode: 'RENT',
    price: 2800,
    priceUnit: '/day',
    deposit: 3000,
    location: 'Mohali Phase 7 (Operator Hub)',
    hubLocalityId: 'MOHALI_PHASE_7',
    coordinates: { lat: 30.7100, lng: 76.7220 },
    distanceKm: 2.1,
    primaryImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    operator: {
      name: 'Tricity SelfDrive Mobility',
      verified: true,
      rating: 4.9,
      tripsCompleted: 84,
      permitVerified: true
    },
    carSpecs: {
      fuel: 'Diesel',
      transmission: 'Automatic',
      seats: 5,
      kmLimitDaily: 250,
      extraKmRate: 12,
      regNumber: 'PB65-AX-7821'
    },
    studentPerk: '20% extra km on student ID for Himachal road trips',
    campusEligible: true
  },
  {
    id: 'car-2',
    title: 'Mahindra Thar 4x4 LX Hardtop (2023)',
    category: 'CAR',
    mode: 'RENT',
    price: 3600,
    priceUnit: '/day',
    deposit: 4000,
    location: 'Kharar Flyover Hub',
    hubLocalityId: 'KHARAR_TOWN',
    coordinates: { lat: 30.7450, lng: 76.6450 },
    distanceKm: 3.4,
    primaryImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    operator: {
      name: 'Apex Fleet Rentals Kharar',
      verified: true,
      rating: 4.8,
      tripsCompleted: 112,
      permitVerified: true
    },
    carSpecs: {
      fuel: 'Diesel',
      transmission: 'Manual 4x4',
      seats: 4,
      kmLimitDaily: 300,
      extraKmRate: 14,
      regNumber: 'PB10-CM-9014'
    },
    studentPerk: 'Group travel discount & zero inter-state permit markup',
    campusEligible: true
  },
  {
    id: 'car-3',
    title: 'Maruti Suzuki Swift ZXi+ (2024)',
    category: 'CAR',
    mode: 'RENT',
    price: 1400,
    priceUnit: '/day',
    deposit: 1500,
    location: 'Chandigarh Sector 35 Hub',
    hubLocalityId: 'CHANDIGARH_SEC_35',
    coordinates: { lat: 30.7250, lng: 76.7670 },
    distanceKm: 4.8,
    primaryImage: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    operator: {
      name: 'CityCruise Operator',
      verified: true,
      rating: 4.9,
      tripsCompleted: 140,
      permitVerified: true
    },
    carSpecs: {
      fuel: 'Petrol',
      transmission: 'Manual',
      seats: 5,
      kmLimitDaily: 250,
      extraKmRate: 10,
      regNumber: 'CH01-BW-4412'
    },
    studentPerk: 'Affordable PG weekend getaway package',
    campusEligible: true
  },
  {
    id: 'room-1',
    title: 'Semester PG Kit: Ergonomic High-Back Chair + Solid Study Desk',
    category: 'ROOM_ESSENTIAL',
    mode: 'RENT',
    price: 699,
    priceUnit: '/month',
    deposit: 800,
    condition: 'Like New',
    location: 'Kharar Chajju Majra (Near CU)',
    hubLocalityId: 'KHARAR_TOWN',
    coordinates: { lat: 30.7550, lng: 76.6200 },
    distanceKm: 1.2,
    primaryImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    studentPerk: '50% off deposit with college ID + free move-in delivery',
    campusEligible: true
  },
  {
    id: 'room-2',
    title: 'Bajaj 65L Desert Air Cooler with Honeycomb Pads',
    category: 'ROOM_ESSENTIAL',
    mode: 'RENT',
    price: 499,
    priceUnit: '/month',
    deposit: 600,
    condition: 'Serviced & Sanitized',
    location: 'Landran Road (Near CGC)',
    hubLocalityId: 'CGC_LANDRAN',
    coordinates: { lat: 30.6920, lng: 76.6680 },
    distanceKm: 1.8,
    primaryImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    studentPerk: 'Free seasonal servicing included',
    campusEligible: true
  },
  {
    id: 'elec-1',
    title: 'BenQ Full HD 1080p Cinema Projector + 100" Foldable Screen',
    category: 'ELECTRONICS',
    mode: 'RENT',
    price: 1100,
    priceUnit: '/day',
    deposit: 2000,
    condition: 'Excellent',
    location: 'PU Sector 14 Gate',
    hubLocalityId: 'PU_CHANDIGARH',
    coordinates: { lat: 30.7600, lng: 76.7680 },
    distanceKm: 2.7,
    primaryImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    studentPerk: 'Ideal for hostel movie nights & campus pitch decks',
    campusEligible: true
  },
  {
    id: 'resale-1',
    title: 'Hero Sprint Pro 21-Speed Alloy Mountain Cycle',
    category: 'RESALE',
    mode: 'BUY_USED',
    price: 3600,
    priceUnit: 'outright',
    deposit: 0,
    condition: 'Good (Tuned 2 weeks ago)',
    location: 'CGC Landran Campus Hostel 3',
    hubLocalityId: 'CGC_LANDRAN',
    coordinates: { lat: 30.6900, lng: 76.6660 },
    distanceKm: 0.8,
    primaryImage: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    resaleSpecs: {
      originalPrice: 9500,
      assistedFee: 149,
      knownDefects: 'Minor scratch on crossbar; brakes and gears 100% smooth'
    },
    studentPerk: 'Campus Pass-it-On direct peer transfer',
    campusEligible: true
  },
  {
    id: 'resale-2',
    title: 'Prestige 2000W Induction Cooktop + 2 Stainless Steel Pots',
    category: 'RESALE',
    mode: 'BUY_USED',
    price: 1150,
    priceUnit: 'outright',
    deposit: 0,
    condition: 'Like New (Used 1 semester)',
    location: 'CU Gharuan Gate 2 PGs',
    hubLocalityId: 'CU_GHARUAN',
    coordinates: { lat: 30.7700, lng: 76.5760 },
    distanceKm: 1.5,
    primaryImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    resaleSpecs: {
      originalPrice: 2800,
      assistedFee: 99,
      knownDefects: 'Zero defects. Working warranty slip included'
    },
    studentPerk: 'Room clearance special with OTP verification',
    campusEligible: true
  },
  {
    id: 'maker-1',
    title: 'Custom Walnut Wood Desk Organizer & Phone Stand',
    category: 'MAKER',
    mode: 'MAKER',
    price: 850,
    priceUnit: 'custom made',
    deposit: 200,
    location: 'Mohali Sector 70 Studio',
    hubLocalityId: 'MOHALI_PHASE_7',
    coordinates: { lat: 30.7020, lng: 76.7150 },
    distanceKm: 3.1,
    primaryImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    makerSpecs: {
      leadDays: 3,
      customizable: true,
      materials: 'Solid Reclaimed Teak & Walnut'
    },
    studentPerk: 'Free personalized laser-engraved college roll number or initials',
    campusEligible: true
  },
  {
    id: 'maker-2',
    title: 'Handcrafted Botanical Soy Wax Candles (Set of 3 Aromas)',
    category: 'MAKER',
    mode: 'MAKER',
    price: 499,
    priceUnit: 'pack of 3',
    deposit: 0,
    location: 'Chandigarh Sector 35 Artisan Hub',
    hubLocalityId: 'CHANDIGARH_SEC_35',
    coordinates: { lat: 30.7250, lng: 76.7670 },
    distanceKm: 4.2,
    primaryImage: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    makerSpecs: {
      leadDays: 1,
      customizable: false,
      materials: 'Pure Soy Wax, Essential Oils (Lavender, Cedar, Vanilla)'
    },
    studentPerk: '10% student study-corner discount',
    campusEligible: true
  },
  {
    id: 'car-4',
    title: 'Honda City 1.5 i-VTEC V Sedan (2023)',
    category: 'CAR',
    mode: 'RENT',
    price: 2200,
    priceUnit: '/day',
    deposit: 2500,
    location: 'Zirakpur VIP Road Hub',
    hubLocalityId: 'ZIRAKPUR_VIP',
    coordinates: { lat: 30.6420, lng: 76.8200 },
    distanceKm: 5.2,
    primaryImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    operator: {
      name: 'HighwayStar Rentals Zirakpur',
      verified: true,
      rating: 4.8,
      tripsCompleted: 98,
      permitVerified: true
    },
    carSpecs: {
      fuel: 'Petrol',
      transmission: 'Manual',
      seats: 5,
      kmLimitDaily: 250,
      extraKmRate: 11,
      regNumber: 'PB65-BB-3190'
    },
    studentPerk: 'Airport drop special with zero surcharge',
    campusEligible: true
  },
  {
    id: 'car-5',
    title: 'Maruti Suzuki Ertiga ZXi 7-Seater (2024)',
    category: 'CAR',
    mode: 'RENT',
    price: 2600,
    priceUnit: '/day',
    deposit: 3000,
    location: 'Mohali Phase 7 (Operator Hub)',
    hubLocalityId: 'MOHALI_PHASE_7',
    coordinates: { lat: 30.7100, lng: 76.7220 },
    distanceKm: 2.3,
    primaryImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    operator: {
      name: 'Tricity SelfDrive Mobility',
      verified: true,
      rating: 4.9,
      tripsCompleted: 156,
      permitVerified: true
    },
    carSpecs: {
      fuel: 'Petrol',
      transmission: 'Manual',
      seats: 7,
      kmLimitDaily: 300,
      extraKmRate: 12,
      regNumber: 'PB65-CZ-4521'
    },
    studentPerk: 'Ideal for group outings & campus team travel',
    campusEligible: true
  },
  {
    id: 'cam-1',
    title: 'Sony Alpha A7 IV Mirrorless Kit + 28-70mm f/3.5-5.6 Lens',
    category: 'ELECTRONICS',
    mode: 'RENT',
    price: 1800,
    priceUnit: '/day',
    deposit: 3000,
    condition: 'Cinema Grade · Serviced',
    location: 'Mohali Phase 7 Studio Hub',
    hubLocalityId: 'MOHALI_PHASE_7',
    coordinates: { lat: 30.7100, lng: 76.7220 },
    distanceKm: 2.4,
    primaryImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    studentPerk: '2x 128GB V90 SD cards & dual batteries included',
    campusEligible: true
  },
  {
    id: 'cam-2',
    title: 'DJI Mini 4 Pro 4K Drone Fly More Combo with RC 2 Screen Remote',
    category: 'ELECTRONICS',
    mode: 'RENT',
    price: 1600,
    priceUnit: '/day',
    deposit: 3500,
    condition: 'Like New · Sub-249g Legal',
    location: 'Chandigarh Sector 35 Hub',
    hubLocalityId: 'CHANDIGARH_SEC_35',
    coordinates: { lat: 30.7250, lng: 76.7670 },
    distanceKm: 4.5,
    primaryImage: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
    studentPerk: '3x Intelligent flight batteries & ND filter set included',
    campusEligible: true
  },
  {
    id: 'game-1',
    title: 'Sony PlayStation 5 Slim (1TB) + 2x DualSense Wireless Controllers',
    category: 'ELECTRONICS',
    mode: 'RENT',
    price: 650,
    priceUnit: '/day',
    deposit: 1500,
    condition: 'Tested · Firmware Updated',
    location: 'Kharar Chajju Majra (Near CU)',
    hubLocalityId: 'KHARAR_TOWN',
    coordinates: { lat: 30.7550, lng: 76.6200 },
    distanceKm: 1.4,
    primaryImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    studentPerk: 'Pre-loaded with EA Sports FC 24 & Spider-Man 2',
    campusEligible: true
  },
  {
    id: 'game-2',
    title: 'Xbox Series X 1TB Console + 2 Wireless Gamepads',
    category: 'ELECTRONICS',
    mode: 'RENT',
    price: 600,
    priceUnit: '/day',
    deposit: 1500,
    condition: 'Excellent',
    location: 'PU Sector 14 Gate',
    hubLocalityId: 'PU_CHANDIGARH',
    coordinates: { lat: 30.7600, lng: 76.7680 },
    distanceKm: 2.8,
    primaryImage: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80',
    studentPerk: 'Includes 100+ Game Pass Ultimate titles',
    campusEligible: true
  },
  {
    id: 'camp-1',
    title: 'Quechua MH100 3-Person Waterproof Camping Tent + 2 Sleeping Bags',
    category: 'ROOM_ESSENTIAL',
    mode: 'RENT',
    price: 450,
    priceUnit: '/day',
    deposit: 800,
    condition: 'All-Weather Waterproof · Kasol Tested',
    location: 'Kharar Flyover Hub',
    hubLocalityId: 'KHARAR_TOWN',
    coordinates: { lat: 30.7450, lng: 76.6450 },
    distanceKm: 3.2,
    primaryImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    studentPerk: 'Ground tarp and high-density foam sleeping mats included',
    campusEligible: true
  },
  {
    id: 'camp-2',
    title: 'Forclaz 60L Himalayan Trekking Rucksack + Rain Cover & Poles',
    category: 'ROOM_ESSENTIAL',
    mode: 'RENT',
    price: 250,
    priceUnit: '/day',
    deposit: 500,
    condition: 'Heavy-Duty · Sanitized',
    location: 'Chandigarh Sector 35 Hub',
    hubLocalityId: 'CHANDIGARH_SEC_35',
    coordinates: { lat: 30.7250, lng: 76.7670 },
    distanceKm: 4.6,
    primaryImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    studentPerk: 'Pair of anti-shock aluminium trekking poles included',
    campusEligible: true
  },
  {
    id: 'party-2',
    title: 'JBL PartyBox 310 High-Power 240W Bluetooth Speaker + 2 Wireless Mics',
    category: 'ELECTRONICS',
    mode: 'RENT',
    price: 950,
    priceUnit: '/day',
    deposit: 1800,
    condition: 'Deep Bass · 18h Battery',
    location: 'Mohali Phase 7 (Operator Hub)',
    hubLocalityId: 'MOHALI_PHASE_7',
    coordinates: { lat: 30.7100, lng: 76.7220 },
    distanceKm: 2.2,
    primaryImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    studentPerk: 'Trolley wheels and dual wireless karaoke microphones included',
    campusEligible: true
  }
];

/**
 * Recalculates exact dynamic distance (in km) from user's selected locality
 * to each listing's physical hub using the Haversine formula.
 */
export function getListingsWithDynamicDistance(userLocality: LocalityOption): ListingItem[] {
  return LISTINGS.map(item => ({
    ...item,
    distanceKm: calculateDistanceKm(userLocality.coordinates, item.coordinates)
  }));
}
