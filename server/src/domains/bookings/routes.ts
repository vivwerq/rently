import type { FastifyPluginAsync } from 'fastify';
import { dbStore, LOCALITIES, calculateDistanceKm, type ServerOrder } from '../../core/db.ts';
import { ledgerEngine } from '../../core/ledger.ts';
import { securityService } from '../../core/security.ts';

interface QuoteRequestBody {
  listingId: string;
  days?: number;
  userId?: string;
  localityId?: string;
  deliveryType?: 'SELF_PICKUP' | 'DOORSTEP' | 'CAMPUS_GATE' | 'PG_DOORSTEP';
  deliveryCoords?: { lat: number; lng: number };
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
  operatorId?: string;
  days?: number;
  startDate?: string;
  endDate?: string;
  handoverLocation?: string;
  customText?: string;
  deliveryType?: 'SELF_PICKUP' | 'DOORSTEP' | 'CAMPUS_GATE' | 'PG_DOORSTEP';
  deliveryCoords?: { lat: number; lng: number };
}

interface VerifyOtpBody {
  orderId: string;
  otp: string;
  inspectorName?: string;
}

interface CompleteReturnBody {
  orderId: string;
  damageDeduction?: number;
  returnNotes?: string;
}

export const bookingRoutes: FastifyPluginAsync = async (fastify) => {
  // Calculate itemized price quote
  fastify.post<{ Body: QuoteRequestBody }>('/quote', async (request, reply) => {
    const { listingId, days = 1, userId, localityId, deliveryType, deliveryCoords } = request.body || {};
    if (!listingId) {
      return reply.code(400).send({ error: 'listingId is required for quote calculation.' });
    }

    const defaultLoc = LOCALITIES[0];
    const listing = dbStore.getListingById(listingId, defaultLoc);
    if (!listing) {
      return reply.code(404).send({ error: `Listing '${listingId}' not found.` });
    }

    // Enforce Hyperlocal Delivery Radius (Max 45km)
    let deliveryFee = 0;
    if (deliveryType === 'DOORSTEP' || deliveryType === 'PG_DOORSTEP') {
      let targetCoords = deliveryCoords;
      if (!targetCoords && localityId) {
        const found = LOCALITIES.find(l => l.id === localityId);
        if (found) targetCoords = found.coordinates;
      }
      if (targetCoords) {
        const dist = calculateDistanceKm(listing.coordinates, targetCoords);
        if (dist > 45) {
          return reply.code(422).send({
            error: `Delivery location is ${dist} km away, which exceeds our 45 km operational radius for Chandigarh Tricity (Chandigarh, Mohali, Kharar, Zirakpur). Please select campus pickup.`
          });
        }
      }
      deliveryFee = 250;
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

  // Check hold status & remaining TTL
  fastify.get<{ Params: { id: string } }>('/hold/:id', async (request, reply) => {
    const { id } = request.params;
    const hold = dbStore.getHold(id);
    if (!hold) {
      return reply.code(404).send({ error: `Hold '${id}' not found.` });
    }

    const remainingSeconds = Math.max(0, Math.floor((hold.expiresAt - Date.now()) / 1000));
    return reply.send({
      success: true,
      holdId: hold.id,
      listingId: hold.listingId,
      status: hold.status,
      active: hold.status === 'HOLD_ACTIVE' && remainingSeconds > 0,
      expiresAt: new Date(hold.expiresAt).toISOString(),
      ttlSeconds: remainingSeconds
    });
  });

  // Release hold prematurely (e.g. user closes modal or cancels checkout)
  fastify.post<{ Body: { holdId: string } }>('/hold/release', async (request, reply) => {
    const { holdId } = request.body || {};
    if (!holdId) {
      return reply.code(400).send({ error: 'holdId is required.' });
    }

    const released = dbStore.releaseHold(holdId);
    return reply.send({
      success: true,
      released,
      message: released ? `Hold '${holdId}' successfully released.` : 'Hold was not active or already expired.'
    });
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

  // Seller & Operator Live Order Queue
  fastify.get<{ Querystring: { operatorId?: string; operatorName?: string } }>('/seller/queue', async (request, reply) => {
    const { operatorId, operatorName } = request.query || {};
    let allOrders = dbStore.getOrders();

    if (operatorId) {
      allOrders = allOrders.filter(o => o.operatorId === operatorId);
    } else if (operatorName) {
      allOrders = allOrders.filter(o => o.operatorName?.toLowerCase().includes(operatorName.toLowerCase()));
    }

    const pendingHandover = allOrders.filter(o => o.status === 'CONFIRMED');
    const activeRentals = allOrders.filter(o => o.status === 'ACTIVE_TRIP' || o.status === 'HANDOVER_IN_PROGRESS');
    const completed = allOrders.filter(o => o.status === 'COMPLETED');

    const totalActiveValue = activeRentals.reduce((sum, o) => sum + o.totalPayableNow, 0);
    const totalEscrowDeposits = activeRentals.reduce((sum, o) => sum + o.securityDeposit, 0);

    return reply.send({
      success: true,
      timestamp: new Date().toISOString(),
      queueSummary: {
        pendingHandoverCount: pendingHandover.length,
        activeRentalsCount: activeRentals.length,
        completedCount: completed.length,
        totalActiveValue,
        totalEscrowDeposits
      },
      pendingHandover,
      activeRentals,
      completed
    });
  });

  // Verify Handover Secret OTP
  fastify.post<{ Body: VerifyOtpBody }>('/verify-otp', async (request, reply) => {
    const { orderId, otp, inspectorName } = request.body || {};
    if (!orderId || !otp) {
      return reply.code(400).send({ error: 'orderId and otp are required for verification.' });
    }

    const order = dbStore.getOrderById(orderId);
    if (!order) {
      return reply.code(404).send({ error: `Order '${orderId}' not found.` });
    }

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return reply.code(400).send({ error: `Cannot verify handover: Order is already ${order.status}.` });
    }

    if (order.handoverOtp.trim() !== otp.trim()) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid handover OTP. Please verify the 6-digit code shown on the customer app.'
      });
    }

    // OTP match! Transition to ACTIVE_TRIP
    order.status = 'ACTIVE_TRIP';
    order.handoverVerifiedAt = new Date().toISOString();
    dbStore.saveOrder(order);

    return reply.send({
      success: true,
      message: 'Handover OTP successfully matched. Asset handed over and rental is now ACTIVE.',
      order,
      verifiedAt: order.handoverVerifiedAt,
      verifiedBy: inspectorName || order.operatorName || 'Operator'
    });
  });

  // Complete Return & Auto-Release Escrow Deposit
  fastify.post<{ Body: CompleteReturnBody }>('/complete-return', async (request, reply) => {
    const { orderId, damageDeduction = 0, returnNotes } = request.body || {};
    if (!orderId) {
      return reply.code(400).send({ error: 'orderId is required.' });
    }

    const order = dbStore.getOrderById(orderId);
    if (!order) {
      return reply.code(404).send({ error: `Order '${orderId}' not found.` });
    }

    if (order.status === 'COMPLETED') {
      return reply.code(400).send({ error: 'Order has already been returned and completed.' });
    }

    // Escrow deposit refund calculation
    const safeDeduction = Math.max(0, Math.min(damageDeduction, order.securityDeposit));
    const depositRefund = Math.max(0, order.securityDeposit - safeDeduction);

    if (depositRefund > 0) {
      ledgerEngine.recordDepositRefund(orderId, depositRefund);
    }

    order.status = 'COMPLETED';
    order.paymentStatus = 'REFUNDED';
    order.completedAt = new Date().toISOString();
    dbStore.saveOrder(order);

    return reply.send({
      success: true,
      message: 'Vehicle/Equipment return verified. Escrow security deposit refund released.',
      order,
      depositRefund,
      damageDeduction: safeDeduction,
      returnNotes: returnNotes || 'Standard return check verified with zero disputed damage.'
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
