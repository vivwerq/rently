import { LOCALITIES } from '../data/mockData';
import type { ListingItem, LocalityOption } from '../data/mockData';
import type { RentlyUserProfile } from '../types/auth';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

export const PUBLISHED_LISTINGS_KEY = 'rently_published_listings_v1';
export const LOCAL_CACHE_LISTINGS_KEY = 'rently_local_cached_listings_v1';

export interface ListingDraftInput {
  title: string;
  category: 'CAR' | 'ROOM_ESSENTIAL' | 'ELECTRONICS' | 'RESALE' | 'MAKER';
  mode: 'RENT' | 'BUY_USED' | 'MAKER';
  price: number;
  priceUnit: string;
  deposit: number;
  condition: string;
  location: string;
  hubLocalityId: string;
  primaryImage: string;
  description?: string;
  sellerName?: string;
  sellerPhone?: string;
  verificationDoc?: string;
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
}

// Pre-seeded listings for demo user so dashboard is immediately rich and interactive
const INITIAL_DEMO_PUBLISHED: ListingItem[] = [
  {
    id: 'user-pub-101',
    title: 'BenQ 27" 4K Designer Monitor with Ergonomic Desk Arm',
    category: 'ELECTRONICS',
    mode: 'RENT',
    price: 650,
    priceUnit: '/mo',
    deposit: 1500,
    condition: 'Excellent',
    location: 'Hostel Block 3, CU Gharuan Campus',
    hubLocalityId: 'CU_GHARUAN',
    coordinates: { lat: 30.7700, lng: 76.5760 },
    distanceKm: 0.5,
    primaryImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    description: 'Perfect for CS coding, UI design and split-window assignments. Includes HDMI 2.1 cable, Type-C 65W charging hub, and desk clamp.',
    sellerName: 'Amanpreet Singh (Host)',
    sellerPhone: '+91 98765 43210',
    status: 'PUBLISHED',
    isLocalCache: false,
    viewsCount: 142,
    inquiriesCount: 8,
    createdAt: '2026-10-18T10:30:00.000Z',
    updatedAt: '2026-10-18T10:30:00.000Z',
    verificationDoc: 'CU Student Roll: 21BCS4829 (Verified)',
    campusEligible: true,
    operator: {
      name: 'Amanpreet Singh (Verified Host)',
      verified: true,
      rating: 5.0,
      tripsCompleted: 12,
      permitVerified: true
    },
    electronicsSpecs: {
      warrantyMonths: 8,
      batteryHealth: 'N/A (Direct AC)',
      chargerIncluded: true,
      originalBill: true
    }
  }
];

const INITIAL_DEMO_LOCAL_DRAFT: ListingItem[] = [
  {
    id: 'user-draft-202',
    title: 'Sony WH-1000XM5 Active Noise Cancelling Headphones',
    category: 'ELECTRONICS',
    mode: 'RENT',
    price: 350,
    priceUnit: '/day',
    deposit: 2000,
    condition: 'Like New',
    location: 'CU Gharuan Campus Gate 2',
    hubLocalityId: 'CU_GHARUAN',
    coordinates: { lat: 30.7700, lng: 76.5760 },
    distanceKm: 0.8,
    primaryImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-crisp ANC for exam preparation or train journeys. Stored on local device cache until verified with standard host pass.',
    sellerName: 'Amanpreet Singh',
    sellerPhone: '+91 98765 43210',
    status: 'LOCAL_DRAFT',
    isLocalCache: true,
    viewsCount: 0,
    inquiriesCount: 0,
    createdAt: '2026-10-20T14:15:00.000Z',
    updatedAt: '2026-10-20T14:15:00.000Z',
    verificationDoc: '',
    campusEligible: true,
    electronicsSpecs: {
      warrantyMonths: 14,
      batteryHealth: '98% (30 hrs ANC)',
      chargerIncluded: true,
      originalBill: true
    }
  }
];

function readStorageList(key: string, fallback: ListingItem[]): ListingItem[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  } catch {
    return fallback;
  }
}

function writeStorageList(key: string, items: ListingItem[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    // Also mirror published items to sessionStorage for legacy session catalog compatibility
    if (key === PUBLISHED_LISTINGS_KEY) {
      sessionStorage.setItem('rently_user_listings_v1', JSON.stringify(items));
    }
  } catch (e) {
    console.warn(`Failed to write listings to ${key}:`, e);
  }
}

