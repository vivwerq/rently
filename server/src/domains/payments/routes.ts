import type { FastifyPluginAsync } from 'fastify';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { dbStore, LOCALITIES, type ServerOrder } from '../../core/db.ts';
import { ledgerEngine } from '../../core/ledger.ts';
import { securityService } from '../../core/security.ts';

interface CreatePaymentOrderBody {
  listingId: string;
  holdId?: string;
  days?: number;
  tenure?: number;
  deliveryType?: 'SELF_PICKUP' | 'DOORSTEP' | 'CAMPUS_GATE' | 'PG_DOORSTEP';
  studentDiscountApplied?: boolean;
  userId?: string;
}

interface VerifyPaymentBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  listingId: string;
  holdId?: string;
  renterName: string;
  renterPhone: string;
  handoverLocation?: string;
  days?: number;
  tenure?: number;
  deliveryType?: 'SELF_PICKUP' | 'DOORSTEP' | 'CAMPUS_GATE' | 'PG_DOORSTEP';
  studentDiscountApplied?: boolean;
  customText?: string;
}

// Razorpay Client Initialization
const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

const isMockMode =
  !keyId ||
  !keySecret ||
  keyId.includes('placeholder') ||
  keySecret.includes('placeholder');

let razorpayClient: Razorpay | null = null;

if (!isMockMode) {
  try {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    console.log(`[Razorpay] Gateway active with Live/Test Key ID: ${keyId.slice(0, 10)}...`);
  } catch (err) {
    console.warn('[Razorpay] Client initialization failed, defaulting to simulation:', err);
  }
} else {
  console.log('[Razorpay] Running in simulated / test sandbox mode (keys not set or placeholder).');
}

