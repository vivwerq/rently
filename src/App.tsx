import React, { useState, useEffect, useMemo } from 'react';
import { LOCALITIES, getListingsWithDynamicDistance } from './data/mockData';
import type { ListingItem, LocalityOption } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { ListingDetailsPage } from './pages/ListingDetailsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { TrustSafetyPage } from './pages/TrustSafetyPage';
import { ListItemPage } from './pages/ListItemPage';
import { DashboardPage } from './pages/DashboardPage';
import { SavedItemsPage } from './pages/SavedItemsPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { AccountPage } from './pages/AccountPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CarQuoteModal } from './components/CarQuoteModal';
import { InspectionModal } from './components/InspectionModal';
import { EquipmentRentalModal, ResaleInquiryModal, MakerOrderModal } from './components/commerce';
import { StudentVerificationModal } from './components/StudentVerificationModal';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './context/useAuth';
import { MobileSimulatorView } from './components/MobileSimulatorView';
import { AdminConsoleDrawer } from './components/AdminConsoleDrawer';
import { MobileBottomTabBar } from './components/MobileBottomTabBar';
import { getStoredOrders, saveOrder, updateOrderStatus, removeOrder, subscribeToCloudOrders } from './utils/orderStorage';
import { listingManagerService } from './services/listingManagerService';
import { getUserCreatedListings } from './services/catalogService';
import type { UserOrder } from './types/order';
import type { RentalDateRange } from './components/search/RentalDateRangeModal';

