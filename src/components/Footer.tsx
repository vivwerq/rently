import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import './layout/footer.css';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenDevDrawer?: () => void;
}

export const Footer = ({ onNavigate, onOpenDevDrawer }: FooterProps) => {
  // Mobile accordion states
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        {/* Top Footnote / Disclosures (Apple Style) */}
        <div className="footer-disclosures">
          <p style={{ marginBottom: '0.4rem' }}>
            * All self-drive commercial motor vehicles listed on Rently hold valid Rent-a-Cab Scheme (1989) permits and comprehensive commercial passenger insurance under Punjab & Chandigarh Transport Authorities. Private white-plate vehicles are strictly banned.
          </p>
          <p>
            ** Security deposits are held in a segregated third-party escrow trust account. Uncontested deposits are automatically refunded within 2 hours of verified joint return photo inspection.
          </p>
        </div>

        {/* Desktop 4-Column Directory Grid (Visible on >= 861px) */}
        <div className="footer-directory-grid">
          {/* Column 1: Marketplace Categories */}
          <div className="footer-directory-col">
            <h4>Explore Marketplace</h4>
            <ul>
              <li>
                <a href="#/category/cars" onClick={(e) => { e.preventDefault(); onNavigate('#/category/cars'); }}>
                  Self-Drive Cars (Yellow-Plate Fleet)
                </a>
              </li>
              <li>
                <a href="#/category/room-essentials" onClick={(e) => { e.preventDefault(); onNavigate('#/category/room-essentials'); }}>
                  Room & Study PG Rentals (Coolers/Desks)
                </a>
              </li>
              <li>
                <a href="#/category/resale" onClick={(e) => { e.preventDefault(); onNavigate('#/category/resale'); }}>
                  Student Peer-to-Peer Resale
                </a>
              </li>
              <li>
                <a href="#/category/makers" onClick={(e) => { e.preventDefault(); onNavigate('#/category/makers'); }}>
                  Handcrafted Local Goods
                </a>
              </li>
              <li>
                <a href="#/list-item" onClick={(e) => { e.preventDefault(); onNavigate('#/list-item'); }}>
                  List an Asset / Become a Host
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Trust & Operations */}
          <div className="footer-directory-col">
            <h4>Trust & Verification</h4>
            <ul>
              <li>
                <a href="#/how-it-works" onClick={(e) => { e.preventDefault(); onNavigate('#/how-it-works'); }}>
                  4-Step Verified Handover
                </a>
              </li>
              <li>
                <a href="#/trust-safety" onClick={(e) => { e.preventDefault(); onNavigate('#/trust-safety'); }}>
                  Zero Deposit Extortion Policy
                </a>
              </li>
              <li>
                <a href="#/trust-safety" onClick={(e) => { e.preventDefault(); onNavigate('#/trust-safety'); }}>
                  Motor Vehicles Act Yellow Plate Law
                </a>
              </li>
              <li>
                <a href="#/saved" onClick={(e) => { e.preventDefault(); onNavigate('#/saved'); }}>
                  Saved Favorites & Bookmarks
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: University Hubs */}
          <div className="footer-directory-col">
            <h4>University Safe Gates</h4>
            <ul>
              <li><span>CU Gharuan Gate 2 (Main Food Court)</span></li>
              <li><span>PU Chandigarh Stu-C Fountain</span></li>
              <li><span>CGC Landran Admin Block Gate 1</span></li>
              <li><span>PEC Chandigarh Sector 12 Gate</span></li>
              <li><span>Knowledge City (IISER & ISB Hub)</span></li>
            </ul>
          </div>

          {/* Column 4: Local Support & Hub */}
          <div className="footer-directory-col">
            <h4>Operations Center</h4>
            <ul>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <MapPin size={13} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Phase 7 Commercial Market, SAS Nagar (Mohali), Punjab 160062</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={13} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                <span>Dispatch: 07:00 AM – 11:00 PM Daily</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={13} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                <span>ops@rently.in · 2-Hour Response</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={13} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                <span>Helpline: +91 (172) 480-RENT</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Accordion Directory (Visible on <= 860px and 500px) */}
        <div className="footer-accordion-container">
          {/* Accordion 1 */}
          <div className="footer-accordion-item">
            <button
              className="footer-accordion-header"
              onClick={() => toggleSection('categories')}
              aria-expanded={openSection === 'categories'}
            >
              <span>Explore Marketplace</span>
              {openSection === 'categories' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {openSection === 'categories' && (
              <div className="footer-accordion-content">
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><a href="#/category/cars" onClick={(e) => { e.preventDefault(); onNavigate('#/category/cars'); }}>🚗 Self-Drive Cars</a></li>
                  <li><a href="#/category/room-essentials" onClick={(e) => { e.preventDefault(); onNavigate('#/category/room-essentials'); }}>🪑 Room & Study Rentals</a></li>
                  <li><a href="#/category/resale" onClick={(e) => { e.preventDefault(); onNavigate('#/category/resale'); }}>🔄 Used Resale</a></li>
                  <li><a href="#/category/makers" onClick={(e) => { e.preventDefault(); onNavigate('#/category/makers'); }}>🎨 Local Makers</a></li>
                  <li><a href="#/list-item" onClick={(e) => { e.preventDefault(); onNavigate('#/list-item'); }}>➕ List an Asset</a></li>
                </ul>
              </div>
            )}
          </div>

          {/* Accordion 2 */}
          <div className="footer-accordion-item">
            <button
              className="footer-accordion-header"
              onClick={() => toggleSection('trust')}
              aria-expanded={openSection === 'trust'}
            >
              <span>Trust & Handover Standards</span>
              {openSection === 'trust' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {openSection === 'trust' && (
              <div className="footer-accordion-content">
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><a href="#/how-it-works" onClick={(e) => { e.preventDefault(); onNavigate('#/how-it-works'); }}>📋 4-Step Verified Handover</a></li>
                  <li><a href="#/trust-safety" onClick={(e) => { e.preventDefault(); onNavigate('#/trust-safety'); }}>🛡️ Zero Deposit Extortion Policy</a></li>
                  <li><a href="#/trust-safety" onClick={(e) => { e.preventDefault(); onNavigate('#/trust-safety'); }}>⚖️ Motor Vehicles Act Yellow Plate Law</a></li>
                  <li><a href="#/saved" onClick={(e) => { e.preventDefault(); onNavigate('#/saved'); }}>❤️ Saved Favorites</a></li>
                </ul>
              </div>
            )}
          </div>

          {/* Accordion 3 */}
          <div className="footer-accordion-item">
            <button
              className="footer-accordion-header"
              onClick={() => toggleSection('support')}
              aria-expanded={openSection === 'support'}
            >
              <span>Tri-City Dispatch & Hubs</span>
              {openSection === 'support' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {openSection === 'support' && (
              <div className="footer-accordion-content">
                <p style={{ marginBottom: '0.35rem' }}>📍 Dispatch Hub: Phase 7 Commercial Complex, Mohali</p>
                <p style={{ marginBottom: '0.35rem' }}>🕒 Hours: 07:00 AM – 11:00 PM Daily</p>
                <p style={{ marginBottom: '0.35rem' }}>✉️ Email: ops@rently.in</p>
                <p>📞 Phone: +91 (172) 480-RENT</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Bottom Line (Apple Iconic Standard) */}
        <div className="footer-bottom-row">
          <div>
            Copyright © 2026 Rently Mobility & Hyperlocal Systems Pvt. Ltd. All rights reserved.
          </div>
          <div className="footer-legal-links">
            <a href="#/trust-safety" onClick={(e) => { e.preventDefault(); onNavigate('#/trust-safety'); }}>Privacy Policy</a>
            <span>|</span>
            <a href="#/how-it-works" onClick={(e) => { e.preventDefault(); onNavigate('#/how-it-works'); }}>Terms of Use</a>
            <span>|</span>
            <a href="#/trust-safety" onClick={(e) => { e.preventDefault(); onNavigate('#/trust-safety'); }}>Legal Disclosures</a>
            <span>|</span>
            <a href="#/" onClick={(e) => { e.preventDefault(); onNavigate('#/'); }}>Site Map</a>
            {onOpenDevDrawer && (
              <>
                <span>|</span>
                <button
                  type="button"
                  onClick={onOpenDevDrawer}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                  title="Toggle Staff Workbench (Ctrl+Shift+D)"
                >
                  Workbench [Ctrl+Shift+D]
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