export const paymentRoutes: FastifyPluginAsync = async (fastify) => {
  // Public Gateway Configuration
  fastify.get('/config', async (_request, reply) => {
    return reply.send({
      success: true,
      keyId: isMockMode ? 'rzp_test_simulated' : keyId,
      currency: 'INR',
      isMock: isMockMode,
      gateway: 'Razorpay Hyperlocal Escrow Engine',
      environment: isMockMode ? 'SANDBOX_SIMULATION' : 'LIVE_GATEWAY'
    });
  });

  // Create Razorpay Order with Server-Side Pricing Verification
  fastify.post<{ Body: CreatePaymentOrderBody }>('/create-order', async (request, reply) => {
    const {
      listingId,
      holdId,
      days = 1,
      tenure,
      deliveryType = 'SELF_PICKUP',
      studentDiscountApplied = true
    } = request.body || {};

    if (!listingId) {
      return reply.code(400).send({ error: 'listingId is required to create a payment order.' });
    }

    const defaultLoc = LOCALITIES[0];
    const listing = dbStore.getListingById(listingId, defaultLoc);
    if (!listing) {
      return reply.code(404).send({ error: `Listing '${listingId}' not found.` });
    }

    // Verify hold validity if provided
    if (holdId) {
      const hold = dbStore.getHold(holdId);
      if (!hold || hold.status === 'EXPIRED') {
        return reply.code(409).send({
          error: 'The 15-minute hold for this asset has expired. Please re-lock before paying.',
          holdExpired: true
        });
      }
    }

    // Server-side financial calculation (Prevent client tampering)
    const isMonthly = listing.priceUnit.includes('month');
    const safeDays = Math.max(1, days);
    const safeTenure = Math.max(1, tenure || (isMonthly ? 3 : safeDays));
    const baseRent = isMonthly ? listing.price * safeTenure : listing.price * safeDays;

    const standardDeposit = listing.deposit;
    let finalDeposit = standardDeposit;
    if (studentDiscountApplied) {
      finalDeposit =
        listing.category === 'CAR'
          ? Math.round(standardDeposit * 0.8)
          : Math.round(standardDeposit * 0.5);
    }

    const deliveryFee =
      deliveryType === 'DOORSTEP' || deliveryType === 'PG_DOORSTEP' ? 250 : 0;
    const platformFee =
      listing.category === 'CAR' ? Math.max(149, Math.round(baseRent * 0.05)) : 49;
    const gstRate = listing.category === 'CAR' ? 0.18 : 0.05;
    const gstTax = Math.round((baseRent + platformFee) * gstRate);

    const totalPayableRupees = baseRent + finalDeposit + platformFee + gstTax + deliveryFee;
    const amountInPaise = totalPayableRupees * 100;

    let razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    if (razorpayClient && !isMockMode) {
      try {
        const order = await razorpayClient.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now().toString().slice(-6)}_${listing.id.slice(0, 6)}`,
          notes: {
            listingId: listing.id,
            holdId: holdId || '',
            category: listing.category,
            title: listing.title.slice(0, 30),
            baseRent: baseRent.toString(),
            securityDeposit: finalDeposit.toString(),
            platformFee: platformFee.toString()
          }
        });
        razorpayOrderId = order.id;
      } catch (err: unknown) {
        console.warn('[Razorpay API] Order creation error, falling back to simulated order:', err);
      }
    }

    return reply.send({
      success: true,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: isMockMode ? 'rzp_test_simulated' : keyId,
      isMock: isMockMode,
      breakdown: {
        baseRent,
        securityDeposit: finalDeposit,
        platformFee,
        gstTax,
        deliveryFee,
        totalPayable: totalPayableRupees,
        tenureDisplay: isMonthly ? `${safeTenure} Months` : `${safeDays} Days`
      }
    });
  });

  // Verify Payment Signature & Settle Escrow Ledger
  fastify.post<{ Body: VerifyPaymentBody }>('/verify', async (request, reply) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      listingId,
      holdId,
      renterName,
      renterPhone,
      handoverLocation,
      days = 1,
      tenure,
      deliveryType = 'SELF_PICKUP',
      studentDiscountApplied = true,
      customText
    } = request.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !listingId || !renterName || !renterPhone) {
      return reply.code(400).send({
        error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, listingId, renterName, renterPhone'
      });
    }

    const defaultLoc = LOCALITIES[0];
    const listing = dbStore.getListingById(listingId, defaultLoc);
    if (!listing) {
      return reply.code(404).send({ error: `Listing '${listingId}' not found.` });
    }

    // Verify HMAC SHA256 Signature for Real Razorpay Payments
    const isSimulatedOrder = razorpay_order_id.startsWith('order_sim_') || isMockMode;

    if (!isSimulatedOrder && razorpayClient && keySecret) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid Razorpay payment signature. Payment verification failed.'
        });
      }
    } else {
      // In simulated mode, ensure basic sanity check
      if (!razorpay_signature) {
        return reply.code(400).send({
          success: false,
          error: 'Razorpay signature token is required.'
        });
      }
    }

    // Confirm Atomic Hold
    if (holdId) {
      dbStore.confirmHold(holdId);
    }

    // Compute Ledger Breakdown
    const isMonthly = listing.priceUnit.includes('month');
    const safeDays = Math.max(1, days);
    const safeTenure = Math.max(1, tenure || (isMonthly ? 3 : safeDays));
    const baseRent = isMonthly ? listing.price * safeTenure : listing.price * safeDays;

    const standardDeposit = listing.deposit;
    let finalDeposit = standardDeposit;
    if (studentDiscountApplied) {
      finalDeposit =
        listing.category === 'CAR'
          ? Math.round(standardDeposit * 0.8)
          : Math.round(standardDeposit * 0.5);
    }

    const deliveryFee =
      deliveryType === 'DOORSTEP' || deliveryType === 'PG_DOORSTEP' ? 250 : 0;
    const platformFee =
      listing.category === 'CAR' ? Math.max(149, Math.round(baseRent * 0.05)) : 49;
    const gstRate = listing.category === 'CAR' ? 0.18 : 0.05;
    const gstTax = Math.round((baseRent + platformFee) * gstRate);
    const totalPaid = baseRent + finalDeposit + platformFee + gstTax + deliveryFee;
    const supplierShare = Math.max(0, baseRent - platformFee);

    // Generate Handover Verification OTP
    const handoverOtp = securityService.generateOtp();
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    // Create Confirmed ServerOrder with Segregated Escrow Status
    const order: ServerOrder = {
      id: orderId,
      listingId: listing.id,
      title: listing.title,
      category: listing.category,
      primaryImage: listing.primaryImage,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      totalPayableNow: totalPaid,
      securityDeposit: finalDeposit,
      handoverOtp,
      handoverLocation: handoverLocation || listing.location,
      rentalDuration: isMonthly ? `${safeTenure} Months` : `${safeDays} Day${safeDays > 1 ? 's' : ''}`,
      operatorName: listing.operator?.name || 'Verified Tri-City Partner',
      regNumber: listing.carSpecs?.regNumber || 'PB65-APP-RENT',
      buyerContact: `${renterName} (+91 ${renterPhone.slice(-10)})`,
      customText: customText || undefined,
      leadDays: listing.makerSpecs?.leadDays,
      paymentId: razorpay_payment_id,
      paymentStatus: 'ESCROW_HELD',
      razorpayOrderId: razorpay_order_id
    };

    // Save to Memory & Cloud Firestore
    dbStore.saveOrder(order);

    // Post to Double-Entry Escrow Ledger
    const ledgerEntries = ledgerEngine.recordRentalFunding(
      orderId,
      totalPaid,
      finalDeposit,
      platformFee,
      supplierShare
    );

    return reply.code(200).send({
      success: true,
      verified: true,
      message: 'Razorpay payment verified. Security deposit placed into segregated trust escrow.',
      paymentId: razorpay_payment_id,
      order,
      ledger: {
        transactionId: ledgerEntries[0]?.transactionId,
        entriesCount: ledgerEntries.length,
        escrowDepositHeld: finalDeposit,
        supplierPayableAllocated: supplierShare,
        platformFeeRetained: platformFee
      }
    });
  });

  // Razorpay Webhook Handler
  fastify.post('/webhook', async (request, reply) => {
    const webhookSignature = request.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Verify webhook signature if secret configured
    if (webhookSecret && webhookSignature) {
      const bodyRaw = JSON.stringify(request.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyRaw)
        .digest('hex');

      if (expectedSignature !== webhookSignature) {
        return reply.code(400).send({ error: 'Invalid webhook signature' });
      }
    }

    const payload = request.body as any;
    const event = payload?.event;
    console.log(`[Razorpay Webhook] Received event: ${event}`);

    switch (event) {
      case 'payment.captured': {
        const payment = payload?.payload?.payment?.entity;
        console.log(`[Razorpay Webhook] Payment ${payment?.id} captured for ₹${(payment?.amount || 0) / 100}`);
        break;
      }
      case 'payment.failed': {
        const payment = payload?.payload?.payment?.entity;
        console.warn(`[Razorpay Webhook] Payment ${payment?.id} failed. Reason: ${payment?.error_description}`);
        break;
      }
      case 'refund.processed': {
        const refund = payload?.payload?.refund?.entity;
        const refundAmount = (refund?.amount || 0) / 100;
        console.log(`[Razorpay Webhook] Refund processed: ₹${refundAmount} for payment ${refund?.payment_id}`);
        break;
      }
      default:
        console.log(`[Razorpay Webhook] Unhandled event: ${event}`);
    }

    return reply.send({ status: 'ok', received: true });
  });
};
