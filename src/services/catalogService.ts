import { getListingsWithDynamicDistance, LOCALITIES } from '../data/mockData';
import type { ListingItem, LocalityOption } from '../data/mockData';

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

import { listingManagerService } from './listingManagerService';

export function getUserCreatedListings(): ListingItem[] {
  try {
    // Only return listings with status 'PUBLISHED' (public to internet)
    const published = listingManagerService.getPublishedListings();
    return published.filter(item => item.status === 'PUBLISHED' || item.status === undefined);
  } catch {
    return [];
  }
}

export const catalogService = {
  /**
   * Fetch all listings with dynamic distance calculated from user's selected locality.
   * Merges mock listings with any user-created items submitted during this browser session.
   */
  async getListings(locality: LocalityOption = LOCALITIES[0]): Promise<ListingItem[]> {
    const baseListings = getListingsWithDynamicDistance(locality);
    const userListings = getUserCreatedListings();

    // Recompute distances for user listings as well
    const dynamicUserListings = userListings.map(item => {
      // Find locality matching item's hub
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
   * Create and publish a new user listing into sessionStorage.
   * Immediately serviceable and visible in search during the active session.
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
