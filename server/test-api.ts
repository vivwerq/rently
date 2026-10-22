import { buildApp } from './src/app.ts';

async function runTests() {
  console.log('🧪 Starting Rently API & Domain Services Test Suite...\n');
  const app = buildApp();
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await app.inject({ method: 'GET', url: '/api/health' });
    const health = healthRes.json();
    assert(healthRes.statusCode === 200 && health.status === 'UP', 'Health check responds 200 UP');

    // 2. Auth OTP flow
    const otpReqRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/request-otp',
      payload: { phone: '9876543210' }
    });
    const otpData = otpReqRes.json();
    assert(otpReqRes.statusCode === 200 && otpData.success === true, 'Request phone OTP succeeds');

    const otpVerifyRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/verify-otp',
      payload: { phone: '9876543210', otp: '482910' }
    });
    const verifyData = otpVerifyRes.json();
    assert(otpVerifyRes.statusCode === 200 && verifyData.verified === true, 'Verify OTP with master demo code succeeds');

    const meRes = await app.inject({ method: 'GET', url: '/api/v1/auth/me?userId=usr-demo-student' });
    const meData = meRes.json();
    assert(meRes.statusCode === 200 && meData.isVerifiedCampusStudent === true, 'Student status recognized on /me');

    // 3. Geo serviceability
    const geoLocalitiesRes = await app.inject({ method: 'GET', url: '/api/v1/geo/localities' });
    const geoLocalities = geoLocalitiesRes.json();
    assert(geoLocalitiesRes.statusCode === 200 && geoLocalities.total === 10, '10 Tri-City localities returned');

    const serviceabilityRes = await app.inject({
      method: 'GET',
      url: '/api/v1/geo/serviceability?localityId=CU_GHARUAN'
    });
    const serviceability = serviceabilityRes.json();
    assert(serviceabilityRes.statusCode === 200 && serviceability.serviceable === true, 'CU Gharuan is serviceable with free campus handover');

    // 4. Catalog search & filtering
    const catalogRes = await app.inject({
      method: 'GET',
      url: '/api/v1/catalog/listings?localityId=CU_GHARUAN&category=CAR'
    });
    const catalog = catalogRes.json();
    assert(catalogRes.statusCode === 200 && catalog.count > 0, 'Car listings filtered properly');

    const singleCarRes = await app.inject({ method: 'GET', url: '/api/v1/catalog/listings/car-1' });
    const singleCar = singleCarRes.json();
    assert(singleCarRes.statusCode === 200 && singleCar.listing.id === 'car-1', 'Single listing car-1 fetched with specs');

    // 5. Booking Quote
    const quoteRes = await app.inject({
      method: 'POST',
      url: '/api/v1/bookings/quote',
      payload: { listingId: 'car-1', days: 2, userId: 'usr-demo-student' }
    });
    const quote = quoteRes.json();
    assert(quoteRes.statusCode === 200 && quote.breakdown.days === 2, 'Itemized 2-day quote calculated');
    assert(quote.breakdown.studentDepositDiscount > 0, '50% student deposit discount applied');

    // 6. Hold Engine (Atomic lock & Conflict prevention)
    const holdRes1 = await app.inject({
      method: 'POST',
      url: '/api/v1/bookings/hold',
      payload: {
        listingId: 'car-1',
        startDate: '2026-11-01T10:00:00Z',
        endDate: '2026-11-03T10:00:00Z',
        userId: 'usr-demo-student'
      }
    });
    const hold1 = holdRes1.json();
    assert(holdRes1.statusCode === 200 && hold1.success === true, '15-minute exclusive hold acquired');

    // Conflicting overlapping hold attempt
    const holdConflictRes = await app.inject({
      method: 'POST',
      url: '/api/v1/bookings/hold',
      payload: {
        listingId: 'car-1',
        startDate: '2026-11-02T10:00:00Z',
        endDate: '2026-11-04T10:00:00Z',
        userId: 'other-user'
      }
    });
    assert(holdConflictRes.statusCode === 409, 'Conflicting hold rejected with 409 conflict lock');

    // 7. Booking confirmation
    const confirmRes = await app.inject({
      method: 'POST',
      url: '/api/v1/bookings/confirm',
      payload: {
        holdId: hold1.holdId,
        listingId: 'car-1',
        renterName: 'Amanpreet Singh',
        renterPhone: '9876543210',
        days: 2
      }
    });
    const confirmData = confirmRes.json();
    assert(confirmRes.statusCode === 201 && Boolean(confirmData.order.id), 'Booking confirmed and order generated');
    const newOrderId = confirmData.order.id;
    const handoverOtp = confirmData.order.handoverOtp;

    // 8. Inspection Pickup
    const pickupRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inspection/pickup',
      payload: {
        orderId: newOrderId,
        odometerReadingKm: 42150,
        fuelLevelPercent: 95,
        photos: ['front.jpg', 'odometer.jpg'],
        handoverOtp: handoverOtp
      }
    });
    const pickupData = pickupRes.json();
    assert(pickupRes.statusCode === 200 && pickupData.orderStatus === 'ACTIVE_TRIP', 'Pickup inspection verified and order status transitioned to ACTIVE_TRIP');

    // 9. Inspection Return & Deposit Refund
    const returnRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inspection/return',
      payload: {
        orderId: newOrderId,
        odometerReadingKm: 42470,
        fuelLevelPercent: 95,
        photos: ['return_clean.jpg']
      }
    });
    const returnData = returnRes.json();
    assert(returnRes.statusCode === 200 && returnData.orderStatus === 'COMPLETED', 'Return inspection passed and order marked COMPLETED');
    assert(returnData.summary.totalKmDriven === 320, 'Odometer delta calculated accurately (320 km driven)');
    assert(returnData.summary.refundProcessed > 0, 'Automated deposit refund executed');

    // 10. Double-Entry Ledger Audit Reconciliation
    const ledgerAuditRes = await app.inject({ method: 'GET', url: '/api/v1/ledger/audit' });
    const ledgerAudit = ledgerAuditRes.json();
    assert(ledgerAuditRes.statusCode === 200, 'Ledger audit endpoint responds 200');
    assert(ledgerAudit.report.isBalanced === true, 'Ledger audit report confirms totalDebits === totalCredits (Balanced)');
    assert(ledgerAudit.report.discrepancy === 0, 'Ledger discrepancy is exactly 0.00 INR');
    console.log(`\n📊 Double-Entry Audit Summary:`);
    console.log(`   Total Debits:     ₹${ledgerAudit.report.totalDebits}`);
    console.log(`   Total Credits:    ₹${ledgerAudit.report.totalCredits}`);
    console.log(`   Is Balanced:      ${ledgerAudit.report.isBalanced}`);
    console.log(`   Escrow Held:      ₹${ledgerAudit.report.summary.totalEscrowHeld}`);
    console.log(`   Platform Revenue: ₹${ledgerAudit.report.summary.totalPlatformRevenue}`);
    console.log(`   Supplier Payable: ₹${ledgerAudit.report.summary.totalSupplierPayables}`);

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  }

  console.log(`\n====================================================`);
  console.log(`🏁 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