export const listingManagerService = {
  /**
   * Get all published user items (Live on Internet).
   */
  getPublishedListings(): ListingItem[] {
    return readStorageList(PUBLISHED_LISTINGS_KEY, INITIAL_DEMO_PUBLISHED);
  },

  /**
   * Get all items saved in local device cache (Offline Drafts).
   */
  getLocalCachedListings(): ListingItem[] {
    return readStorageList(LOCAL_CACHE_LISTINGS_KEY, INITIAL_DEMO_LOCAL_DRAFT);
  },

  /**
   * Get combined list of all user items.
   */
  getAllUserListings(): ListingItem[] {
    const published = this.getPublishedListings();
    const cached = this.getLocalCachedListings();
    return [...cached, ...published];
  },

  /**
   * Save a newly created item.
   * If isPublishOnline is true -> save to PUBLISHED catalog.
   * If false (or unverified) -> save to LOCAL DEVICE CACHE.
   */
  createListing(
    draft: ListingDraftInput,
    isPublishOnline: boolean,
    userProfile?: RentlyUserProfile | null,
    currentLocality: LocalityOption = LOCALITIES[0]
  ): ListingItem {
    const matchedHub = LOCALITIES.find(l => l.id === draft.hubLocalityId) || currentLocality;
    const prefix = isPublishOnline ? 'user-pub' : 'user-draft';
    const newId = `${prefix}-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const newListing: ListingItem = {
      id: newId,
      title: draft.title,
      category: draft.category,
      mode: draft.mode,
      price: draft.price,
      priceUnit: draft.priceUnit,
      deposit: draft.deposit,
      condition: draft.condition || 'Excellent',
      location: draft.location || matchedHub.name,
      hubLocalityId: matchedHub.id,
      coordinates: matchedHub.coordinates,
      distanceKm: matchedHub.id === currentLocality.id ? 0.8 : 3.5,
      primaryImage: draft.primaryImage || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      description: draft.description || '',
      sellerName: userProfile?.displayName || draft.sellerName || 'Verified Host',
      sellerPhone: userProfile?.phoneNumber || draft.sellerPhone || '+91 98765 43210',
      sellerUid: userProfile?.uid,
      status: isPublishOnline ? 'PUBLISHED' : 'LOCAL_DRAFT',
      isLocalCache: !isPublishOnline,
      viewsCount: 0,
      inquiriesCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
      verificationDoc: draft.verificationDoc,
      campusEligible: true,
      operator: {
        name: userProfile?.displayName || 'Campus Host',
        verified: Boolean(userProfile?.isListingVerified || userProfile?.isStudentVerified),
        rating: 5.0,
        tripsCompleted: 0,
        permitVerified: Boolean(userProfile?.drivingLicenseVerified || userProfile?.isListingVerified)
      },
      carSpecs: draft.carSpecs,
      makerSpecs: draft.makerSpecs,
      resaleSpecs: draft.resaleSpecs,
      roomEssentialSpecs: draft.roomEssentialSpecs,
      electronicsSpecs: draft.electronicsSpecs
    };

    if (isPublishOnline) {
      const current = this.getPublishedListings();
      writeStorageList(PUBLISHED_LISTINGS_KEY, [newListing, ...current]);
      if (isFirebaseConfigured() && db) {
        setDoc(doc(db, 'listings', newListing.id), newListing).catch(err => {
          console.warn('[Firestore] Failed to publish listing to cloud:', err);
        });
      }
    } else {
      const current = this.getLocalCachedListings();
      writeStorageList(LOCAL_CACHE_LISTINGS_KEY, [newListing, ...current]);
    }

    return newListing;
  },

  /**
   * Move a locally cached draft to the published internet marketplace.
   * Requires standard host verification.
   */
  publishDraftToInternet(
    id: string,
    userProfile: RentlyUserProfile
  ): { success: boolean; item?: ListingItem; error?: string } {
    if (!userProfile.isListingVerified && !userProfile.isStudentVerified) {
      return {
        success: false,
        error: 'Standard User Verification is required before publishing to the live internet marketplace.'
      };
    }

    const cached = this.getLocalCachedListings();
    const itemIndex = cached.findIndex(item => item.id === id);

    if (itemIndex === -1) {
      return { success: false, error: 'Listing not found in local device cache.' };
    }

    const draftItem = cached[itemIndex];
    // Remove from local cache
    cached.splice(itemIndex, 1);
    writeStorageList(LOCAL_CACHE_LISTINGS_KEY, cached);

    // Update item attributes for public internet
    const publishedItem: ListingItem = {
      ...draftItem,
      status: 'PUBLISHED',
      isLocalCache: false,
      updatedAt: new Date().toISOString(),
      sellerName: userProfile.displayName,
      operator: {
        name: userProfile.displayName,
        verified: true,
        rating: 5.0,
        tripsCompleted: draftItem.operator?.tripsCompleted || 1,
        permitVerified: true
      }
    };

    const publishedList = this.getPublishedListings();
    writeStorageList(PUBLISHED_LISTINGS_KEY, [publishedItem, ...publishedList]);

    if (isFirebaseConfigured() && db) {
      setDoc(doc(db, 'listings', publishedItem.id), publishedItem).catch(err => {
        console.warn('[Firestore] Failed to publish draft to cloud:', err);
      });
    }

    return { success: true, item: publishedItem };
  },

  /**
   * Toggle between PUBLISHED and PAUSED.
   */
  togglePause(id: string): ListingItem | null {
    const published = this.getPublishedListings();
    const idx = published.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const item = published[idx];
    const newStatus = item.status === 'PAUSED' ? 'PUBLISHED' : 'PAUSED';
    published[idx] = {
      ...item,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    writeStorageList(PUBLISHED_LISTINGS_KEY, published);

    if (isFirebaseConfigured() && db) {
      setDoc(doc(db, 'listings', id), { status: newStatus, updatedAt: published[idx].updatedAt }, { merge: true }).catch(err => {
        console.warn('[Firestore] Failed to update listing pause status:', err);
      });
    }

    return published[idx];
  },

  /**
   * Quick update an item's fields (price, title, etc.).
   */
  updateListing(id: string, updates: Partial<ListingItem>): ListingItem | null {
    const published = this.getPublishedListings();
    const pubIdx = published.findIndex(i => i.id === id);
    if (pubIdx !== -1) {
      published[pubIdx] = { ...published[pubIdx], ...updates, updatedAt: new Date().toISOString() };
      writeStorageList(PUBLISHED_LISTINGS_KEY, published);
      if (isFirebaseConfigured() && db) {
        setDoc(doc(db, 'listings', id), updates, { merge: true }).catch(err => {
          console.warn('[Firestore] Failed to update listing on cloud:', err);
        });
      }
      return published[pubIdx];
    }

    const cached = this.getLocalCachedListings();
    const draftIdx = cached.findIndex(i => i.id === id);
    if (draftIdx !== -1) {
      cached[draftIdx] = { ...cached[draftIdx], ...updates, updatedAt: new Date().toISOString() };
      writeStorageList(LOCAL_CACHE_LISTINGS_KEY, cached);
      return cached[draftIdx];
    }

    return null;
  },

  /**
   * Delete an item from either published or local cache.
   */
  deleteListing(id: string): boolean {
    const published = this.getPublishedListings();
    const pubFiltered = published.filter(i => i.id !== id);
    if (pubFiltered.length !== published.length) {
      writeStorageList(PUBLISHED_LISTINGS_KEY, pubFiltered);
      if (isFirebaseConfigured() && db) {
        deleteDoc(doc(db, 'listings', id)).catch(err => {
          console.warn('[Firestore] Failed to delete listing from cloud:', err);
        });
      }
      return true;
    }

    const cached = this.getLocalCachedListings();
    const draftFiltered = cached.filter(i => i.id !== id);
    if (draftFiltered.length !== cached.length) {
      writeStorageList(LOCAL_CACHE_LISTINGS_KEY, draftFiltered);
      return true;
    }

    return false;
  },

  /**
   * Batch publish all local device drafts to internet once user verifies.
   */
  syncAllDraftsToInternet(userProfile: RentlyUserProfile): { publishedCount: number } {
    if (!userProfile.isListingVerified && !userProfile.isStudentVerified) {
      return { publishedCount: 0 };
    }

    const cached = this.getLocalCachedListings();
    if (cached.length === 0) return { publishedCount: 0 };

    const published = this.getPublishedListings();
    const nowIso = new Date().toISOString();

    const newlyPublished = cached.map(item => ({
      ...item,
      status: 'PUBLISHED' as const,
      isLocalCache: false,
      updatedAt: nowIso,
      operator: {
        name: userProfile.displayName,
        verified: true,
        rating: 5.0,
        tripsCompleted: 1,
        permitVerified: true
      }
    }));

    writeStorageList(PUBLISHED_LISTINGS_KEY, [...newlyPublished, ...published]);
    writeStorageList(LOCAL_CACHE_LISTINGS_KEY, []);

    if (isFirebaseConfigured() && db) {
      for (const item of newlyPublished) {
        setDoc(doc(db, 'listings', item.id), item).catch(err => {
          console.warn('[Firestore] Failed to batch sync listing to cloud:', err);
        });
      }
    }

    return { publishedCount: newlyPublished.length };
  },

  /**
   * Real-time subscription to cloud marketplace listings from Firestore.
   * Enables peer-to-peer live discovery across devices.
   */
  subscribeToRemoteListings(callback?: (items: ListingItem[]) => void): () => void {
    if (!isFirebaseConfigured() || !db) {
      return () => {};
    }

    try {
      const colRef = collection(db, 'listings');
      return onSnapshot(colRef, (snapshot) => {
        const remoteItems: ListingItem[] = [];
        snapshot.forEach(docSnap => {
          remoteItems.push(docSnap.data() as ListingItem);
        });

        if (remoteItems.length > 0) {
          const local = readStorageList(PUBLISHED_LISTINGS_KEY, []);
          const remoteIds = new Set(remoteItems.map(i => i.id));
          const localOnly = local.filter(i => !remoteIds.has(i.id));
          const merged = [...remoteItems, ...localOnly];
          writeStorageList(PUBLISHED_LISTINGS_KEY, merged);
          if (callback) callback(merged);
        }
      }, (err) => {
        console.warn('[Firestore] Listing sync listener warning:', err);
      });
    } catch (e) {
      console.warn('[Firestore] Could not initiate listing listener:', e);
      return () => {};
    }
  },

  /**
   * Calculate host performance & portfolio analytics.
   */
  getAnalytics(currentListings?: ListingItem[]) {
    const all = currentListings || this.getAllUserListings();
    const published = all.filter(i => i.status === 'PUBLISHED');
    const localDrafts = all.filter(i => i.status === 'LOCAL_DRAFT');
    const paused = all.filter(i => i.status === 'PAUSED');

    const totalViews = all.reduce((sum, i) => sum + (i.viewsCount || 0), 0);
    const totalInquiries = all.reduce((sum, i) => sum + (i.inquiriesCount || 0), 0);
    const estimatedMonthlyValue = published.reduce((sum, i) => {
      if (i.category === 'CAR') return sum + (i.price * 18); // ~18 days avg utilization
      if (i.category === 'ROOM_ESSENTIAL' || i.category === 'ELECTRONICS') return sum + i.price;
      return sum + Math.round(i.price * 0.15);
    }, 0);

    return {
      totalCount: all.length,
      publishedCount: published.length,
      localDraftsCount: localDrafts.length,
      pausedCount: paused.length,
      totalViews,
      totalInquiries,
      estimatedMonthlyValue
    };
  },

  /**
   * Storage diagnostics & size info for local device cache.
   */
  getStorageDiagnostics(currentListings?: ListingItem[]) {
    try {
      const rawDrafts = localStorage.getItem(LOCAL_CACHE_LISTINGS_KEY) || '[]';
      const rawPub = localStorage.getItem(PUBLISHED_LISTINGS_KEY) || '[]';
      const draftBytes = new Blob([rawDrafts]).size;
      const pubBytes = new Blob([rawPub]).size;
      const drafts = currentListings
        ? currentListings.filter(i => i.status === 'LOCAL_DRAFT')
        : JSON.parse(rawDrafts);
      return {
        draftsCount: drafts.length,
        draftBytesFormatted: `${(draftBytes / 1024).toFixed(1)} KB`,
        totalLocalUsageFormatted: `${((draftBytes + pubBytes) / 1024).toFixed(1)} KB`,
        isOfflineAvailable: true
      };
    } catch {
      return {
        draftsCount: 0,
        draftBytesFormatted: '0 KB',
        totalLocalUsageFormatted: '0 KB',
        isOfflineAvailable: true
      };
    }
  }
};
