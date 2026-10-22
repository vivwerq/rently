/**
 * Rently Tri-City API Client
 * Seamlessly interfaces with the Fastify modular API (/api/v1)
 * with robust offline fallbacks.
 */

export interface ServiceabilityResponse {
  serviceable: boolean;
  distanceToNearestHubKm: number;
  deliveryAvailable: boolean;
  estimatedDeliveryFee: number;
  safeHandoverSpot: string;
  message: string;
}

export interface QuoteBreakdownResponse {
  success: boolean;
  listingId: string;
  title: string;
  category: string;
  breakdown: {
    days: number;
    baseRatePerDay: number;
    baseRentalTotal: number;
    securityDeposit: number;
    originalDeposit: number;
    studentDepositDiscount: number;
    platformFee: number;
    gstTax: number;
    deliveryFee: number;
    totalPayableNow: number;
  };
  policies: {
    cancellationPolicy: string;
    depositRefundPolicy: string;
    fuelPolicy?: string;
    kmAllowance?: string;
  };
}

export interface HoldResponse {
  success: boolean;
  holdId: string;
  listingId: string;
  startDate: string;
  endDate: string;
  expiresAt: string;
  ttlSeconds: number;
}

export interface LedgerAuditResponse {
  success: boolean;
  timestamp: string;
  report: {
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
    discrepancy: number;
    accounts: Array<{
      id: string;
      name: string;
      type: string;
      balance: number;
      description: string;
    }>;
    recentEntries: Array<{
      id: string;
      transactionId: string;
      timestamp: string;
      referenceType: string;
      referenceId: string;
      debitAccountName: string;
      creditAccountName: string;
      amount: number;
      description: string;
    }>;
    summary: {
      totalEscrowHeld: number;
      totalPlatformRevenue: number;
      totalSupplierPayables: number;
      totalSettledRefunds: number;
    };
  };
}

const API_BASE = '/api';

export const apiClient = {
  async getHealth(): Promise<{ status: string; uptimeSeconds: number } | null> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async checkServiceability(localityId?: string, lat?: number, lng?: number): Promise<ServiceabilityResponse | null> {
    try {
      const params = new URLSearchParams();
      if (localityId) params.set('localityId', localityId);
      if (lat && lng) {
        params.set('lat', lat.toString());
        params.set('lng', lng.toString());
      }
      const res = await fetch(`${API_BASE}/v1/geo/serviceability?${params.toString()}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getQuote(listingId: string, days = 1, userId = 'usr-demo-student'): Promise<QuoteBreakdownResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/v1/bookings/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, days, userId })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async acquireHold(listingId: string, startDate: string, endDate: string, userId?: string): Promise<HoldResponse | { error: string }> {
    try {
      const res = await fetch(`${API_BASE}/v1/bookings/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, startDate, endDate, userId })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Failed to lock asset.' };
      return data;
    } catch {
      // Local fallback hold for offline / client-only mode
      const holdId = `HOLD-LOCAL-${Date.now()}`;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      return {
        success: true,
        holdId,
        listingId,
        startDate,
        endDate,
        expiresAt,
        ttlSeconds: 900
      };
    }
  },

  async checkHoldStatus(holdId: string): Promise<{ success: boolean; active: boolean; ttlSeconds: number; expiresAt: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/v1/bookings/hold/${holdId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async releaseHold(holdId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/v1/bookings/hold/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdId })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getLedgerAudit(): Promise<LedgerAuditResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/v1/ledger/audit`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
};
