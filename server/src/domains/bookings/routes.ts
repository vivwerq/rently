import type { FastifyPluginAsync } from 'fastify';
import { dbStore, LOCALITIES, type ServerOrder } from '../../core/db.ts';
import { ledgerEngine } from '../../core/ledger.ts';
import { securityService } from '../../core/security.ts';

interface QuoteRequestBody {
  listingId: string;
  days?: number;
  userId?: string;
  localityId?: string;
}

interface HoldRequestBody {
  listingId: string;
  startDate: string;
  endDate: string;
  userId?: string;
}

interface ConfirmBookingBody {
  holdId?: string;
  listingId: string;
  renterName: string;
  renterPhone: string;
  userId?: string;
  days?: number;
  startDate?: string;
  endDate?: string;
  handoverLocation?: string;
  customText?: string;
}

export const bookingRoutes: FastifyPluginAsync = async (fastify) => {
  // Calculate itemized price quote
  fastify.post<{ Body: QuoteRequestBody }>('/quote', async (request, reply) => {
    const { listingId, days = 1, userId, localityId: _localityId } = request.body || {};
    if (!listingId) {
      return reply.code(400).send({ error: 'listingId is required for quote calculation.' });
    }

    const defaultLoc = LOCALITIES[0];
    const listing = dbStore.getListingById(listingId, defaultLoc);
    if (!listing) {
      return reply.code(404).send({ error: `Listing '${listingId}' not found.` });
    }

    const safeDays = Math.max(1, days);
    const baseRent = listing.price * safeDays;

    // Check student status for deposit discount
    const isStudent = userId ? Boolean(securityService.getStudentStatus(userId)) : false;
    const standardDeposit = listing.deposit;
    const depositWaiver = isStudent ? Math.round(standardDeposit * 0.5) : 0;
    const finalDeposit = standardDeposit - depositWaiver;

    // Platform fee (5% or min ₹99 for cars, ₹49 for others)
    const platformFee = listing.category === 'CAR' ? Math.max(149, Math.round(baseRent * 0.05)) : 49;
    const gstTax = Math.round((baseRent + platformFee) * 0.05); // 5% GST on transport/rental service

    // Campus gate handover fee is ₹0
    const deliveryFee = 0;
    const totalPayableNow = baseRent + finalDeposit + platformFee + gstTax + deliveryFee;

    return reply.send({
      success: true,
      listingId,
      title: listing.title,
      category: listing.category,
      breakdown: {
        days: safeDays,
        baseRatePerDay: listing.price,
        baseRentalTotal: baseRent,
        securityDeposit: finalDeposit,
        originalDeposit: standardDeposit,
        studentDepositDiscount: depositWaiver,
        platformFee,
        gstTax,
        deliveryFee,
        totalPayableNow
      },
      policies: {
        cancellationPolicy: 'Full refund up to 6 hours before trip start.',
        depositRefundPolicy: 'Auto-released within 2 hours of return inspection verification.',
        fuelPolicy: listing.category === 'CAR' ? 'Return at same level as pickup (verified in digital checklist).' : undefined,
        kmAllowance: listing.carSpecs ? `${listing.carSpecs.kmLimitDaily * safeDays} km included` : undefined
      }
    });
  });

  // Acquire 15-minute countdown atomic hold lock
  fastify.post<{ Body: HoldRequestBody }>('/hold', async (request, reply) => {
    const { listingId, startDate, endDate, userId } = request.body || {};
    if (!listingId || !startDate || !endDate) {
      return reply.code(400).send({
        error: 'listingId, startDate, and endDate are required to acquire a hold.'
      });
    }

    try {
      const hold = dbStore.acquireHold(listingId, startDate, endDate, userId);
      const remainingSeconds = Math.max(0, Math.floor((hold.expiresAt - Date.now()) / 1000));

      return reply.send({
        success: true,
        message: 'Asset locked exclusively for 15 minutes.',
        holdId: hold.id,
        listingId: hold.listingId,
        startDate: hold.startDate,
        endDate: hold.endDate,
        expiresAt: new Date(hold.expiresAt).toISOString(),
        ttlSeconds: remainingSeconds
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not acquire hold';
      return reply.code(409).send({
        error: message,
        retryAfterMinutes: 15
      });
    }
  });

  // Confirm booking & post double-entry transaction
  fastify.post<{ Body: ConfirmBookingBody }>('/confirm', async (request, reply) => {
    const body = request.body || {};
    const { listingId, renterName, renterPhone, holdId, days = 1, customText } = body;

    if (!listingId || !renterName || !renterPhone) {
      return reply.code(400).send({
        error: 'listingId, renterName, and renterPhone are required.'
      });
    }

    const defaultLoc = LOCALITIES[0];
    const listing = dbStore.getListingById(listingId, defaultLoc);
    if (!listing) {
      return reply.code(404).send({ error: `Listing '${listingId}' not found.` });
    }

    // Confirm hold if provided
    if (holdId) {
      const confirmed = dbStore.confirmHold(holdId);
      if (!confirmed) {
        return reply.code(400).send({
          error: 'The 15-minute hold for this asset has expired. Please acquire a new hold.'
        });
      }
    }

    // Calculate financials
    const safeDays = Math.max(1, days);
    const baseRent = listing.price * safeDays;
    const deposit = listing.deposit;
    const platformFee = listing.category === 'CAR' ? Math.max(149, Math.round(baseRent * 0.05)) : 49;
    const supplierShare = Math.max(0, baseRent - platformFee);
    const totalPaid = baseRent + deposit;

    // Generate 6-digit secure handover OTP
    const handoverOtp = securityService.generateOtp();
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    // Create and save ServerOrder
    const order: ServerOrder = {
      id: orderId,
      listingId: listing.id,
      title: listing.title,
      category: listing.category,
      primaryImage: listing.primaryImage,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      totalPayableNow: totalPaid,
      securityDeposit: deposit,
      handoverOtp,
      handoverLocation: body.handoverLocation || listing.location,
      rentalDuration: `${safeDays} Day${safeDays > 1 ? 's' : ''}`,
      operatorName: listing.operator?.name || 'Verified Partner',
      regNumber: listing.carSpecs?.regNumber || 'PB65-APP-RENT',
      buyerContact: `${renterName} (+91 ${renterPhone.slice(-10)})`,
      customText: customText || undefined,
      leadDays: listing.makerSpecs?.leadDays
    };

    dbStore.saveOrder(order);

    // Post to Double-Entry Ledger Engine
    const ledgerEntries = ledgerEngine.recordRentalFunding(
      orderId,
      totalPaid,
      deposit,
      platformFee,
      supplierShare
    );

    return reply.code(201).send({
      success: true,
      message: 'Booking confirmed successfully with segregated escrow deposit hold.',
      order,
      ledger: {
        transactionId: ledgerEntries[0]?.transactionId,
        entriesCount: ledgerEntries.length,
        escrowDepositHeld: deposit,
        supplierPayableAllocated: supplierShare,
        platformFeeRetained: platformFee
      }
    });
  });

  // Get all active and past bookings
  fastify.get('/', async (_request, reply) => {
    const orders = dbStore.getOrders();
    return reply.send({
      success: true,
      count: orders.length,
      orders
    });
  });

  // Get booking details by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const order = dbStore.getOrderById(id);
    if (!order) {
      return reply.code(404).send({ error: `Order with ID '${id}' not found.` });
    }

    const inspections = dbStore.getInspections(id);

    return reply.send({
      success: true,
      order,
      inspections
    });
  });
};
