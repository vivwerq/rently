import { getAdminDb } from './firebaseAdmin.ts';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocalityOption {
  id: string;
  name: string;
  type: 'CAMPUS' | 'CITY_SECTOR';
  studentCount?: string;
  catchment: string;
  safeHandoverSpot: string;
  coordinates: Coordinates;
}

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
  campusEligible: boolean;
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
    ageMonths: number;
    defectDisclosed?: string;
  };
}

export interface AvailabilityHold {
  id: string;
  listingId: string;
  startDate: string;
  endDate: string;
  expiresAt: number; // Unix timestamp ms
  status: 'HOLD_ACTIVE' | 'CONFIRMED' | 'EXPIRED';
  userId?: string;
}

export interface ServerOrder {
  id: string;
  listingId: string;
  title: string;
  category: 'CAR' | 'ROOM_ESSENTIAL' | 'ELECTRONICS' | 'RESALE' | 'MAKER';
  primaryImage: string;
  status: 'CONFIRMED' | 'HANDOVER_IN_PROGRESS' | 'ACTIVE_TRIP' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  totalPayableNow: number;
  securityDeposit: number;
  handoverOtp: string;
  handoverLocation: string;
  rentalDuration?: string;
  operatorName?: string;
  regNumber?: string;
  buyerContact?: string;
  customText?: string;
  leadDays?: number;
  paymentId?: string;
  paymentStatus?: 'PAID' | 'ESCROW_HELD' | 'REFUNDED';
  razorpayOrderId?: string;
  operatorId?: string;
  handoverVerifiedAt?: string;
  completedAt?: string;
}

export interface InspectionRecord {
  orderId: string;
  type: 'PICKUP' | 'RETURN';
  odometerReadingKm: number;
  fuelLevelPercent: number;
  photos: string[]; // Angle descriptions / URLs
  timestamp: string;
  inspectorName: string;
  verifiedJointly: boolean;
}

