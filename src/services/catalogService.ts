import { getListingsWithDynamicDistance, LOCALITIES, LISTINGS } from '../data/mockData';
import type { ListingItem, LocalityOption } from '../data/mockData';
import { calculateDistanceKm } from '../utils/geoUtils';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { listingManagerService } from './listingManagerService';

export interface ListingFilters {
  category?: 'ALL' | 'RENT' | 'ROOM_ESSENTIAL' | 'BUY_USED' | 'MAKER';
  searchQuery?: string;
  maxDistanceKm?: number;
  maxPrice?: number;
  deliveryOnly?: boolean;
  fuel?: string[];
  transmission?: string[];
}

export interface ListingDraft {
  title: string;
  category: 'CAR' | 'ROOM_ESSENTIAL' | 'ELECTRONICS' | 'RESALE' | 'MAKER';
  mode: 'RENT' | 'BUY_USED' | 'MAKER';
  price: number;
  priceUnit: string;
  deposit: number;
  location: string;
  hubLocalityId: string;
  primaryImage: string;
  description?: string;
  sellerName?: string;
  sellerPhone?: string;
}

export function getUserCreatedListings(): ListingItem[] {
  try {
    // Only return listings with status 'PUBLISHED' (public to internet)
    const published = listingManagerService.getPublishedListings();
    return published.filter(item => item.status === 'PUBLISHED' || item.status === undefined);
  } catch {
    return [];
  }
}

let hasAttemptedSeed = false;

export const catalogService = {
  /**
   * Fetch all listings from Firestore with dynamic distance calculated from user's selected locality.
   * Auto-seeds mock catalog into Firestore on first connect.
   * Falls back gracefully to local mock dataset if Firestore is unconfigured or offline.
   */
  async getListings(locality: LocalityOption = LOCALITIES[0]): Promise<ListingItem[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = collection(db, 'listings');
        const snap = await getDocs(colRef);

        if (!snap.empty) {
          const cloudItems: ListingItem[] = [];
          snap.forEach(d => {
            const data = d.data() as ListingItem;
            const distance = calculateDistanceKm(locality.coordinates, data.coordinates || locality.coordinates);
            cloudItems.push({
              ...data,
              distanceKm: distance
            });
          });
          return cloudItems;
        }

        // Auto-seed Firestore on first cloud launch
        if (!hasAttemptedSeed && snap.empty) {
          hasAttemptedSeed = true;
          console.info('[Firestore] Seeding initial marketplace catalog to Cloud Firestore...');
          const batch = writeBatch(db);
          for (const item of LISTINGS) {
            const itemRef = doc(db, 'listings', item.id);
            batch.set(itemRef, {
              ...item,
              status: 'PUBLISHED',
              createdAt: new Date().toISOString()
            });
          }
          await batch.commit();
          console.info('[Firestore] Seed complete: 36 items uploaded to Cloud Firestore.');
        }
      } catch (err) {
        console.warn('[Firestore] Falling back to local catalog due to Firestore read failure:', err);
      }
    }

    // Local / Offline fallback
    const baseListings = getListingsWithDynamicDistance(locality);
    const userListings = getUserCreatedListings();

    const dynamicUserListings = userListings.map(item => {
      const matchedHub = LOCALITIES.find(l => l.id === item.hubLocalityId) || locality;
      return {
        ...item,
        distanceKm: item.hubLocalityId === locality.id ? 0.8 : 4.5,
        coordinates: matchedHub.coordinates
      };
    });

    return [...dynamicUserListings, ...baseListings];
  },

  /**
   * Look up a single listing by ID.
   */
  async getListingById(id: string, locality: LocalityOption = LOCALITIES[0]): Promise<ListingItem | null> {
    const all = await this.getListings(locality);
    return all.find(item => item.id === id) || null;
  },

  /**
   * Create and publish a new user listing.
   * Persists both to Firestore cloud and local device cache.
   */
  async createListing(draft: ListingDraft, currentLocality: LocalityOption): Promise<ListingItem> {
    return listingManagerService.createListing(
      {
        ...draft,
        condition: 'Excellent (Verified)'
      },
      true, // publish online
      null,
      currentLocality
    );
  }
};

