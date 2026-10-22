import React, { useState } from 'react';
import { 
  CheckCircle, AlertCircle, ExternalLink, HardDrive, 
  ShieldCheck, LayoutDashboard, Plus, Car,
  Armchair, Laptop, RefreshCw, Palette
} from 'lucide-react';
import { LOCALITIES } from '../data/mockData';
import { listingManagerService } from '../services/listingManagerService';
import type { ListingDraftInput } from '../services/listingManagerService';
import { Breadcrumbs, Button } from '../components/ui';
import { useAuth } from '../context/useAuth';
import { StandardUserVerificationModal } from '../components/auth/StandardUserVerificationModal';

interface ListItemPageProps {
  onBack: () => void;
  onNavigate: (path: string) => void;
}

export const ListItemPage: React.FC<ListItemPageProps> = ({ onBack, onNavigate }) => {
  const { profile } = useAuth();

  const [category, setCategory] = useState<'CAR' | 'ROOM_ESSENTIAL' | 'ELECTRONICS' | 'RESALE' | 'MAKER'>('CAR');
  const [title, setTitle] = useState('');
  const [localityId, setLocalityId] = useState(LOCALITIES[0].id);
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [condition, setCondition] = useState('Excellent');
  const [description, setDescription] = useState('');
  const [verificationDoc, setVerificationDoc] = useState('');

  // Category-specific states
  // Car
  const [fuel, setFuel] = useState('Petrol');
  const [transmission, setTransmission] = useState('Manual');
  const [seats, setSeats] = useState(5);
  const [regNumber, setRegNumber] = useState('');

  // Room Essential
  const [minTenureMonths, setMinTenureMonths] = useState(3);
  const [freeDelivery, setFreeDelivery] = useState(true);

  // Electronics
  const [batteryHealth, setBatteryHealth] = useState('95%+');
  const [warrantyMonths, setWarrantyMonths] = useState(6);
  const [chargerIncluded, setChargerIncluded] = useState(true);

  // Resale
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [semesterBatch, setSemesterBatch] = useState('2022-2026 Batch');

  // Maker
  const [leadDays, setLeadDays] = useState(3);
  const [customizable, setCustomizable] = useState(true);
  const [materials, setMaterials] = useState('');

  // Submission & Flow States
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ id: string; isOnline: boolean; title: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<ListingDraftInput | null>(null);

  const assembleDraft = (): ListingDraftInput => {
    const localityObj = LOCALITIES.find(l => l.id === localityId) || LOCALITIES[0];

    const defaultImages = {
      CAR: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      ROOM_ESSENTIAL: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      ELECTRONICS: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      RESALE: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
      MAKER: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80'
    };

    return {
      title,
      category,
      mode: category === 'RESALE' ? 'BUY_USED' : category === 'MAKER' ? 'MAKER' : 'RENT',
      price: Number(price) || 500,
      priceUnit: category === 'CAR' ? '/day' : (category === 'ROOM_ESSENTIAL' || category === 'ELECTRONICS') ? '/mo' : '',
      deposit: Number(deposit) || (category === 'CAR' ? 3000 : category === 'ROOM_ESSENTIAL' ? 500 : 0),
      condition,
      location: localityObj.name,
      hubLocalityId: localityId,
      primaryImage: defaultImages[category],
      description,
      sellerName: profile?.displayName || 'Campus Host',
      sellerPhone: profile?.phoneNumber || '+91 98765 43210',
      verificationDoc: verificationDoc || regNumber || semesterBatch,
      carSpecs: category === 'CAR' ? {
        fuel,
        transmission,
        seats,
        kmLimitDaily: 250,
        extraKmRate: 12,
        regNumber: regNumber || 'PB65-AX-7821'
      } : undefined,
      roomEssentialSpecs: category === 'ROOM_ESSENTIAL' ? {
        minTenureMonths,
        freeDelivery,
        maintenanceIncluded: true
      } : undefined,
      electronicsSpecs: category === 'ELECTRONICS' ? {
        batteryHealth,
        warrantyMonths,
        chargerIncluded,
        originalBill: true
      } : undefined,
      resaleSpecs: category === 'RESALE' ? {
        originalPrice: Math.round(Number(price) * 1.6),
        assistedFee: 0,
        knownDefects: 'Minor cosmetic wear',
        isNegotiable,
        semesterBatch
      } : undefined,
      makerSpecs: category === 'MAKER' ? {
        leadDays,
        customizable,
        materials: materials || 'Local Oak Wood & Sheesham'
      } : undefined
    };
  };

  // 1. User wants to Publish Live to Internet
  const handlePublishToInternet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      setErrorMsg('Please specify asset title and rental / selling price.');
      return;
    }
    setErrorMsg('');

    const draft = assembleDraft();
    const isVerified = Boolean(profile?.isListingVerified || profile?.isStudentVerified);

    if (!isVerified) {
      // Trigger verification modal
      setPendingDraft(draft);
      setIsVerificationModalOpen(true);
      return;
    }

    // Directly publish to live internet catalog
    const localityObj = LOCALITIES.find(l => l.id === localityId) || LOCALITIES[0];
    const created = listingManagerService.createListing(draft, true, profile, localityObj);
    setSubmissionResult({ id: created.id, isOnline: true, title: created.title });
    setIsSubmitted(true);
  };

  // 2. User explicitly chooses to Save to Local Device Cache (Draft)
  const handleSaveToLocalCache = () => {
    if (!title.trim() || !price) {
      setErrorMsg('Please enter asset title and price before saving to local cache.');
      return;
    }
    setErrorMsg('');

    const draft = assembleDraft();
    const localityObj = LOCALITIES.find(l => l.id === localityId) || LOCALITIES[0];
    const created = listingManagerService.createListing(draft, false, profile, localityObj);
    setSubmissionResult({ id: created.id, isOnline: false, title: created.title });
    setIsSubmitted(true);
  };

  // Callback if verification succeeded inside modal
  const handleVerificationSuccessFromModal = () => {
    setIsVerificationModalOpen(false);
    if (pendingDraft) {
      const localityObj = LOCALITIES.find(l => l.id === localityId) || LOCALITIES[0];
      const created = listingManagerService.createListing(pendingDraft, true, {
        ...(profile || ({} as any)),
        isListingVerified: true
      }, localityObj);
      setSubmissionResult({ id: created.id, isOnline: true, title: created.title });
      setIsSubmitted(true);
      setPendingDraft(null);
    }
  };

  // Callback if user chose to save to local cache from modal
  const handleSaveLocalFromModal = () => {
    setIsVerificationModalOpen(false);
    if (pendingDraft) {
      const localityObj = LOCALITIES.find(l => l.id === localityId) || LOCALITIES[0];
      const created = listingManagerService.createListing(pendingDraft, false, profile, localityObj);
      setSubmissionResult({ id: created.id, isOnline: false, title: created.title });
      setIsSubmitted(true);
      setPendingDraft(null);
    }
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setSubmissionResult(null);
    setTitle('');
    setPrice('');
    setDeposit('');
    setDescription('');
    setVerificationDoc('');
    setRegNumber('');
  };

  return (
    <main className="form-page-container" role="main">
      <Breadcrumbs
        onNavigate={onNavigate}
        onBack={onBack}
        items={[
          { label: 'Home', path: '#/' },
          { label: 'Host Dashboard', path: '#/dashboard' },
          { label: 'List an Asset' }
        ]}
      />

      {isSubmitted && submissionResult ? (
        <div className="form-card-box" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ 
            width: '68px', 
            height: '68px', 
            borderRadius: 'var(--radius-full)', 
            background: submissionResult.isOnline ? 'var(--accent-emerald-subtle)' : 'var(--accent-amber-subtle)', 
            color: submissionResult.isOnline ? 'var(--accent-emerald)' : 'var(--accent-amber)', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            border: `1.5px solid ${submissionResult.isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
          }}>
            {submissionResult.isOnline ? <CheckCircle size={36} /> : <HardDrive size={36} />}
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            {submissionResult.isOnline ? 'Listing Published to the Internet!' : 'Saved to Local Device Cache!'}
          </h2>

          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 1.85rem' }}>
            {submissionResult.isOnline ? (
              <>
                Your asset <strong>"{submissionResult.title}"</strong> is now live across the public marketplace. Renters and students in Chandigarh, Mohali, and Kharar can discover, inspect, and book it.
              </>
            ) : (
              <>
                Your asset <strong>"{submissionResult.title}"</strong> is safely preserved in this device's local cache. Complete standard host verification whenever you are ready to publish it live to the public internet!
              </>
            )}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            {submissionResult.isOnline ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate(`#/listing/${submissionResult.id}`)}
                leftIcon={<ExternalLink size={15} />}
              >
                View Live Listing in Marketplace
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate('#/dashboard')}
                leftIcon={<ShieldCheck size={15} />}
              >
                Verify & Go Live in Host Dashboard
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('#/dashboard')}
              leftIcon={<LayoutDashboard size={15} />}
            >
              Open Host Dashboard
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleResetForm}
              leftIcon={<Plus size={15} />}
            >
              List Another Item
            </Button>
          </div>
        </div>
      ) : (
        <div className="form-card-box">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
                List Your Asset on Rently
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
                Rent out or resell commercial cars, study desks, room coolers, electronics, and maker crafts to students and residents across Chandigarh, Mohali, and Kharar.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {profile?.isListingVerified ? (
                <span className="order-status-pill confirmed" style={{ fontSize: '0.75rem' }}>
                  <ShieldCheck size={12} /> Standard Host Verified
                </span>
              ) : (
                <span className="order-status-pill" style={{ fontSize: '0.75rem', background: 'var(--accent-amber-subtle)', color: 'var(--accent-amber)' }}>
                  <HardDrive size={12} /> Unverified (Cache Enabled)
                </span>
              )}
            </div>
          </div>

          {errorMsg && (
            <div style={{ background: 'var(--accent-rose-subtle)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#fda4af', marginBottom: '1.25rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePublishToInternet} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            {/* 1. Category Selection Tabs */}
            <div className="form-field-group">
              <label className="form-label">1. Select Asset Category *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
                <button
                  type="button"
                  className={`category-chip-btn ${category === 'CAR' ? 'active' : ''}`}
                  onClick={() => setCategory('CAR')}
                  style={{ justifyContent: 'center', fontSize: '0.82rem', padding: '0.65rem' }}
                >
                  <Car size={16} />
                  <span>Commercial Car</span>
                </button>

                <button
                  type="button"
                  className={`category-chip-btn ${category === 'ROOM_ESSENTIAL' ? 'active' : ''}`}
                  onClick={() => setCategory('ROOM_ESSENTIAL')}
                  style={{ justifyContent: 'center', fontSize: '0.82rem', padding: '0.65rem' }}
                >
                  <Armchair size={16} />
                  <span>Room Essential</span>
                </button>

                <button
                  type="button"
                  className={`category-chip-btn ${category === 'ELECTRONICS' ? 'active' : ''}`}
                  onClick={() => setCategory('ELECTRONICS')}
                  style={{ justifyContent: 'center', fontSize: '0.82rem', padding: '0.65rem' }}
                >
                  <Laptop size={16} />
                  <span>Electronics / Gear</span>
                </button>

                <button
                  type="button"
                  className={`category-chip-btn ${category === 'RESALE' ? 'active' : ''}`}
                  onClick={() => setCategory('RESALE')}
                  style={{ justifyContent: 'center', fontSize: '0.82rem', padding: '0.65rem' }}
                >
                  <RefreshCw size={16} />
                  <span>Student Resale</span>
                </button>

                <button
                  type="button"
                  className={`category-chip-btn ${category === 'MAKER' ? 'active' : ''}`}
                  onClick={() => setCategory('MAKER')}
                  style={{ justifyContent: 'center', fontSize: '0.82rem', padding: '0.65rem' }}
                >
                  <Palette size={16} />
                  <span>Local Maker</span>
                </button>
              </div>
            </div>

            {/* 2. Asset Title */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="asset-title-input">2. Asset Title & Model *</label>
              <input
                id="asset-title-input"
                type="text"
                className="form-input"
                placeholder={
                  category === 'CAR' ? 'e.g. Maruti Swift ZXi+ Manual (2024)' :
                  category === 'ROOM_ESSENTIAL' ? 'e.g. Symphony 70L Desert Air Cooler with Trolley' :
                  category === 'ELECTRONICS' ? 'e.g. Dell UltraSharp 27" 4K USB-C Hub Monitor' :
                  category === 'RESALE' ? 'e.g. Hero Sprint Pro 21-Speed Mountain Bicycle' :
                  'e.g. Handcrafted Solid Sheesham Study Desk Organizer'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* 3. Locality Hub */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="locality-hub-select">3. Primary Pickup / Handover Hub *</label>
              <select
                id="locality-hub-select"
                className="form-select"
                value={localityId}
                onChange={(e) => setLocalityId(e.target.value)}
              >
                {LOCALITIES.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.type === 'CAMPUS' ? 'University Campus' : 'City Sector'})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Pricing & Deposit */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-field-group">
                <label className="form-label" htmlFor="asset-price-input">
                  {category === 'CAR' ? 'Daily Rental (₹) *' :
                   (category === 'ROOM_ESSENTIAL' || category === 'ELECTRONICS') ? 'Monthly Rental (₹) *' :
                   category === 'RESALE' ? 'Selling Price (₹) *' : 'Craft Price (₹) *'}
                </label>
                <input
                  id="asset-price-input"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 1800"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-label" htmlFor="asset-deposit-input">
                  Refundable Escrow Deposit (₹)
                </label>
                <input
                  id="asset-deposit-input"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 2000 (Safely escrowed)"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                />
              </div>
            </div>

            {/* 5. Category-Specific Fields (Handling Edge Cases) */}
            {category === 'CAR' && (
              <div style={{ background: 'var(--surface-secondary)', padding: '1.15rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  🚗 Punjab Commercial Self-Drive Specifications
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field-group">
                    <label className="form-label" htmlFor="car-fuel-select">Fuel Type</label>
                    <select id="car-fuel-select" className="form-select" value={fuel} onChange={(e) => setFuel(e.target.value)}>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="EV">Electric (EV)</option>
                      <option value="CNG">CNG + Petrol</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label" htmlFor="car-trans-select">Transmission</label>
                    <select id="car-trans-select" className="form-select" value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic (AT/AMT)</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label" htmlFor="car-seats-select">Seating</label>
                    <select id="car-seats-select" className="form-select" value={seats} onChange={(e) => setSeats(Number(e.target.value))}>
                      <option value={5}>5 Seater</option>
                      <option value={7}>7 Seater SUV</option>
                    </select>
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="form-label" htmlFor="car-reg-input">Commercial Registration (Yellow Plate) *</label>
                  <input
                    id="car-reg-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g. PB65-AX-7821 (Punjab Rent-a-cab)"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                  />
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Private white-plate vehicles are strictly rejected under Punjab RTO commercial rules.
                  </span>
                </div>
              </div>
            )}

            {category === 'ROOM_ESSENTIAL' && (
              <div style={{ background: 'var(--surface-secondary)', padding: '1.15rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  🪑 Student Room Essential Details
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field-group">
                    <label className="form-label" htmlFor="min-tenure-select">Minimum Lease Tenure</label>
                    <select id="min-tenure-select" className="form-select" value={minTenureMonths} onChange={(e) => setMinTenureMonths(Number(e.target.value))}>
                      <option value={1}>1 Month (Trial)</option>
                      <option value={3}>3 Months (Quarterly)</option>
                      <option value={6}>6 Months (Semester Package)</option>
                      <option value={12}>1 Year (Annual College Year)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <input
                      id="free-delivery-check"
                      type="checkbox"
                      checked={freeDelivery}
                      onChange={(e) => setFreeDelivery(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="free-delivery-check" style={{ fontSize: '0.84rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Free PG / Hostel room delivery included
                    </label>
                  </div>
                </div>
              </div>
            )}

            {category === 'ELECTRONICS' && (
              <div style={{ background: 'var(--surface-secondary)', padding: '1.15rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  💻 Electronics Hardware Specs
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field-group">
                    <label className="form-label" htmlFor="elec-battery-input">Battery / Power State</label>
                    <input
                      id="elec-battery-input"
                      type="text"
                      className="form-input"
                      placeholder="e.g. 98% health or Direct AC Adapter"
                      value={batteryHealth}
                      onChange={(e) => setBatteryHealth(e.target.value)}
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="form-label" htmlFor="elec-warranty-select">Active Warranty</label>
                    <select id="elec-warranty-select" className="form-select" value={warrantyMonths} onChange={(e) => setWarrantyMonths(Number(e.target.value))}>
                      <option value={0}>Out of Warranty (Tested Working)</option>
                      <option value={6}>6 Months Warranty Remaining</option>
                      <option value={12}>1 Year+ Brand Warranty</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    id="elec-charger-check"
                    type="checkbox"
                    checked={chargerIncluded}
                    onChange={(e) => setChargerIncluded(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="elec-charger-check" style={{ fontSize: '0.84rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Original charger, cables, and packaging included
                  </label>
                </div>
              </div>
            )}

            {category === 'RESALE' && (
              <div style={{ background: 'var(--surface-secondary)', padding: '1.15rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  🔄 Student Resale Credentials
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field-group">
                    <label className="form-label" htmlFor="resale-batch-input">Student Batch / University Roll</label>
                    <input
                      id="resale-batch-input"
                      type="text"
                      className="form-input"
                      placeholder="e.g. 2022-2026 Batch (CU Gharuan)"
                      value={semesterBatch}
                      onChange={(e) => setSemesterBatch(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <input
                      id="resale-negotiable-check"
                      type="checkbox"
                      checked={isNegotiable}
                      onChange={(e) => setIsNegotiable(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="resale-negotiable-check" style={{ fontSize: '0.84rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Price is negotiable for junior students
                    </label>
                  </div>
                </div>
              </div>
            )}

            {category === 'MAKER' && (
              <div style={{ background: 'var(--surface-secondary)', padding: '1.15rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  🎨 Local Artisan / Maker Customization
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field-group">
                    <label className="form-label" htmlFor="maker-lead-select">Crafting Lead Time</label>
                    <select id="maker-lead-select" className="form-select" value={leadDays} onChange={(e) => setLeadDays(Number(e.target.value))}>
                      <option value={1}>Ready Stock (1-Day Handover)</option>
                      <option value={3}>3 Days (Custom Order)</option>
                      <option value={7}>7 Days (Handmade to Order)</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label" htmlFor="maker-materials-input">Materials / Craft Specs</label>
                    <input
                      id="maker-materials-input"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Organic Cotton, Sheesham Wood"
                      value={materials}
                      onChange={(e) => setMaterials(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    id="maker-customizable-check"
                    type="checkbox"
                    checked={customizable}
                    onChange={(e) => setCustomizable(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="maker-customizable-check" style={{ fontSize: '0.84rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Custom orders & engraved personalizations accepted
                  </label>
                </div>
              </div>
            )}

            {/* 6. Physical Condition */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="asset-cond-select">Physical Condition *</label>
              <select
                id="asset-cond-select"
                className="form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="Brand New">Brand New / Mint Condition</option>
                <option value="Like New">Like New (Minimal Use, No Scratches)</option>
                <option value="Excellent">Excellent (Fully Functional, Clean)</option>
                <option value="Good">Good (Normal Wear, Serviced)</option>
              </select>
            </div>

            {/* 7. Description */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="asset-desc-textarea">Description & Handover Notes</label>
              <textarea
                id="asset-desc-textarea"
                className="form-textarea"
                rows={3}
                placeholder="Disclose any accessories included, exact hostel pickup gate, or handover timing..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Dual Submission Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button
                id="publish-online-submit-btn"
                type="submit"
                variant="primary"
                size="lg"
                style={{ justifyContent: 'center', fontWeight: 700 }}
                leftIcon={<ShieldCheck size={18} />}
              >
                Publish Live to Internet (Public Marketplace) →
              </Button>

              <button
                id="save-local-cache-submit-btn"
                type="button"
                className="nav-action-btn"
                onClick={handleSaveToLocalCache}
                style={{
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.9rem',
                  border: '1.5px dashed var(--border-strong)',
                  background: 'var(--surface-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-secondary)'
                }}
              >
                <HardDrive size={16} color="var(--accent-amber)" />
                <span>Save to Local Device Cache (Offline Draft)</span>
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
              ℹ️ If you are not yet standard host verified, publishing live will open a 1-minute verification prompt, or you can keep it saved safely in local cache.
            </div>
          </form>
        </div>
      )}

      {/* Verification Modal for Live Internet Publishing */}
      <StandardUserVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onVerificationSuccess={handleVerificationSuccessFromModal}
        onSaveToLocalCacheOnly={handleSaveLocalFromModal}
        listingTitle={pendingDraft?.title}
        category={pendingDraft?.category}
      />
    </main>
  );
};
