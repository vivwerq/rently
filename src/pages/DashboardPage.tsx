import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, ShieldCheck, HardDrive, 
  ExternalLink, Trash2, Edit3, PauseCircle, PlayCircle, Plus, 
  AlertCircle, CheckCircle2, Eye, MessageSquare, TrendingUp,
  Download, RefreshCw, Search, KeyRound, Clock, Phone, MapPin
} from 'lucide-react';
import { Button, Breadcrumbs } from '../components/ui';
import { useAuth } from '../context/useAuth';
import { listingManagerService } from '../services/listingManagerService';
import type { ListingItem } from '../data/mockData';
import { StandardUserVerificationModal } from '../components/auth/StandardUserVerificationModal';
import { apiClient, type SellerQueueResponse } from '../services/apiClient';
import { getStoredOrders, updateOrderStatus } from '../utils/orderStorage';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
  onOpenStudentModal: () => void;
  onOpenLocationModal?: () => void;
}

function getLocalQueueFallback(): SellerQueueResponse {
  const stored = getStoredOrders();
  const pendingHandover = stored.filter(o => o.status === 'CONFIRMED');
  const activeRentals = stored.filter(o => o.status === 'ACTIVE_TRIP' || o.status === 'HANDOVER_IN_PROGRESS');
  const completed = stored.filter(o => o.status === 'COMPLETED');
  return {
    success: true,
    timestamp: new Date().toISOString(),
    queueSummary: {
      pendingHandoverCount: pendingHandover.length,
      activeRentalsCount: activeRentals.length,
      completedCount: completed.length,
      totalActiveValue: activeRentals.reduce((sum, o) => sum + o.totalPayableNow, 0),
      totalEscrowDeposits: activeRentals.reduce((sum, o) => sum + o.securityDeposit, 0)
    },
    pendingHandover,
    activeRentals,
    completed
  };
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenStudentModal: _onOpenStudentModal
}) => {
  const { profile, updateUserProfile } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'LISTINGS' | 'ORDERS' | 'PROFILE' | 'STORAGE' | 'ANALYTICS'>('LISTINGS');

  // Seller Order Fulfillment & Handover State
  const [sellerQueue, setSellerQueue] = useState<SellerQueueResponse | null>(null);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);
  const [damageDeductions, setDamageDeductions] = useState<Record<string, number>>({});
  const [returnNotes, setReturnNotes] = useState<Record<string, string>>({});
  const [handoverFeedback, setHandoverFeedback] = useState<{ orderId: string; msg: string; type: 'success' | 'error' } | null>(null);

  // Listings State initialized directly from service
  const [listings, setListings] = useState<ListingItem[]>(() => listingManagerService.getAllUserListings());
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'LOCAL_DRAFT' | 'PAUSED'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action States
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [selectedDraftToPublish, setSelectedDraftToPublish] = useState<ListingItem | null>(null);
  const [editingPriceItem, setEditingPriceItem] = useState<{ id: string; price: number } | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Profile Form State initialized from auth profile
  const [profileName, setProfileName] = useState(() => profile?.displayName || '');
  const [profileEmail, setProfileEmail] = useState(() => profile?.email || '');
  const [profilePhone, setProfilePhone] = useState(() => profile?.phoneNumber || '');
  const [profileAltPhone, setProfileAltPhone] = useState(() => profile?.alternatePhone || '');
  const [profileHandover, setProfileHandover] = useState(() => profile?.preferredHandoverSpot || '');
  const [profileAddress, setProfileAddress] = useState(() => profile?.deliveryAddress || '');
  const [profileBio, setProfileBio] = useState(() => profile?.bio || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Load user listings
  const reloadListings = () => {
    const all = listingManagerService.getAllUserListings();
    setListings(all);
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ msg, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const fetchSellerQueue = async () => {
    setIsLoadingQueue(true);
    const queueData = await apiClient.getSellerOrderQueue({
      operatorName: profile?.displayName || undefined
    });
    if (queueData) {
      setSellerQueue(queueData);
    } else {
      setSellerQueue(getLocalQueueFallback());
    }
    setIsLoadingQueue(false);
  };

  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'ORDERS') {
      apiClient.getSellerOrderQueue({ operatorName: profile?.displayName || undefined })
        .then(queueData => {
          if (!isMounted) return;
          if (queueData) {
            setSellerQueue(queueData);
          } else {
            setSellerQueue(getLocalQueueFallback());
          }
        });
    }
    return () => { isMounted = false; };
  }, [activeTab, profile?.displayName]);

  const handleVerifyOtp = async (orderId: string) => {
    const otp = otpInputs[orderId]?.trim();
    if (!otp || otp.length < 6) {
      setHandoverFeedback({ orderId, msg: 'Please enter the 6-digit handover secret OTP.', type: 'error' });
      return;
    }

    setVerifyingOrderId(orderId);
    setHandoverFeedback(null);

    const res = await apiClient.verifyHandoverOtp(orderId, otp, profile?.displayName);
    setVerifyingOrderId(null);

    if (res.success) {
      setHandoverFeedback({ orderId, msg: 'Handover verified! Asset handed over and rental is now ACTIVE.', type: 'success' });
      updateOrderStatus(orderId, 'ACTIVE_TRIP');
      fetchSellerQueue();
    } else {
      setHandoverFeedback({ orderId, msg: res.error || 'Invalid OTP code. Please check with renter.', type: 'error' });
    }
  };

  const handleCompleteReturn = async (orderId: string) => {
    setCompletingOrderId(orderId);
    const damageDeduction = damageDeductions[orderId] || 0;
    const notes = returnNotes[orderId] || 'Inspection verified post-trip. Zero damage.';

    const res = await apiClient.completeOrderReturn(orderId, damageDeduction, notes);
    setCompletingOrderId(null);

    if (res.success) {
      showToast(`Return accepted! Escrow deposit of ₹${(res.depositRefund || 0).toLocaleString()} auto-refunded to customer.`);
      updateOrderStatus(orderId, 'COMPLETED');
      fetchSellerQueue();
    } else {
      showToast(res.error || 'Failed to complete return.', 'error');
    }
  };

  // Analytics calculation
  const analytics = useMemo(() => {
    return listingManagerService.getAnalytics(listings);
  }, [listings]);

  // Storage diagnostics
  const storageDiagnostics = useMemo(() => {
    return listingManagerService.getStorageDiagnostics(listings);
  }, [listings]);

  // Filtered listings
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Status filter
      if (filterStatus === 'PUBLISHED' && item.status !== 'PUBLISHED') return false;
      if (filterStatus === 'LOCAL_DRAFT' && item.status !== 'LOCAL_DRAFT') return false;
      if (filterStatus === 'PAUSED' && item.status !== 'PAUSED') return false;

      // Category filter
      if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesDesc) return false;
      }

      return true;
    });
  }, [listings, filterStatus, filterCategory, searchQuery]);

  // Handle Publish Action for Local Draft
  const handleRequestPublish = (item: ListingItem) => {
    const isVerified = Boolean(profile?.isListingVerified || profile?.isStudentVerified);
    if (!isVerified) {
      setSelectedDraftToPublish(item);
      setIsVerificationModalOpen(true);
    } else {
      // User is verified, publish directly to internet!
      const result = listingManagerService.publishDraftToInternet(item.id, profile!);
      if (result.success) {
        showToast(`🎉 "${item.title}" is now published live on the internet!`);
        reloadListings();
      } else {
        showToast(result.error || 'Failed to publish listing', 'error');
      }
    }
  };

  // Verification modal callback
  const handleVerificationSuccess = () => {
    setIsVerificationModalOpen(false);
    if (selectedDraftToPublish && profile) {
      const result = listingManagerService.publishDraftToInternet(selectedDraftToPublish.id, {
        ...profile,
        isListingVerified: true
      });
      if (result.success) {
        showToast(`🎉 Identity verified! "${selectedDraftToPublish.title}" is now live on the internet!`);
      }
      setSelectedDraftToPublish(null);
    } else {
      showToast('🎉 Standard host verification completed successfully!');
    }
    reloadListings();
  };

  // Toggle Pause
  const handleTogglePause = (id: string) => {
    const updated = listingManagerService.togglePause(id);
    if (updated) {
      showToast(`Listing is now ${updated.status === 'PAUSED' ? 'Paused' : 'Active and Live'}.`);
      reloadListings();
    }
  };

  // Delete Listing
  const handleDeleteListing = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      listingManagerService.deleteListing(id);
      showToast(`Listing "${title}" removed.`);
      reloadListings();
    }
  };

  // Update Price
  const handleSavePrice = (id: string) => {
    if (!editingPriceItem || editingPriceItem.id !== id) return;
    listingManagerService.updateListing(id, { price: editingPriceItem.price });
    setEditingPriceItem(null);
    showToast('Price updated successfully.');
    reloadListings();
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        displayName: profileName,
        email: profileEmail,
        phoneNumber: profilePhone,
        alternatePhone: profileAltPhone,
        preferredHandoverSpot: profileHandover,
        deliveryAddress: profileAddress,
        bio: profileBio
      });
      showToast('Profile and host preferences saved successfully!');
    } catch {
      showToast('Could not save profile changes.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Sync All Drafts
  const handleSyncAllDrafts = () => {
    if (!profile?.isListingVerified && !profile?.isStudentVerified) {
      setIsVerificationModalOpen(true);
      return;
    }
    const result = listingManagerService.syncAllDraftsToInternet(profile!);
    if (result.publishedCount > 0) {
      showToast(`Successfully published ${result.publishedCount} draft(s) to the internet!`);
      reloadListings();
    } else {
      showToast('No drafts found in local cache to sync.', 'error');
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(listings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `rently-listings-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Listings JSON backup downloaded.');
  };

  return (
    <main className="details-page-container" role="main">
      <Breadcrumbs
        onNavigate={onNavigate}
        onBack={() => onNavigate('#/')}
        items={[
          { label: 'Home', path: '#/' },
          { label: 'Host & Listing Dashboard' }
        ]}
      />

      {/* Toast Alert */}
      {feedbackToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1200,
          background: feedbackToast.type === 'success' ? '#065f46' : '#991b1b',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'fadeInUp 0.25s ease'
        }}>
          {feedbackToast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedbackToast.msg}</span>
        </div>
      )}

      {/* Dashboard Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', margin: 0 }}>
              Host & Asset Dashboard
            </h1>
            <span className="brand-badge" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
              Tricity Operator
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '680px' }}>
            Manage your verified internet catalog, offline device cache drafts, host credentials, and campus handover preferences.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            id="dashboard-list-new-btn"
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => onNavigate('#/list-item')}
          >
            List New Asset
          </Button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {/* KPI 1: Live Online */}
        <div className="account-card-panel" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Live on Internet</span>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {analytics.publishedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{analytics.totalViews} total views</span>
            <span>•</span>
            <span>{analytics.totalInquiries} inquiries</span>
          </div>
        </div>

        {/* KPI 2: Local Device Cache */}
        <div className="account-card-panel" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-amber)' }}>Device Cache (Drafts)</span>
            <HardDrive size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {analytics.localDraftsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            {analytics.localDraftsCount > 0 ? (
              <button 
                type="button"
                onClick={handleSyncAllDrafts}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent-blue)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
              >
                Sync & Publish to Internet →
              </button>
            ) : (
              'All drafts published'
            )}
          </div>
        </div>

        {/* KPI 3: Monthly Asset Value */}
        <div className="account-card-panel" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Est. Monthly Run-Rate</span>
            <TrendingUp size={16} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            ₹{analytics.estimatedMonthlyValue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Based on current active listings
          </div>
        </div>

        {/* KPI 4: Host Verification Status */}
        <div className="account-card-panel" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Host Status</span>
            <ShieldCheck size={16} color={profile?.isListingVerified ? "var(--accent-emerald)" : "var(--accent-amber)"} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {profile?.isListingVerified ? (
              <span className="order-status-pill confirmed" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
                <CheckCircle2 size={13} /> Verified Host
              </span>
            ) : (
              <span className="order-status-pill cancelled" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
                Unverified (Draft Mode)
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>
            {profile?.isListingVerified ? (
              `${profile.listingVerificationDetails?.verificationType || 'Student Pass'}: ${profile.listingVerificationDetails?.idNumber || '21BCS4829'}`
            ) : (
              <button
                type="button"
                onClick={() => setIsVerificationModalOpen(true)}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent-blue)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
              >
                Verify identity to publish live →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Segmented Control Navigation Tabs (Apple HIG) */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        borderBottom: '1px solid var(--border-subtle)', 
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        <button
          type="button"
          className={`category-chip-btn ${activeTab === 'LISTINGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('LISTINGS')}
          style={{ padding: '0.65rem 1.15rem', fontSize: '0.86rem' }}
        >
          <Package size={16} />
          <span>My Listings ({listings.length})</span>
        </button>

        <button
          type="button"
          className={`category-chip-btn ${activeTab === 'ORDERS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ORDERS')}
          style={{ padding: '0.65rem 1.15rem', fontSize: '0.86rem' }}
        >
          <KeyRound size={16} />
          <span>Fulfillment & Handover Queue {sellerQueue && sellerQueue.queueSummary.pendingHandoverCount > 0 ? `(${sellerQueue.queueSummary.pendingHandoverCount})` : ''}</span>
        </button>

        <button
          type="button"
          className={`category-chip-btn ${activeTab === 'PROFILE' ? 'active' : ''}`}
          onClick={() => setActiveTab('PROFILE')}
          style={{ padding: '0.65rem 1.15rem', fontSize: '0.86rem' }}
        >
          <ShieldCheck size={16} />
          <span>Profile & Verification Hub</span>
        </button>

        <button
          type="button"
          className={`category-chip-btn ${activeTab === 'STORAGE' ? 'active' : ''}`}
          onClick={() => setActiveTab('STORAGE')}
          style={{ padding: '0.65rem 1.15rem', fontSize: '0.86rem' }}
        >
          <HardDrive size={16} />
          <span>Device Cache & Storage ({storageDiagnostics.draftsCount})</span>
        </button>

        <button
          type="button"
          className={`category-chip-btn ${activeTab === 'ANALYTICS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ANALYTICS')}
          style={{ padding: '0.65rem 1.15rem', fontSize: '0.86rem' }}
        >
          <TrendingUp size={16} />
          <span>Performance & Inquiries</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: MY LISTINGS (LIVE & LOCAL CACHE)
          ========================================================================= */}
      {activeTab === 'LISTINGS' && (
        <div>
          {/* Filter & Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: 'var(--surface-secondary)', padding: '3px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className={`category-chip-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('ALL')}
                  style={{ padding: '4px 12px', fontSize: '0.78rem', height: '28px', border: 'none' }}
                >
                  All ({listings.length})
                </button>
                <button
                  type="button"
                  className={`category-chip-btn ${filterStatus === 'PUBLISHED' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('PUBLISHED')}
                  style={{ padding: '4px 12px', fontSize: '0.78rem', height: '28px', border: 'none' }}
                >
                  🟢 Live Online ({analytics.publishedCount})
                </button>
                <button
                  type="button"
                  className={`category-chip-btn ${filterStatus === 'LOCAL_DRAFT' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('LOCAL_DRAFT')}
                  style={{ padding: '4px 12px', fontSize: '0.78rem', height: '28px', border: 'none' }}
                >
                  📱 Device Cache ({analytics.localDraftsCount})
                </button>
                <button
                  type="button"
                  className={`category-chip-btn ${filterStatus === 'PAUSED' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('PAUSED')}
                  style={{ padding: '4px 12px', fontSize: '0.78rem', height: '28px', border: 'none' }}
                >
                  ⏸️ Paused ({analytics.pausedCount})
                </button>
              </div>

              <select
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.75rem', borderRadius: 'var(--radius-full)' }}
              >
                <option value="ALL">All Categories</option>
                <option value="CAR">🚗 Commercial Cars</option>
                <option value="ROOM_ESSENTIAL">🪑 Room Essentials</option>
                <option value="ELECTRONICS">💻 Electronics & Gear</option>
                <option value="RESALE">🔄 Student Resale</option>
                <option value="MAKER">🎨 Local Maker Crafts</option>
              </select>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '30px', height: '34px', fontSize: '0.82rem', borderRadius: 'var(--radius-full)' }}
              />
            </div>
          </div>

          {/* Listings Card Grid */}
          {filteredListings.length === 0 ? (
            <div className="account-card-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <Package size={44} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No listings match your criteria
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                Create a new listing, save it locally to your device cache or publish it live to the internet.
              </p>
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus size={16} />}
                onClick={() => onNavigate('#/list-item')}
              >
                List Your First Asset
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.25rem' }}>
              {filteredListings.map(item => {
                const isDraft = item.status === 'LOCAL_DRAFT';
                const isPaused = item.status === 'PAUSED';
                const isLive = item.status === 'PUBLISHED' || (!item.status && !item.isLocalCache);

                return (
                  <div 
                    key={item.id} 
                    className="account-card-panel" 
                    style={{ 
                      padding: '1.15rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      border: isDraft ? '1.5px dashed var(--accent-amber)' : '1px solid var(--border-subtle)',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem' }}>
                        <div>
                          {isLive && (
                            <span className="order-status-pill confirmed" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={11} /> Live on Internet
                            </span>
                          )}
                          {isDraft && (
                            <span className="order-status-pill" style={{ fontSize: '0.72rem', background: 'var(--accent-amber-subtle)', color: 'var(--accent-amber)', borderColor: 'rgba(245, 158, 11, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <HardDrive size={11} /> Saved in Device Cache (Offline)
                            </span>
                          )}
                          {isPaused && (
                            <span className="order-status-pill cancelled" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <PauseCircle size={11} /> Paused
                            </span>
                          )}
                        </div>

                        <span className="brand-badge" style={{ fontSize: '0.65rem' }}>
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Item Thumbnail & Main Details */}
                      <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '0.85rem' }}>
                        <img
                          src={item.primaryImage}
                          alt={item.title}
                          style={{
                            width: '84px',
                            height: '84px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            flexShrink: 0,
                            background: 'var(--surface-secondary)'
                          }}
                          loading="lazy"
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.35rem 0', lineHeight: 1.3 }}>
                            {item.title}
                          </h4>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            {editingPriceItem?.id === item.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>₹</span>
                                <input
                                  type="number"
                                  value={editingPriceItem.price}
                                  onChange={(e) => setEditingPriceItem({ id: item.id, price: Number(e.target.value) })}
                                  style={{ width: '70px', height: '26px', fontSize: '0.82rem', padding: '0 4px', borderRadius: '4px', border: '1px solid var(--border-strong)' }}
                                  autoFocus
                                />
                                <button 
                                  onClick={() => handleSavePrice(item.id)}
                                  style={{ fontSize: '0.72rem', background: 'var(--accent-emerald)', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingPriceItem(null)}
                                  style={{ fontSize: '0.72rem', background: 'var(--surface-secondary)', border: 'none', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                                  ₹{item.price}
                                </strong>
                                <span>{item.priceUnit}</span>
                                <button
                                  type="button"
                                  onClick={() => setEditingPriceItem({ id: item.id, price: item.price })}
                                  style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: 'var(--text-tertiary)', marginLeft: '4px' }}
                                  title="Quick edit price"
                                >
                                  <Edit3 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '3px' }}>
                            Deposit: ₹{item.deposit} {item.deposit > 0 ? '(Escrow)' : '(Zero)'}
                          </div>
                        </div>
                      </div>

                      {/* Location & Metrics */}
                      <div style={{ background: 'var(--surface-secondary)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                          📍 {item.location}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Eye size={12} /> {item.viewsCount || 0}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <MessageSquare size={12} /> {item.inquiriesCount || 0}
                          </span>
                        </div>
                      </div>

                      {/* Category Specific Edge Case Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
                        {item.category === 'CAR' && item.carSpecs && (
                          <span style={{ fontSize: '0.68rem', background: 'var(--surface-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                            {item.carSpecs.fuel} • {item.carSpecs.transmission} • {item.carSpecs.regNumber}
                          </span>
                        )}
                        {item.category === 'ROOM_ESSENTIAL' && item.roomEssentialSpecs && (
                          <span style={{ fontSize: '0.68rem', background: 'var(--surface-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                            Min {item.roomEssentialSpecs.minTenureMonths || 3}mo tenure • {item.roomEssentialSpecs.freeDelivery ? 'Free Delivery' : 'Pickup'}
                          </span>
                        )}
                        {item.category === 'ELECTRONICS' && item.electronicsSpecs && (
                          <span style={{ fontSize: '0.68rem', background: 'var(--surface-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                            Battery: {item.electronicsSpecs.batteryHealth} • {item.electronicsSpecs.chargerIncluded ? 'Charger Included' : 'No Charger'}
                          </span>
                        )}
                        {item.category === 'RESALE' && (
                          <span style={{ fontSize: '0.68rem', background: 'var(--surface-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                            Condition: {item.condition} • Student P2P
                          </span>
                        )}
                        {item.category === 'MAKER' && item.makerSpecs && (
                          <span style={{ fontSize: '0.68rem', background: 'var(--surface-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                            Lead: {item.makerSpecs.leadDays} days • {item.makerSpecs.customizable ? 'Customizable' : 'Ready Stock'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar for this Listing */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      {isDraft ? (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => handleRequestPublish(item)}
                          leftIcon={<ShieldCheck size={14} />}
                        >
                          Publish to Internet →
                        </Button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ flex: 1, fontSize: '0.75rem' }}
                            onClick={() => onNavigate(`#/listing/${item.id}`)}
                            leftIcon={<ExternalLink size={13} />}
                          >
                            View Live
                          </Button>

                          <button
                            type="button"
                            className="nav-action-btn"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => handleTogglePause(item.id)}
                            title={isPaused ? "Resume Listing" : "Pause Listing"}
                          >
                            {isPaused ? <PlayCircle size={14} color="var(--accent-emerald)" /> : <PauseCircle size={14} color="var(--accent-amber)" />}
                          </button>

                          <button
                            type="button"
                            className="nav-action-btn"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: 'var(--accent-rose)' }}
                            onClick={() => handleDeleteListing(item.id, item.title)}
                            title="Delete listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}

                      {isDraft && (
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => handleDeleteListing(item.id, item.title)}
                          style={{ width: '30px', height: '30px', flexShrink: 0 }}
                          title="Delete draft"
                        >
                          <Trash2 size={14} color="var(--accent-rose)" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: SELLER FULFILLMENT & HANDOVER OTP DESK (PHASE 4)
          ========================================================================= */}
      {activeTab === 'ORDERS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header & Quick Sync */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Live Fulfillment & Handover Desk
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.3rem', margin: 0 }}>
                Verify 6-digit customer handover OTPs at Tri-City pickup spots and release segregated escrow deposits on return.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} className={isLoadingQueue ? 'animate-spin' : ''} />}
              onClick={fetchSellerQueue}
              disabled={isLoadingQueue}
            >
              Refresh Queue
            </Button>
          </div>

          {/* Metric Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.15rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Awaiting Handover</span>
                <Clock size={16} color="var(--accent-amber)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                {sellerQueue?.queueSummary.pendingHandoverCount ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Requires 6-digit renter OTP match
              </div>
            </div>

            <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.15rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Rentals</span>
                <CheckCircle2 size={16} color="var(--accent-emerald)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {sellerQueue?.queueSummary.activeRentalsCount ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Currently on road / with customer
              </div>
            </div>

            <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.15rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Asset Value</span>
                <TrendingUp size={16} color="var(--accent-blue)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{(sellerQueue?.queueSummary.totalActiveValue ?? 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Total in-transit booking fees
              </div>
            </div>

            <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.15rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Escrow Deposits Held</span>
                <ShieldCheck size={16} color="var(--accent-emerald)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                ₹{(sellerQueue?.queueSummary.totalEscrowDeposits ?? 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Segregated in double-entry trust
              </div>
            </div>
          </div>

          {/* Section 1: Pending Handover Orders (Awaiting OTP) */}
          <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KeyRound size={18} color="var(--accent-amber)" />
                  Pending Handovers ({sellerQueue?.pendingHandover.length ?? 0})
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  When meeting the customer at campus/hub, ask them for their 6-digit handover OTP to unlock the asset.
                </p>
              </div>
            </div>

            {(!sellerQueue?.pendingHandover || sellerQueue.pendingHandover.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)' }}>
                <CheckCircle2 size={36} color="var(--accent-emerald)" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>No Handovers Pending</div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                  All confirmed reservations have been handed over. New bookings will appear here instantly.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sellerQueue.pendingHandover.map((order) => {
                  const feedback = handoverFeedback?.orderId === order.id ? handoverFeedback : null;
                  const enteredOtp = otpInputs[order.id] || '';

                  return (
                    <div 
                      key={order.id}
                      style={{ 
                        background: 'var(--surface-secondary)', 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: 'var(--radius-md)', 
                        padding: '1.25rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.25rem',
                        alignItems: 'center'
                      }}
                    >
                      {/* Left: Item & Renter details */}
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img 
                          src={order.primaryImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=200&q=80'} 
                          alt={order.title} 
                          style={{ width: '72px', height: '72px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-subtle)' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 700 }}>
                            ORDER: {order.id}
                          </div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 4px' }}>
                            {order.title}
                          </h4>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={12} color="var(--accent-emerald)" />
                            <span>{order.handoverLocation}</span>
                          </div>
                          {order.buyerContact && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={12} />
                              <span>{order.buyerContact}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Center: Financials & Escrow Badge */}
                      <div style={{ background: 'var(--surface-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.825rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Total Paid</span>
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{order.totalPayableNow.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Escrow Deposit</span>
                          <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>₹{order.securityDeposit.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>🔒 Escrow Trust Segregated</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{order.rentalDuration || '2 Days'}</span>
                        </div>
                      </div>

                      {/* Right: OTP Verification Form */}
                      <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-amber)', display: 'block', marginBottom: '0.4rem' }}>
                          🔑 Enter Customer Secret OTP
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="••••••"
                            value={enteredOtp}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                              setOtpInputs(prev => ({ ...prev, [order.id]: val }));
                            }}
                            style={{
                              flex: 1,
                              background: 'var(--surface-primary)',
                              border: '1px solid var(--border-standard)',
                              borderRadius: 'var(--radius-md)',
                              color: 'var(--text-primary)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '1.15rem',
                              fontWeight: 800,
                              letterSpacing: '4px',
                              textAlign: 'center',
                              padding: '0.4rem'
                            }}
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={enteredOtp.length < 6 || verifyingOrderId === order.id}
                            onClick={() => handleVerifyOtp(order.id)}
                            style={{ background: 'var(--accent-amber)', color: '#000', fontWeight: 700, border: 'none' }}
                          >
                            {verifyingOrderId === order.id ? 'Verifying...' : 'Match OTP'}
                          </Button>
                        </div>

                        {feedback && (
                          <div style={{
                            marginTop: '0.5rem',
                            fontSize: '0.75rem',
                            color: feedback.type === 'success' ? 'var(--accent-emerald)' : '#ef4444',
                            fontWeight: 600
                          }}>
                            {feedback.msg}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Active Rentals & Return Handling */}
          <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
              Active on Road & Return Inspection Desk ({sellerQueue?.activeRentals.length ?? 0})
            </h3>

            {(!sellerQueue?.activeRentals || sellerQueue.activeRentals.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  No active vehicles or equipment currently out with customers.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sellerQueue.activeRentals.map((order) => (
                  <div 
                    key={order.id}
                    style={{ 
                      background: 'var(--surface-secondary)', 
                      border: '1px solid rgba(16, 185, 129, 0.25)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: '1.25rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '1.25rem',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>Active In Use</span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>· {order.id}</span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                        {order.title}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Renter: <strong>{order.buyerContact || 'Campus Customer'}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        Duration: {order.rentalDuration || 'Active'} · Pickup Spot: {order.handoverLocation}
                      </div>
                    </div>

                    {/* Return & Escrow Refund Action */}
                    <div style={{ background: 'var(--surface-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Return & Deposit Release</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                          Escrow: ₹{order.securityDeposit.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="number"
                          min={0}
                          max={order.securityDeposit}
                          placeholder="Damage deduction (₹0)"
                          value={damageDeductions[order.id] || ''}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            setDamageDeductions(prev => ({ ...prev, [order.id]: val }));
                          }}
                          style={{
                            width: '130px',
                            background: 'var(--surface-secondary)',
                            border: '1px solid var(--border-standard)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                            fontSize: '0.78rem',
                            padding: '0.4rem 0.6rem'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Inspection notes (e.g. clean condition)"
                          value={returnNotes[order.id] || ''}
                          onChange={(e) => {
                            const text = e.target.value;
                            setReturnNotes(prev => ({ ...prev, [order.id]: text }));
                          }}
                          style={{
                            flex: 1,
                            background: 'var(--surface-secondary)',
                            border: '1px solid var(--border-standard)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                            fontSize: '0.78rem',
                            padding: '0.4rem 0.6rem'
                          }}
                        />
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        disabled={completingOrderId === order.id}
                        onClick={() => handleCompleteReturn(order.id)}
                        style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
                      >
                        {completingOrderId === order.id ? 'Processing Refund...' : `Accept Return & Release Deposit (₹${(order.securityDeposit - (damageDeductions[order.id] || 0)).toLocaleString()})`}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Completed & Settled History */}
          {sellerQueue?.completed && sellerQueue.completed.length > 0 && (
            <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-secondary)', margin: '0 0 0.85rem' }}>
                Completed & Settled Bookings ({sellerQueue.completed.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {sellerQueue.completed.slice(0, 5).map((order) => (
                  <div 
                    key={order.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.75rem 1rem', 
                      background: 'var(--surface-secondary)', 
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.825rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{order.title}</span>
                      <span style={{ color: 'var(--text-tertiary)', marginLeft: '8px', fontFamily: 'var(--font-mono)' }}>{order.id}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>✓ Escrow Deposit Settled</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{order.totalPayableNow.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: PROFILE & VERIFICATION HUB
          ========================================================================= */}
      {activeTab === 'PROFILE' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Profile Details Form */}
          <div className="account-card-panel">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Host Identity & Handover Profile
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              These verified details appear on your listings and handover receipts for trusted student-to-student transactions.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-field-group">
                <label className="form-label" htmlFor="host-name-input">Full Name / Display Name *</label>
                <input
                  id="host-name-input"
                  type="text"
                  className="form-input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-field-group">
                  <label className="form-label" htmlFor="host-email-input">Official Email Address *</label>
                  <input
                    id="host-email-input"
                    type="email"
                    className="form-input"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label" htmlFor="host-phone-input">Primary Mobile (OTP Verified) *</label>
                  <input
                    id="host-phone-input"
                    type="tel"
                    className="form-input"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-field-group">
                  <label className="form-label" htmlFor="host-alt-phone">Alternate / Hostel Emergency Phone</label>
                  <input
                    id="host-alt-phone"
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98140 12345"
                    value={profileAltPhone}
                    onChange={(e) => setProfileAltPhone(e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label" htmlFor="host-handover-spot">Preferred Safe Handover Spot *</label>
                  <input
                    id="host-handover-spot"
                    type="text"
                    className="form-input"
                    placeholder="e.g. CU Gate 2 Food Court"
                    value={profileHandover}
                    onChange={(e) => setProfileHandover(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label className="form-label" htmlFor="host-address-input">Hostel / Residential Sector Address</label>
                <input
                  id="host-address-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hostel Block 3, CU Gharuan Campus, Mohali"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                />
              </div>

              <div className="form-field-group">
                <label className="form-label" htmlFor="host-bio-input">Host Introduction / Bio</label>
                <textarea
                  id="host-bio-input"
                  className="form-textarea"
                  rows={3}
                  placeholder="Briefly describe your items, response time, and campus handover availability..."
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                />
              </div>

              <Button
                id="save-profile-btn"
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSavingProfile}
              >
                Save Profile Changes
              </Button>
            </form>
          </div>

          {/* Verification Status Matrix Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="account-card-panel">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Standard Verification Hub
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Tricity trust credentials governing your publishing permissions and security deposit escrow tiers.
              </p>

              {/* Status 1: Standard Listing Host */}
              <div style={{ padding: '0.85rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={18} color={profile?.isListingVerified ? "var(--accent-emerald)" : "var(--accent-amber)"} />
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>Standard Listing Host</strong>
                  </div>
                  {profile?.isListingVerified ? (
                    <span className="order-status-pill confirmed" style={{ fontSize: '0.72rem' }}>Verified Active</span>
                  ) : (
                    <span className="order-status-pill cancelled" style={{ fontSize: '0.72rem' }}>Pending</span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {profile?.isListingVerified
                    ? `Verified ID: ${profile.listingVerificationDetails?.idNumber || 'CU Roll: 21BCS4829'} (${profile.listingVerificationDetails?.issuer || 'Registrar'}). Eligible to publish live to internet.`
                    : 'Required to publish listings to the public internet catalog. Without this, items remain in local device cache.'}
                </div>
                <div style={{ marginTop: '0.65rem' }}>
                  <Button
                    variant={profile?.isListingVerified ? "outline" : "primary"}
                    size="sm"
                    fullWidth
                    onClick={() => setIsVerificationModalOpen(true)}
                  >
                    {profile?.isListingVerified ? "Update Host Credentials" : "Verify as Standard Host Now →"}
                  </Button>
                </div>
              </div>

              {/* Status 2: Campus Student ID */}
              <div style={{ padding: '0.85rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} color={profile?.isStudentVerified ? "var(--accent-emerald)" : "var(--text-tertiary)"} />
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>Campus Student ID Pass</strong>
                  </div>
                  {profile?.isStudentVerified ? (
                    <span className="order-status-pill confirmed" style={{ fontSize: '0.72rem' }}>Verified</span>
                  ) : (
                    <span className="order-status-pill cancelled" style={{ fontSize: '0.72rem' }}>Unverified</span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {profile?.isStudentVerified
                    ? `${profile.studentDetails?.institutionName || 'Chandigarh University'} • Roll: ${profile.studentDetails?.rollNumber || '21BCS4829'}`
                    : 'Unlocks 50% lower deposits, campus gate handovers, and student resale.'}
                </div>
              </div>

              {/* Status 3: Commercial DL / Cab Permit */}
              <div style={{ padding: '0.85rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={18} color={profile?.drivingLicenseVerified ? "var(--accent-emerald)" : "var(--text-tertiary)"} />
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>Commercial RTO / DL</strong>
                  </div>
                  {profile?.drivingLicenseVerified ? (
                    <span className="order-status-pill confirmed" style={{ fontSize: '0.72rem' }}>Active DL</span>
                  ) : (
                    <span className="order-status-pill cancelled" style={{ fontSize: '0.72rem' }}>Optional</span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Mandatory for listing commercial self-drive vehicles under Punjab RTO rules.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: DEVICE CACHE & STORAGE MANAGER
          ========================================================================= */}
      {activeTab === 'STORAGE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="account-card-panel">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                  Local Device Cache & Offline Storage
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '640px' }}>
                  Any listing drafted without standard host verification or saved offline is safely preserved in this device's private cache memory.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download size={14} />}
                  onClick={handleExportBackup}
                >
                  Export Backup (JSON)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<RefreshCw size={14} />}
                  onClick={handleSyncAllDrafts}
                >
                  Sync Drafts to Internet
                </Button>
              </div>
            </div>

            {/* Storage Diagnostic Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Drafts In Cache</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {storageDiagnostics.draftsCount} items
                </div>
              </div>

              <div style={{ background: 'var(--surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Cache Storage Size</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                  {storageDiagnostics.draftBytesFormatted}
                </div>
              </div>

              <div style={{ background: 'var(--surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Storage Architecture</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  Client Cache
                </div>
              </div>
            </div>

            {/* Explainer Box */}
            <div style={{ background: 'var(--accent-blue-subtle)', border: '1px solid rgba(0, 113, 227, 0.2)', borderRadius: 'var(--radius-md)', padding: '1rem 1.15rem', fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--accent-blue)' }}>
                💡 How Rently Protects Offline Drafts & Community Trust:
              </strong>
              1. <strong>Private Drafts:</strong> If you are not yet verified, your listings are never lost! They remain stored on your phone or laptop.
              <br />
              2. <strong>One-Click Publication:</strong> The moment you complete standard verification (or student pass check), you can push all cached items directly to the public marketplace.
              <br />
              3. <strong>Zero Cloud Leaks:</strong> Unverified draft information stays strictly on this device until you deliberately choose to publish.
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PERFORMANCE & INQUIRIES
          ========================================================================= */}
      {activeTab === 'ANALYTICS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="account-card-panel">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Tricity Hyperlocal Demand Trends
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Live booking volume and search queries across Chandigarh University, PU, PEC, and Mohali sectors.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>Commercial Self-Drive Cars</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Highest demand: Weekends & Shimla/Manali roadtrips</div>
                </div>
                <span className="order-status-pill confirmed" style={{ fontSize: '0.72rem' }}>94% Booking Rate</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>Desert Coolers & Room Desks</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Gharuan & Landran student PGs (Semester lease)</div>
                </div>
                <span className="order-status-pill confirmed" style={{ fontSize: '0.72rem' }}>88% Booking Rate</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>Student Peer Resale (Bikes/Books)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Fast handovers at CU Gate 2 & PU Stu-C</div>
                </div>
                <span className="order-status-pill" style={{ fontSize: '0.72rem', background: 'var(--accent-blue-subtle)', color: 'var(--accent-blue)' }}>78% Match</span>
              </div>
            </div>
          </div>

          <div className="account-card-panel">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Host Trust & Earning Escrow
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Rently provides 100% security deposit escrow, certified delivery drivers, and instant UPI payouts on completed handovers.
            </p>

            <div style={{ background: 'var(--surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Total Verified Payouts (Demo Account)
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                ₹32,450
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                12 completed trips & semester rentals with zero dispute claims.
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => onNavigate('#/orders')}
            >
              View Renter Orders & Rental Slips →
            </Button>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      <StandardUserVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onVerificationSuccess={handleVerificationSuccess}
        onSaveToLocalCacheOnly={() => {
          setIsVerificationModalOpen(false);
          showToast('Listing preserved safely in your Local Device Cache.');
          reloadListings();
        }}
        listingTitle={selectedDraftToPublish?.title}
        category={selectedDraftToPublish?.category}
      />
    </main>
  );
};