export function App() {
  // Navigation & Hash Route Tracking with Pathname Normalization
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // If user loaded with a non-root pathname e.g. /cars or /search
    if (typeof window !== 'undefined' && window.location.pathname !== '/' && window.location.pathname !== '') {
      const raw = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
      if (raw === 'cars' || raw === 'category/cars') return '#/category/cars';
      if (raw === 'search') return '#/search';
      if (raw === 'orders') return '#/orders';
      if (raw === 'saved') return '#/saved';
      if (raw === 'account') return '#/account';
      if (raw === 'dashboard' || raw === 'my-listings') return '#/dashboard';
      if (!window.location.hash) return `#/${raw}`;
    }
    return window.location.hash || '#/';
  });

  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);

  useEffect(() => {
    // Normalize browser address bar to clean root path
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      const raw = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
      let cleanHash = window.location.hash || '';
      if (!cleanHash) {
        if (raw === 'cars' || raw === 'category/cars') cleanHash = '#/category/cars';
        else if (raw === 'search') cleanHash = '#/search';
        else if (raw === 'orders') cleanHash = '#/orders';
        else if (raw === 'saved') cleanHash = '#/saved';
        else if (raw === 'account') cleanHash = '#/account';
        else if (raw === 'dashboard' || raw === 'my-listings') cleanHash = '#/dashboard';
        else cleanHash = `#/${raw}`;
      }
      window.history.replaceState(null, '', `/${cleanHash}`);
    }

    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsAdminDrawerOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      window.history.replaceState(null, '', `/${path}`);
    } else {
      window.location.hash = path;
    }
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // State: Locality & Dynamic Distance Computation
  const [selectedLocality, setSelectedLocality] = useState<LocalityOption>(LOCALITIES[0]); // CU Gharuan

  // Recompute listings with live dynamic distance whenever selectedLocality or currentPath changes
  const dynamicListings = useMemo(() => {
    void currentPath; // Trigger listing refresh on route transitions
    const baseListings = getListingsWithDynamicDistance(selectedLocality);
    const userListings = getUserCreatedListings().map(item => {
      const matchedHub = LOCALITIES.find(l => l.id === item.hubLocalityId) || selectedLocality;
      return {
        ...item,
        distanceKm: item.hubLocalityId === selectedLocality.id ? 0.8 : 3.5,
        coordinates: matchedHub.coordinates
      };
    });
    return [...userListings, ...baseListings];
  }, [selectedLocality, currentPath]);

  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState(30);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [selectedFuel, setSelectedFuel] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState<string[]>([]);
  const [kmPackage, setKmPackage] = useState<'STANDARD' | 'EXTENDED'>('STANDARD');

  // View Mode: Web Platform vs Android Phone Simulator
  const [viewMode, setViewMode] = useState<'WEB' | 'MOBILE_APP'>('WEB');

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<{ [id: string]: boolean }>(() => {
    try {
      const stored = localStorage.getItem('rently_saved_favorites');
      return stored ? JSON.parse(stored) : { 'car-1': true, 'room-2': true };
    } catch {
      return { 'car-1': true, 'room-2': true };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rently_saved_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not persist favorites to localStorage', e);
    }
  }, [favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const clearAllFavorites = () => {
    setFavorites({});
  };

  // Differentiated Modals & Booking State
  const [selectedCarForQuote, setSelectedCarForQuote] = useState<ListingItem | null>(null);
  const [selectedEquipmentForRent, setSelectedEquipmentForRent] = useState<ListingItem | null>(null);
  const [selectedResaleForOffer, setSelectedResaleForOffer] = useState<ListingItem | null>(null);
  const [selectedMakerForOrder, setSelectedMakerForOrder] = useState<ListingItem | null>(null);

  const [activeBooking, setActiveBooking] = useState<any>(() => {
    try {
      const savedBooking = localStorage.getItem('rently_active_booking');
      return savedBooking ? JSON.parse(savedBooking) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (activeBooking) {
        localStorage.setItem('rently_active_booking', JSON.stringify(activeBooking));
      } else {
        localStorage.removeItem('rently_active_booking');
      }
    } catch (e) {
      console.warn('Could not persist active booking', e);
    }
  }, [activeBooking]);

  const [orders, setOrders] = useState<UserOrder[]>(() => getStoredOrders());
  
  // Real-time Cloud Firestore synchronization
  useEffect(() => {
    const unsubOrders = subscribeToCloudOrders((cloudOrders) => {
      setOrders(cloudOrders);
    });
    const unsubListings = listingManagerService.subscribeToRemoteListings();
    return () => {
      unsubOrders();
      unsubListings();
    };
  }, []);

  const activeOrdersCount = orders.filter(
    o => o.status === 'CONFIRMED' || o.status === 'HANDOVER_IN_PROGRESS' || o.status === 'ACTIVE_TRIP'
  ).length;

  const { profile, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState<string | undefined>(undefined);
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);
  const [isStudentVerified, setIsStudentVerified] = useState(true);

  const openAuthModal = (promptText?: string, onSuccess?: () => void) => {
    setAuthModalPrompt(promptText);
    setPendingAuthAction(onSuccess ? () => onSuccess : null);
    setIsAuthModalOpen(true);
  };

  const isEffectiveStudentVerified = profile?.isStudentVerified ?? isStudentVerified;

  const triggerModalForListing = (item: ListingItem) => {
    if (item.category === 'CAR') {
      setSelectedCarForQuote(item);
    } else if (item.category === 'ROOM_ESSENTIAL' || item.category === 'ELECTRONICS') {
      setSelectedEquipmentForRent(item);
    } else if (item.mode === 'BUY_USED') {
      setSelectedResaleForOffer(item);
    } else if (item.mode === 'MAKER') {
      setSelectedMakerForOrder(item);
    }
  };

  const handleStartBookingGate = (item: ListingItem) => {
    if (!isAuthenticated) {
      openAuthModal('Sign in to configure your rental and lock escrow protection.', () => {
        triggerModalForListing(item);
      });
      return;
    }
    triggerModalForListing(item);
  };

  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateModalFocus, setDateModalFocus] = useState<'delivery' | 'pickup'>('delivery');
  const [rentalDates, setRentalDates] = useState<RentalDateRange>(() => {
    const today = new Date();
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const p = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4);
    return {
      deliveryDate: d,
      pickupDate: p,
      days: 3
    };
  });

  const resetFilters = () => {
    setMaxDistance(30);
    setDeliveryOnly(false);
    setSelectedFuel([]);
    setSelectedTransmission([]);
    setSearchQuery('');
  };

  const handleStartInspection = (bookingData: any) => {
    const orderId = `ORD-CAR-${Date.now().toString().slice(-4)}`;
    const handoverOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const bookingWithId = {
      ...bookingData,
      id: orderId,
      category: 'CAR',
      handoverOtp
    };
    setActiveBooking(bookingWithId);

    const newOrder: UserOrder = {
      id: orderId,
      listingId: selectedCarForQuote?.id || 'car-1',
      holdId: bookingData.holdId,
      title: bookingData.title || selectedCarForQuote?.title || 'Self-Drive Vehicle',
      category: 'CAR',
      totalPayableNow: bookingData.totalPayableNow || bookingData.totalAmount || 3200,
      securityDeposit: bookingData.securityDeposit || bookingData.deposit || 3000,
      createdAt: 'Just now',
      status: 'CONFIRMED',
      handoverOtp,
      handoverLocation: selectedCarForQuote?.location || selectedLocality.name,
      operatorName: selectedCarForQuote?.operator?.name || 'Rently Fleet Partner',
      regNumber: selectedCarForQuote?.carSpecs?.regNumber || 'PB65-AX-7821',
      primaryImage: selectedCarForQuote?.primaryImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      rentalDuration: `${bookingData.rentalDays || 2} Days`
    };
    saveOrder(newOrder);
    setOrders(getStoredOrders());

    // Confirm hold lock in backend
    if (bookingData.holdId) {
      fetch('/api/v1/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: newOrder.listingId,
          renterName: profile?.displayName || 'Campus Renter',
          renterPhone: profile?.phoneNumber || '+91 98765 43210',
          holdId: bookingData.holdId,
          days: bookingData.rentalDays || 2,
          handoverLocation: newOrder.handoverLocation
        })
      }).catch(err => {
        console.warn('Backend confirmation warning:', err);
      });
    }

    setSelectedCarForQuote(null);
    setIsInspectionModalOpen(true);
  };

  const handleExecuteSearch = (qOverride?: string) => {
    const q = (qOverride !== undefined ? qOverride : searchQuery).trim();
    if (q) {
      navigateTo(`#/search?q=${encodeURIComponent(q)}`);
    } else {
      navigateTo('#/search');
    }
  };

  // Route parser
  const renderCurrentView = () => {
    // Mobile Simulator View takes full priority when activated
    if (viewMode === 'MOBILE_APP') {
      return (
        <MobileSimulatorView
          listings={dynamicListings}
          selectedLocality={selectedLocality}
          onSelectLocality={setSelectedLocality}
          rentalDates={rentalDates}
          onOpenDateModal={(focus) => {
            setDateModalFocus(focus || 'delivery');
            setIsDateModalOpen(true);
          }}
          onOpenCityModal={() => setIsLocationModalOpen(true)}
          onSelectCar={(car) => setSelectedCarForQuote(car)}
          activeBooking={activeBooking}
          onOpenInspection={() => {
            if (activeBooking?.category === 'CAR') {
              setIsInspectionModalOpen(true);
            }
          }}
        />
      );
    }

    // Dedicated Search Results Route: #/search or #/search?q=...
    if (currentPath.startsWith('#/search')) {
      const queryString = currentPath.includes('?') ? currentPath.split('?')[1] : '';
      const params = new URLSearchParams(queryString);
      const urlQuery = params.get('q') || searchQuery;

      return (
        <SearchResultsPage
          allListings={dynamicListings}
          selectedLocality={selectedLocality}
          onSelectLocality={setSelectedLocality}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelectListing={(item) => navigateTo(`#/listing/${item.id}`)}
          onNavigate={navigateTo}
          initialQuery={urlQuery}
          initialCategory="ALL"
        />
      );
    }

    // Category Routes: #/category/cars, #/category/room-essentials, etc.
    if (currentPath.startsWith('#/category/')) {
      const categorySlug = currentPath.replace('#/category/', '').split('?')[0];
      const categoryMapping: Record<string, 'RENT' | 'ROOM_ESSENTIAL' | 'BUY_USED' | 'MAKER'> = {
        cars: 'RENT',
        'room-essentials': 'ROOM_ESSENTIAL',
        resale: 'BUY_USED',
        makers: 'MAKER'
      };
      const activeCat = categoryMapping[categorySlug] || 'ALL';

      return (
        <SearchResultsPage
          key={categorySlug}
          allListings={dynamicListings}
          selectedLocality={selectedLocality}
          onSelectLocality={setSelectedLocality}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelectListing={(item) => navigateTo(`#/listing/${item.id}`)}
          onNavigate={navigateTo}
          initialCategory={activeCat}
        />
      );
    }

    // Listing Details Route: #/listing/:id
    if (currentPath.startsWith('#/listing/')) {
      const listingId = currentPath.replace('#/listing/', '').trim();
      const foundListing = dynamicListings.find(item => item.id === listingId);
      if (foundListing) {
        return (
          <ListingDetailsPage
            listing={foundListing}
            selectedLocality={selectedLocality}
            isFavorite={!!favorites[foundListing.id]}
            onToggleFavorite={toggleFavorite}
            onStartBooking={handleStartBookingGate}
            onBack={() => window.history.back()}
            onNavigate={navigateTo}
            isStudentVerified={isEffectiveStudentVerified}
          />
        );
      }
      return <NotFoundPage onNavigate={navigateTo} />;
    }

    // How It Works Route: #/how-it-works
    if (currentPath === '#/how-it-works') {
      return (
        <HowItWorksPage
          onBack={() => navigateTo('#/')}
          onNavigate={navigateTo}
        />
      );
    }

    // Trust & Safety Route: #/trust-safety
    if (currentPath === '#/trust-safety') {
      return (
        <TrustSafetyPage
          onBack={() => navigateTo('#/')}
          onNavigate={navigateTo}
        />
      );
    }

    // List Item / Become Host Route: #/list-item
    if (currentPath === '#/list-item') {
      return (
        <ListItemPage
          onBack={() => navigateTo('#/')}
          onNavigate={navigateTo}
        />
      );
    }

    // Host & Listing Dashboard Route: #/dashboard or #/my-listings
    if (currentPath === '#/dashboard' || currentPath === '#/my-listings') {
      return (
        <DashboardPage
          onNavigate={navigateTo}
          onOpenStudentModal={() => setIsStudentModalOpen(true)}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
        />
      );
    }

    // Saved Items Route: #/saved
    if (currentPath === '#/saved') {
      const savedListings = dynamicListings.filter(l => !!favorites[l.id]);
      return (
        <SavedItemsPage
          savedListings={savedListings}
          onToggleFavorite={toggleFavorite}
          onSelectListing={(item) => navigateTo(`#/listing/${item.id}`)}
          onClearAll={clearAllFavorites}
          onBack={() => navigateTo('#/')}
          onNavigate={navigateTo}
        />
      );
    }

    // Orders Hub Route: #/orders
    if (currentPath === '#/orders') {
      return (
        <OrdersPage
          orders={orders}
          onOpenOrder={(orderId) => navigateTo(`#/orders/${orderId}`)}
          onLaunchInspection={(order) => {
            if (order.category === 'CAR') {
              setActiveBooking(order);
              setIsInspectionModalOpen(true);
            }
          }}
          onCancelOrder={(orderId) => {
            removeOrder(orderId);
            setOrders(getStoredOrders());
            if (activeBooking?.id === orderId) {
              setActiveBooking(null);
            }
          }}
          onNavigate={navigateTo}
        />
      );
    }

    // Order Detail Route: #/orders/:id
    if (currentPath.startsWith('#/orders/')) {
      const orderId = currentPath.replace('#/orders/', '').trim();
      const foundOrder = orders.find(o => o.id === orderId);
      if (foundOrder) {
        return (
          <OrderDetailPage
            order={foundOrder}
            onBack={() => navigateTo('#/orders')}
            onLaunchInspection={() => {
              if (foundOrder.category === 'CAR') {
                setActiveBooking(foundOrder);
                setIsInspectionModalOpen(true);
              }
            }}
            onNavigate={navigateTo}
          />
        );
      }
      return <NotFoundPage onNavigate={navigateTo} />;
    }

    // Account & Campus Preferences Route: #/account
    if (currentPath === '#/account') {
      return (
        <AccountPage
          selectedLocality={selectedLocality}
          isStudentVerified={isEffectiveStudentVerified}
          onOpenStudentModal={() => setIsStudentModalOpen(true)}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          onOpenAuthModal={() => openAuthModal()}
          savedCount={savedCount}
          ordersCount={orders.length}
          onNavigate={navigateTo}
        />
      );
    }

    // Home Route (#/)
    if (currentPath === '#/' || currentPath === '') {
      return (
        <HomePage
          listings={dynamicListings}
          selectedLocality={selectedLocality}
          onSelectLocality={setSelectedLocality}
          activeCategory="ALL"
          onSelectCategory={(cat) => {
            if (cat === 'ALL') navigateTo('#/search');
            else if (cat === 'RENT') navigateTo('#/category/cars');
            else if (cat === 'ROOM_ESSENTIAL') navigateTo('#/category/room-essentials');
            else if (cat === 'BUY_USED') navigateTo('#/category/resale');
            else if (cat === 'MAKER') navigateTo('#/category/makers');
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          maxDistance={maxDistance}
          onDistanceChange={setMaxDistance}
          deliveryOnly={deliveryOnly}
          onToggleDelivery={() => setDeliveryOnly(!deliveryOnly)}
          selectedFuel={selectedFuel}
          onToggleFuel={(fuel) => {
            setSelectedFuel(prev => prev.includes(fuel) ? prev.filter(f => f !== fuel) : [...prev, fuel]);
          }}
          selectedTransmission={selectedTransmission}
          onToggleTransmission={(trans) => {
            setSelectedTransmission(prev => prev.includes(trans) ? prev.filter(t => t !== trans) : [...prev, trans]);
          }}
          kmPackage={kmPackage}
          onSelectKmPackage={setKmPackage}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelectListing={(item) => navigateTo(`#/listing/${item.id}`)}
          onResetFilters={resetFilters}
          onNavigate={navigateTo}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
        />
      );
    }

    // Default 404
    return <NotFoundPage onNavigate={navigateTo} />;
  };

  const savedCount = Object.values(favorites).filter(Boolean).length;

  return (
    <div className="app-container">
      {/* Persistent Navigation Bar */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigateTo}
        selectedLocality={selectedLocality}
        onSelectLocality={setSelectedLocality}
        savedCount={savedCount}
        activeOrdersCount={activeOrdersCount}
        isStudentVerified={isEffectiveStudentVerified}
        onOpenStudentModal={() => setIsStudentModalOpen(true)}
        onOpenAuthModal={() => openAuthModal()}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'WEB' ? 'MOBILE_APP' : 'WEB')}
        isLocationModalOpen={isLocationModalOpen}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onCloseLocationModal={() => setIsLocationModalOpen(false)}
        rentalDates={rentalDates}
        onApplyRentalDates={setRentalDates}
        isDateModalOpen={isDateModalOpen}
        initialFocus={dateModalFocus}
        onOpenDateModal={(focus) => {
          setDateModalFocus(focus || 'delivery');
          setIsDateModalOpen(true);
        }}
        onCloseDateModal={() => setIsDateModalOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExecuteSearch={() => handleExecuteSearch()}
      />

      {/* Active Order / Reservation Banner */}
      {activeBooking && (
        <div style={{ background: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-standard)', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 30, fontSize: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
              ● Active {activeBooking.category === 'CAR' ? 'Vehicle Reservation' : activeBooking.category === 'RESALE' ? 'Purchase Request' : 'Rental Order'}:
            </span>
            <span>
              {activeBooking.title} · Handover OTP: <strong style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-primary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>{activeBooking.handoverOtp || '482910'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => navigateTo(activeBooking.id ? `#/orders/${activeBooking.id}` : '#/orders')}
              style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Order Details & OTP →
            </button>

            {activeBooking.category === 'CAR' ? (
              <button
                onClick={() => setIsInspectionModalOpen(true)}
                style={{ background: 'var(--accent-emerald)', color: '#ffffff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                Launch 6-Point Inspection →
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm(`Cancel active order for "${activeBooking.title}"?`)) {
                    if (activeBooking.id) {
                      removeOrder(activeBooking.id);
                      setOrders(getStoredOrders());
                    }
                    setActiveBooking(null);
                  }
                }}
                style={{ background: 'var(--surface-tertiary)', color: 'var(--text-secondary)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Page Router View */}
      <div className="main-content-flow">
        {renderCurrentView()}
      </div>

      {/* Persistent Grounded Footer */}
      {viewMode === 'WEB' && (
        <Footer
          onNavigate={navigateTo}
          onOpenDevDrawer={() => setIsAdminDrawerOpen(true)}
        />
      )}

      {/* Native Apple iOS Floating Bottom Tab Bar (Visible on mobile/tablet <= 768px) */}
      {viewMode === 'WEB' && (
        <MobileBottomTabBar
          currentPath={currentPath}
          onNavigate={navigateTo}
          savedCount={savedCount}
          activeOrdersCount={activeOrdersCount}
        />
      )}

      {/* Differentiated Checkouts & Category Modals */}
      {selectedCarForQuote && (
        <CarQuoteModal
          listing={selectedCarForQuote}
          onClose={() => setSelectedCarForQuote(null)}
          onStartInspection={handleStartInspection}
        />
      )}

      {selectedEquipmentForRent && (
        <EquipmentRentalModal
          listing={selectedEquipmentForRent}
          onClose={() => setSelectedEquipmentForRent(null)}
          onConfirmRental={(bookingData) => {
            const orderId = `ORD-RENT-${Date.now().toString().slice(-4)}`;
            const handoverOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const orderPayload: UserOrder = {
              id: orderId,
              listingId: bookingData.listingId,
              holdId: bookingData.holdId,
              title: bookingData.title,
              category: (bookingData.category as any) || 'ROOM_ESSENTIAL',
              totalPayableNow: bookingData.totalAmount,
              securityDeposit: bookingData.deposit,
              createdAt: 'Just now',
              status: 'CONFIRMED',
              handoverOtp,
              handoverLocation: bookingData.deliveryAddress || selectedLocality.name,
              operatorName: 'Tri-City Student Rentals',
              primaryImage: bookingData.primaryImage || selectedEquipmentForRent.primaryImage,
              rentalDuration: `${bookingData.durationMonths || 3} Months`
            };
            saveOrder(orderPayload);
            setOrders(getStoredOrders());

            if (bookingData.holdId) {
              fetch('/api/v1/bookings/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  listingId: orderPayload.listingId,
                  renterName: profile?.displayName || 'Campus User',
                  renterPhone: profile?.phoneNumber || '+91 98765 43210',
                  holdId: bookingData.holdId,
                  handoverLocation: orderPayload.handoverLocation
                })
              }).catch(() => {});
            }

            setActiveBooking({ ...bookingData, id: orderId, handoverOtp });
            setSelectedEquipmentForRent(null);
          }}
        />
      )}

      {selectedResaleForOffer && (
        <ResaleInquiryModal
          listing={selectedResaleForOffer}
          onClose={() => setSelectedResaleForOffer(null)}
          onConfirmOffer={(orderData) => {
            const orderId = `ORD-RESALE-${Date.now().toString().slice(-4)}`;
            const handoverOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const orderPayload: UserOrder = {
              id: orderId,
              listingId: orderData.listingId,
              title: orderData.title,
              category: 'RESALE',
              totalPayableNow: orderData.offerAmount,
              securityDeposit: 0,
              createdAt: 'Just now',
              status: 'CONFIRMED',
              handoverOtp,
              handoverLocation: orderData.meetupSpot || selectedLocality.name,
              operatorName: 'Student Seller',
              buyerContact: orderData.phone,
              primaryImage: orderData.primaryImage || selectedResaleForOffer.primaryImage
            };
            saveOrder(orderPayload);
            setOrders(getStoredOrders());
            setActiveBooking({ ...orderData, id: orderId, handoverOtp, category: 'RESALE' });
            setSelectedResaleForOffer(null);
          }}
        />
      )}

      {selectedMakerForOrder && (
        <MakerOrderModal
          listing={selectedMakerForOrder}
          onClose={() => setSelectedMakerForOrder(null)}
          onConfirmOrder={(orderData) => {
            const orderId = `ORD-MAKER-${Date.now().toString().slice(-4)}`;
            const handoverOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const orderPayload: UserOrder = {
              id: orderId,
              listingId: orderData.listingId,
              title: orderData.title,
              category: 'MAKER',
              totalPayableNow: orderData.totalAmount,
              securityDeposit: 0,
              createdAt: 'Just now',
              status: 'CONFIRMED',
              handoverOtp,
              handoverLocation: selectedLocality.name,
              operatorName: 'Tri-City Artisan Studio',
              customText: orderData.customText,
              leadDays: orderData.leadDays || 3,
              primaryImage: orderData.primaryImage || selectedMakerForOrder.primaryImage
            };
            saveOrder(orderPayload);
            setOrders(getStoredOrders());
            setActiveBooking({ ...orderData, id: orderId, handoverOtp, category: 'MAKER' });
            setSelectedMakerForOrder(null);
          }}
        />
      )}

      {isInspectionModalOpen && activeBooking && (
        <InspectionModal
          bookingData={activeBooking}
          onClose={() => setIsInspectionModalOpen(false)}
          onTripCompleted={() => {
            if (activeBooking.id) {
              updateOrderStatus(activeBooking.id, 'COMPLETED');
              setOrders(getStoredOrders());
            }
            setActiveBooking(null);
          }}
        />
      )}

      {isStudentModalOpen && (
        <StudentVerificationModal
          onClose={() => setIsStudentModalOpen(false)}
          onVerified={() => {
            setIsStudentVerified(true);
            setIsStudentModalOpen(false);
          }}
        />
      )}

      <AdminConsoleDrawer
        isOpen={isAdminDrawerOpen}
        onClose={() => setIsAdminDrawerOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAuthAction(null);
        }}
        onSuccess={() => {
          if (pendingAuthAction) {
            pendingAuthAction();
            setPendingAuthAction(null);
          }
        }}
        actionPromptText={authModalPrompt}
      />
    </div>
  );
}

export default App;
