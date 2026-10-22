import { useState } from 'react';
import { 
  Compass, PlusCircle, Activity, MessageSquare, User, 
  ShieldCheck, Car, AlertTriangle, Send
} from 'lucide-react';
import type { ListingItem, LocalityOption } from '../data/mockData';
import { RentalCapsuleBar } from './search/RentalCapsuleBar';
import type { RentalDateRange } from './search/RentalDateRangeModal';

interface MobileSimulatorViewProps {
  listings: ListingItem[];
  selectedLocality: LocalityOption;
  onSelectLocality?: (locality: LocalityOption) => void;
  rentalDates?: RentalDateRange;
  onOpenDateModal?: (focus?: 'delivery' | 'pickup') => void;
  onOpenCityModal?: () => void;
  onSelectCar: (listing: ListingItem) => void;
  activeBooking: any;
  onOpenInspection: () => void;
}

const DEFAULT_SIMULATOR_DATES: RentalDateRange = {
  deliveryDate: null,
  pickupDate: null,
  days: 3
};

export const MobileSimulatorView: React.FC<MobileSimulatorViewProps> = ({
  listings,
  selectedLocality,
  rentalDates = DEFAULT_SIMULATOR_DATES,
  onOpenDateModal = () => {},
  onOpenCityModal = () => {},
  onSelectCar,
  activeBooking,
  onOpenInspection
}) => {
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'POST' | 'ACTIVITY' | 'MESSAGES' | 'PROFILE'>('EXPLORE');
  const [mobileFilter, setMobileFilter] = useState<'ALL' | 'RENT' | 'BUY_USED' | 'MAKER'>('ALL');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'seller'; text: string; time: string }[]>([
    { sender: 'seller', text: 'Hello! Yes, the Hyundai Creta is sanitized and ready at Mohali Phase 7 hub. Do you need delivery to your campus?', time: '14:10' },
    { sender: 'user', text: 'Hi! Yes, I need it delivered near CU Gate 2. Have valid DL verified in Rently.', time: '14:12' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const filteredListings = listings.filter(item => {
    if (mobileFilter === 'ALL') return true;
    return item.mode === mobileFilter;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: newMessage, time: '14:36' }]);
    setNewMessage('');
  };

  return (
    <div className="simulator-outer-wrapper">
      <div className="simulator-helper-banner">
        <div>
          <strong style={{ color: '#fff' }}>📱 Android Mobile App Live Simulator</strong>
          <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>
            Testing the 5-tab React Native Android architecture, offline inspection camera, and verified OTP handovers.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '9999px', fontWeight: 600 }}>
            Target: Android 14+ (API 34)
          </span>
        </div>
      </div>

      {/* Phone Mockup Frame */}
      <div className="phone-mockup-frame">
        {/* Status Bar */}
        <div className="phone-status-bar">
          <span>14:35</span>
          <div className="camera-punch-hole"></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem' }}>
            <span>5G</span>
            <span>92%</span>
          </div>
        </div>

        {/* Scrollable Screen Content based on Active Tab */}
        <div className="phone-scroll-screen">
          {/* TAB 1: EXPLORE */}
          {activeTab === 'EXPLORE' && (
            <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Standalone Application Rental Capsule Bar (Image 1 Reference) */}
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '0.25rem' }}>
                <RentalCapsuleBar
                  selectedLocality={selectedLocality}
                  onOpenCityModal={onOpenCityModal}
                  rentalDates={rentalDates}
                  onOpenDateModal={onOpenDateModal}
                  isCompact={true}
                />
              </div>

              {/* Segmented Filter Pills */}
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
                {(['ALL', 'RENT', 'BUY_USED', 'MAKER'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setMobileFilter(tab)}
                    style={{
                      background: mobileFilter === tab ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                      color: mobileFilter === tab ? '#020617' : '#94a3b8',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab === 'ALL' && 'All'}
                    {tab === 'RENT' && 'Rentals & Cars'}
                    {tab === 'BUY_USED' && 'Used Resale'}
                    {tab === 'MAKER' && 'Local Makers'}
                  </button>
                ))}
              </div>

              {/* Mobile Listing Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredListings.map(item => (
                  <div
                    key={item.id}
                    onClick={() => item.category === 'CAR' && onSelectCar(item)}
                    style={{
                      background: 'rgba(17, 24, 39, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: item.category === 'CAR' ? 'pointer' : 'default'
                    }}
                  >
                    <div style={{ position: 'relative', height: '130px', width: '100%' }}>
                      <img src={item.primaryImage} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.75)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
                        {item.mode === 'RENT' ? 'RENTAL' : item.mode === 'BUY_USED' ? 'USED' : 'MAKER'}
                      </div>
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#10b981', color: '#020617', padding: '2px 6px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800 }}>
                        {item.distanceKm} km
                      </div>
                    </div>

                    <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{item.title}</div>
                      
                      {item.carSpecs && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.65rem', background: 'rgba(255, 255, 255, 0.05)', padding: '1px 6px', borderRadius: '4px', color: '#cbd5e1' }}>
                            {item.carSpecs.fuel} · {item.carSpecs.transmission}
                          </span>
                          <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: '4px', color: '#34d399' }}>
                            {item.carSpecs.kmLimitDaily} km/day
                          </span>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <div>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>₹{item.price.toLocaleString()}</span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}> {item.priceUnit}</span>
                        </div>
                        <button
                          style={{
                            background: item.category === 'CAR' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                            color: item.category === 'CAR' ? '#34d399' : '#fff',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '8px',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {item.category === 'CAR' ? 'Instant Quote' : 'View Item'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: POST LISTING */}
          {activeTab === 'POST' && (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 800 }}>List an Item on Rently</h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Sell used study essentials to your college juniors, rent out gear, or list verified commercial vehicles.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Transaction Mode</label>
                  <select style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.55rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <option>Rent out useful item or gear</option>
                    <option>Sell secondhand room furniture / cycle / books</option>
                    <option>Sell locally handcrafted maker goods</option>
                    <option>Commercial vehicle operator listing</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Listing Title</label>
                  <input type="text" placeholder="e.g. Study Table + Lamp (CGC Landran)" style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.55rem', borderRadius: '8px', fontSize: '0.8rem' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Price (₹)</label>
                    <input type="number" placeholder="1200" style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.55rem', borderRadius: '8px', fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Security Deposit (₹)</label>
                    <input type="number" placeholder="500" style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.55rem', borderRadius: '8px', fontSize: '0.8rem' }} />
                  </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.65rem' }}>
                  Publish to {selectedLocality.name}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY (ACTIVE BOOKINGS & OTP HANDSHAKE) */}
          {activeTab === 'ACTIVITY' && (
            <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 800 }}>Activity & Ongoing Orders</h4>

              {activeBooking ? (
                <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid var(--emerald-main)', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', background: '#10b981', color: '#020617', padding: '2px 8px', borderRadius: '9999px', fontWeight: 800 }}>
                      CONFIRMED BOOKING
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>RNT-94218</span>
                  </div>

                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{activeBooking.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Operator: {activeBooking.operatorName} · {activeBooking.regNumber}</div>
                  </div>

                  {/* OTP Card */}
                  <div style={{ background: 'rgba(2, 6, 23, 0.8)', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px dashed rgba(16, 185, 129, 0.5)' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Your Pickup Handover OTP</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#34d399', letterSpacing: '4px' }}>
                      482910
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '2px' }}>
                      Share with operator only after completing 6-point photo inspection!
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', fontSize: '0.8rem' }}
                    onClick={onOpenInspection}
                  >
                    Open Guided Camera Inspection
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <Car size={32} style={{ margin: '0 auto', opacity: 0.4 }} />
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>No Active Rentals</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Explore verified self-drive cars or campus furniture to request a booking.</div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MESSAGES (IN-APP CHAT WITH PHONE MASKING) */}
          {activeTab === 'MESSAGES' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0.75rem' }}>
              {/* Anti-Scam Guidance Banner */}
              <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '0.5rem 0.65rem', fontSize: '0.68rem', color: '#fde68a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>Keep chats on Rently. Handover OTP and deposit refunds are only protected for in-app bookings.</span>
              </div>

              {/* Chat Thread */}
              <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      background: msg.sender === 'user' ? '#10b981' : '#1e293b',
                      color: msg.sender === 'user' ? '#020617' : '#fff',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '0.6rem', textAlign: 'right', marginTop: '2px', opacity: 0.75 }}>
                      {msg.time}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '4px', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Type a safe message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.65rem',
                    color: '#fff',
                    fontSize: '0.75rem'
                  }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.45rem 0.75rem' }}>
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'PROFILE' && (
            <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#10b981', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#020617' }}>
                  VS
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Vivek Singh</div>
                  <div style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} /> Student Verified · CU Gharuan
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Verified Driving License</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Active · LMV-NT</span>
                </div>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Escrow Deposit Protection</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>Enabled</span>
                </div>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>24/7 Tri-City Support Route</span>
                  <span style={{ color: '#fbbf24', fontWeight: 600 }}>1800-RENTLY</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom 5-Tab Navigation Bar */}
        <div className="phone-bottom-nav">
          <button className={`phone-nav-item ${activeTab === 'EXPLORE' ? 'active' : ''}`} onClick={() => setActiveTab('EXPLORE')}>
            <Compass size={18} />
            <span>Explore</span>
          </button>
          <button className={`phone-nav-item ${activeTab === 'POST' ? 'active' : ''}`} onClick={() => setActiveTab('POST')}>
            <PlusCircle size={18} />
            <span>Post</span>
          </button>
          <button className={`phone-nav-item ${activeTab === 'ACTIVITY' ? 'active' : ''}`} onClick={() => setActiveTab('ACTIVITY')}>
            <Activity size={18} />
            <span>Activity</span>
          </button>
          <button className={`phone-nav-item ${activeTab === 'MESSAGES' ? 'active' : ''}`} onClick={() => setActiveTab('MESSAGES')}>
            <MessageSquare size={18} />
            <span>Messages</span>
          </button>
          <button className={`phone-nav-item ${activeTab === 'PROFILE' ? 'active' : ''}`} onClick={() => setActiveTab('PROFILE')}>
            <User size={18} />
            <span>Profile</span>
          </button>
        </div>

        {/* Home gesture indicator */}
        <div className="phone-home-indicator"></div>
      </div>
    </div>
  );
};