export function calculateDistanceKm(from: Coordinates, to: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = (to.lat - from.lat) * (Math.PI / 180);
  const dLon = (to.lng - from.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from.lat * (Math.PI / 180)) *
    Math.cos(to.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

export const LOCALITIES: LocalityOption[] = [
  {
    id: 'CU_GHARUAN',
    name: 'Chandigarh University (CU)',
    type: 'CAMPUS',
    studentCount: '45,000+ Students',
    catchment: 'Gharuan & Kharar PGs',
    safeHandoverSpot: 'Gate 2 Main Entrance / Food Court',
    coordinates: { lat: 30.7700, lng: 76.5760 }
  },
  {
    id: 'PU_CHANDIGARH',
    name: 'Panjab University (PU)',
    type: 'CAMPUS',
    studentCount: '20,000+ Students',
    catchment: 'Sectors 14, 15 & 25',
    safeHandoverSpot: 'Stu-C (Student Centre) Fountain',
    coordinates: { lat: 30.7600, lng: 76.7680 }
  },
  {
    id: 'CGC_LANDRAN',
    name: 'CGC Landran & Jhanjeri',
    type: 'CAMPUS',
    studentCount: '25,000+ Students',
    catchment: 'Landran Road & Sector 71',
    safeHandoverSpot: 'CGC Admin Block Gate 1',
    coordinates: { lat: 30.6900, lng: 76.6660 }
  },
  {
    id: 'PEC_CHANDIGARH',
    name: 'Punjab Engineering College (PEC)',
    type: 'CAMPUS',
    studentCount: '8,000+ Students',
    catchment: 'Sector 12 & Naya Gaon',
    safeHandoverSpot: 'PEC Market Gate',
    coordinates: { lat: 30.7650, lng: 76.7860 }
  },
  {
    id: 'KNOWLEDGE_CITY',
    name: 'Knowledge City (ISB, IISER, NIPER)',
    type: 'CAMPUS',
    studentCount: '5,000+ Researchers',
    catchment: 'Sector 81 & Sector 67 Mohali',
    safeHandoverSpot: 'IISER Main Gate Hub',
    coordinates: { lat: 30.6660, lng: 76.7320 }
  },
  {
    id: 'PLAKSHA_MOHALI',
    name: 'Plaksha University',
    type: 'CAMPUS',
    studentCount: '2,000+ Students',
    catchment: 'IT City Mohali, Sector 101',
    safeHandoverSpot: 'Plaksha Security Desk Gate',
    coordinates: { lat: 30.6200, lng: 76.7200 }
  },
  {
    id: 'MOHALI_PHASE_7',
    name: 'Mohali Phase 7 & 3B2',
    type: 'CITY_SECTOR',
    catchment: 'Food Streets & PGs',
    safeHandoverSpot: 'Phase 7 Commercial Complex',
    coordinates: { lat: 30.7100, lng: 76.7150 }
  },
  {
    id: 'KHARAR_TOWN',
    name: 'Kharar Town & Chajju Majra',
    type: 'CITY_SECTOR',
    catchment: 'Flyover & Kurali Highway',
    safeHandoverSpot: 'Kharar Bus Stand Transit Hub',
    coordinates: { lat: 30.7450, lng: 76.6450 }
  },
  {
    id: 'CHANDIGARH_SEC_35',
    name: 'Sector 35 & 17 Chandigarh',
    type: 'CITY_SECTOR',
    catchment: 'Commercial Heart & Sector 15 PGs',
    safeHandoverSpot: 'Sector 35 Commercial Complex',
    coordinates: { lat: 30.7250, lng: 76.7670 }
  },
  {
    id: 'ZIRAKPUR_VIP',
    name: 'Zirakpur VIP Road',
    type: 'CITY_SECTOR',
    catchment: 'VIP Road & High Ground',
    safeHandoverSpot: 'VIP Road Central Mall',
    coordinates: { lat: 30.6420, lng: 76.8200 }
  }
];

export const INITIAL_LISTINGS: ListingItem[] = [
  {
    id: 'car-1',
    title: 'Hyundai Creta SX (O) Diesel AT (2024)',
    category: 'CAR',
    mode: 'RENT',
    price: 2800,
    priceUnit: '/day',
    deposit: 3000,
    condition: 'Fleet Maintained',
    location: 'Mohali Phase 7 (Operator Hub)',
    distanceKm: 0.8,
    coordinates: { lat: 30.7100, lng: 76.7150 },
    hubLocalityId: 'MOHALI_PHASE_7',
    primaryImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    campusEligible: true,
    operator: {
      name: 'Tricity SelfDrive Mobility',
      verified: true,
      rating: 4.9,
      tripsCompleted: 142,
      permitVerified: true
    },
    carSpecs: {
      fuel: 'Diesel',
      transmission: 'Automatic',
      seats: 5,
      kmLimitDaily: 250,
      extraKmRate: 14,
      regNumber: 'PB65-AX-7821'
    }
  },
  {
    id: 'car-2',
    title: 'Mahindra Thar 4x4 Hard Top Diesel (2023)',
    category: 'CAR',
    mode: 'RENT',
    price: 3400,
    priceUnit: '/day',
    deposit: 4000,
    condition: 'Hill-Ready Certified',
    location: 'Sector 35, Chandigarh',
    distanceKm: 2.1,
    coordinates: { lat: 30.7250, lng: 76.7670 },
    hubLocalityId: 'CHANDIGARH_SEC_35',
    primaryImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    campusEligible: true,
    operator: {
      name: 'Northway Wheels Chandigarh',
      verified: true,
      rating: 4.8,
      tripsCompleted: 98,
      permitVerified: true
    },
    carSpecs: {
      fuel: 'Diesel',
      transmission: 'Manual',
      seats: 4,
      kmLimitDaily: 300,
      extraKmRate: 16,
      regNumber: 'CH01-TB-4419'
    }
  },
  {
    id: 'car-3',
    title: 'Maruti Suzuki Swift VXi AMT (2023)',
    category: 'CAR',
    mode: 'RENT',
    price: 1600,
    priceUnit: '/day',
    deposit: 2000,
    condition: 'High Fuel Economy',
    location: 'Kharar Flyover Hub',
    distanceKm: 1.4,
    coordinates: { lat: 30.7450, lng: 76.6450 },
    hubLocalityId: 'KHARAR_TOWN',
    primaryImage: 'https://images.unsplash.com/photo-1590362891988-f778047831d6?auto=format&fit=crop&w=800&q=80',
    campusEligible: true,
    operator: {
      name: 'Campus Swift Rentals',
      verified: true,
      rating: 4.7,
      tripsCompleted: 215,
      permitVerified: true
    },
    carSpecs: {
      fuel: 'Petrol',
      transmission: 'Automatic',
      seats: 5,
      kmLimitDaily: 250,
      extraKmRate: 11,
      regNumber: 'PB65-BZ-1932'
    }
  },
  {
    id: 'room-1',
    title: 'Engineered Wood Study Desk + Ergonomic Mesh Chair',
    category: 'ROOM_ESSENTIAL',
    mode: 'RENT',
    price: 499,
    priceUnit: '/mo',
    deposit: 500,
    condition: 'Sanitized & Spotless',
    location: 'CU Gharuan Gate 2 Hostels',
    distanceKm: 0.4,
    coordinates: { lat: 30.7700, lng: 76.5760 },
    hubLocalityId: 'CU_GHARUAN',
    primaryImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    campusEligible: true,
    operator: {
      name: 'Rently Campus Furniture Desk',
      verified: true,
      rating: 4.9,
      tripsCompleted: 310,
      permitVerified: true
    }
  },
  {
    id: 'room-2',
    title: 'Bajaj 65L Desert Air Cooler with Honeycomb Pads',
    category: 'ROOM_ESSENTIAL',
    mode: 'RENT',
    price: 599,
    priceUnit: '/mo',
    deposit: 600,
    condition: 'Descaled & Serviced',
    location: 'Kharar Landran Road PGs',
    distanceKm: 1.1,
    coordinates: { lat: 30.6900, lng: 76.6660 },
    hubLocalityId: 'CGC_LANDRAN',
    primaryImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    campusEligible: true,
    operator: {
      name: 'Punjab Appliance Hub',
      verified: true,
      rating: 4.8,
      tripsCompleted: 450,
      permitVerified: true
    }
  },
  {
    id: 'resale-1',
    title: 'Hero Sprint Pro 21-Speed Mountain Bicycle',
    category: 'RESALE',
    mode: 'BUY_USED',
    price: 3800,
    priceUnit: '',
    deposit: 0,
    condition: 'Good (Tuned Gears & Dual Disc Brakes)',
    location: 'PU Chandigarh Sector 14 Gate',
    distanceKm: 1.2,
    coordinates: { lat: 30.7600, lng: 76.7680 },
    hubLocalityId: 'PU_CHANDIGARH',
    primaryImage: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    campusEligible: true,
    resaleSpecs: {
      originalPrice: 9500,
      ageMonths: 14,
      defectDisclosed: 'Minor pedal scuff; chain oiled last week'
    }
  },
  {
    id: 'maker-1',
    title: 'Custom Laser-Engraved Solid Teak Desk Organizer',
    category: 'MAKER',
    mode: 'MAKER',
    price: 850,
    priceUnit: '',
    deposit: 0,
    condition: 'Handcrafted',
    location: 'Sector 82 Industrial Area, Mohali',
    distanceKm: 3.8,
    coordinates: { lat: 30.6660, lng: 76.7320 },
    hubLocalityId: 'KNOWLEDGE_CITY',
    primaryImage: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80',
    campusEligible: true,
    makerSpecs: {
      leadDays: 3,
      customizable: true,
      materials: 'Solid Reclaimed CP Teakwood with Brass Hardware'
    }
  }
];

class DatabaseStore {
  private listings: Map<string, ListingItem> = new Map();
  private availabilityHolds: Map<string, AvailabilityHold> = new Map();
  private orders: Map<string, ServerOrder> = new Map();
  private inspections: Map<string, InspectionRecord[]> = new Map();

  constructor() {
    for (const item of INITIAL_LISTINGS) {
      this.listings.set(item.id, item);
    }

    // Seed default orders
    this.orders.set('ORD-482910', {
      id: 'ORD-482910',
      listingId: 'car-1',
      title: 'Hyundai Creta SX (O) Diesel AT (2024)',
      category: 'CAR',
      primaryImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      status: 'CONFIRMED',
      createdAt: 'Today, 2:15 PM',
      totalPayableNow: 5600,
      securityDeposit: 2400,
      handoverOtp: '482910',
      handoverLocation: 'Mohali Phase 7 (Operator Hub)',
      rentalDuration: '2 Days',
      operatorName: 'Tricity SelfDrive Mobility',
      regNumber: 'PB65-AX-7821'
    });
  }

  public getListings(userLocality: LocalityOption): ListingItem[] {
    return Array.from(this.listings.values()).map(item => {
      const distance = calculateDistanceKm(userLocality.coordinates, item.coordinates);
      return {
        ...item,
        distanceKm: distance
      };
    });
  }

  public getListingById(id: string, userLocality: LocalityOption): ListingItem | null {
    const item = this.listings.get(id);
    if (!item) return null;
    const distance = calculateDistanceKm(userLocality.coordinates, item.coordinates);
    return {
      ...item,
      distanceKm: distance
    };
  }

  public addListing(item: ListingItem): ListingItem {
    this.listings.set(item.id, item);
    const adminDb = getAdminDb();
    if (adminDb) {
      adminDb.collection('listings').doc(item.id).set(item, { merge: true }).catch(err => {
        console.warn('[Firebase Admin] Failed to sync listing to Firestore:', err);
      });
    }
    return item;
  }

  /**
   * Atomic Hold Engine:
   * Acquires a 15-minute countdown reservation lock.
   * Throws if an active hold exists for overlapping dates.
   */
  public acquireHold(listingId: string, startDate: string, endDate: string, userId?: string): AvailabilityHold {
    const now = Date.now();
    this.purgeExpiredHolds();

    // Check for existing overlapping active holds or bookings
    for (const hold of this.availabilityHolds.values()) {
      if (hold.listingId === listingId && hold.status === 'HOLD_ACTIVE') {
        const hasOverlap = (new Date(startDate) < new Date(hold.endDate)) && (new Date(endDate) > new Date(hold.startDate));
        if (hasOverlap) {
          throw new Error('This asset is temporarily locked by another customer. Please retry in 15 minutes.');
        }
      }
    }

    const holdId = `HOLD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const expiresAt = now + 15 * 60 * 1000; // 15 minutes TTL

    const hold: AvailabilityHold = {
      id: holdId,
      listingId,
      startDate,
      endDate,
      expiresAt,
      status: 'HOLD_ACTIVE',
      userId
    };

    this.availabilityHolds.set(holdId, hold);

    const adminDb = getAdminDb();
    if (adminDb) {
      adminDb.collection('holds').doc(holdId).set(hold, { merge: true }).catch(err => {
        console.warn('[Firebase Admin] Failed to sync hold to Firestore:', err);
      });
    }

    return hold;
  }

  public confirmHold(holdId: string): boolean {
    const hold = this.availabilityHolds.get(holdId);
    if (hold && hold.status === 'HOLD_ACTIVE' && hold.expiresAt > Date.now()) {
      hold.status = 'CONFIRMED';
      const adminDb = getAdminDb();
      if (adminDb) {
        adminDb.collection('holds').doc(holdId).update({ status: 'CONFIRMED' }).catch(err => {
          console.warn('[Firebase Admin] Failed to confirm hold in Firestore:', err);
        });
      }
      return true;
    }
    return false;
  }

  public getHold(holdId: string): AvailabilityHold | null {
    const hold = this.availabilityHolds.get(holdId);
    if (!hold) return null;
    if (hold.status === 'HOLD_ACTIVE' && hold.expiresAt <= Date.now()) {
      hold.status = 'EXPIRED';
    }
    return hold;
  }

  public releaseHold(holdId: string): boolean {
    const hold = this.availabilityHolds.get(holdId);
    if (hold && hold.status === 'HOLD_ACTIVE') {
      hold.status = 'EXPIRED';
      this.availabilityHolds.delete(holdId);
      const adminDb = getAdminDb();
      if (adminDb) {
        adminDb.collection('holds').doc(holdId).delete().catch(err => {
          console.warn('[Firebase Admin] Failed to delete released hold from Firestore:', err);
        });
      }
      return true;
    }
    return false;
  }

  public purgeExpiredHolds() {
    const now = Date.now();
    for (const [id, hold] of this.availabilityHolds.entries()) {
      if (hold.status === 'HOLD_ACTIVE' && hold.expiresAt <= now) {
        hold.status = 'EXPIRED';
        this.availabilityHolds.delete(id);
      }
    }
  }

  public getOrders(): ServerOrder[] {
    return Array.from(this.orders.values());
  }

  public getOrderById(id: string): ServerOrder | null {
    return this.orders.get(id) || null;
  }

  public saveOrder(order: ServerOrder): ServerOrder {
    this.orders.set(order.id, order);
    const adminDb = getAdminDb();
    if (adminDb) {
      adminDb.collection('bookings').doc(order.id).set(order, { merge: true }).catch(err => {
        console.warn('[Firebase Admin] Failed to persist booking to Firestore:', err);
      });
    }
    return order;
  }

  public updateOrderStatus(id: string, status: ServerOrder['status']): ServerOrder | null {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      const adminDb = getAdminDb();
      if (adminDb) {
        adminDb.collection('bookings').doc(id).update({
          status,
          updatedAt: new Date().toISOString()
        }).catch(err => {
          console.warn('[Firebase Admin] Failed to update booking status in Firestore:', err);
        });
      }
      return order;
    }
    return null;
  }

  public recordInspection(record: InspectionRecord) {
    const existing = this.inspections.get(record.orderId) || [];
    existing.push(record);
    this.inspections.set(record.orderId, existing);
    const adminDb = getAdminDb();
    if (adminDb) {
      adminDb.collection('inspections').add(record).catch(err => {
        console.warn('[Firebase Admin] Failed to record inspection in Firestore:', err);
      });
    }
  }

  public getInspections(orderId: string): InspectionRecord[] {
    return this.inspections.get(orderId) || [];
  }
}

export const dbStore = new DatabaseStore();
