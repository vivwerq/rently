import { useState, useEffect, useCallback } from 'react';
import { X, Scale, RefreshCw, CheckCircle2 } from 'lucide-react';
import { apiClient, type LedgerAuditResponse } from '../services/apiClient';

interface AdminConsoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminConsoleDrawer: React.FC<AdminConsoleDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'FLEET_COMPLIANCE' | 'ARBITRATION' | 'LEDGER'>('FLEET_COMPLIANCE');
  const [ledgerData, setLedgerData] = useState<LedgerAuditResponse | null>(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  const fetchLedger = useCallback(async () => {
    setLoadingLedger(true);
    try {
      const data = await apiClient.getLedgerAudit();
      setLedgerData(data);
    } finally {
      setLoadingLedger(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (isOpen && activeTab === 'LEDGER') {
      apiClient.getLedgerAudit().then((data) => {
        if (!ignore) {
          setLedgerData(data);
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-blur">
      <div className="modal-content-card" style={{ maxWidth: '800px', maxHeight: '88vh' }}>
        <div className="modal-header-row" style={{ background: '#0b1120' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Scale size={24} color="#10b981" />
            <div>
              <h3>Rently Staff & Operations Workbench</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Fleet Compliance · Side-by-Side Damage Arbitration · Double-Entry Ledger
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab Header */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(2, 6, 23, 0.5)', borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('FLEET_COMPLIANCE')}
            style={{
              background: activeTab === 'FLEET_COMPLIANCE' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'FLEET_COMPLIANCE' ? '#34d399' : '#94a3b8',
              border: `1px solid ${activeTab === 'FLEET_COMPLIANCE' ? '#10b981' : 'transparent'}`,
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🚗 Fleet Compliance & Expiry
          </button>
          <button
            onClick={() => setActiveTab('ARBITRATION')}
            style={{
              background: activeTab === 'ARBITRATION' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'ARBITRATION' ? '#34d399' : '#94a3b8',
              border: `1px solid ${activeTab === 'ARBITRATION' ? '#10b981' : 'transparent'}`,
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⚖️ Side-by-Side Photo Arbitration
          </button>
          <button
            onClick={() => setActiveTab('LEDGER')}
            style={{
              background: activeTab === 'LEDGER' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'LEDGER' ? '#34d399' : '#94a3b8',
              border: `1px solid ${activeTab === 'LEDGER' ? '#10b981' : 'transparent'}`,
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📊 Double-Entry Ledger (Razorpay Route)
          </button>
        </div>

        <div className="modal-body-content">
          {activeTab === 'FLEET_COMPLIANCE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Automated document enforcement: Assets with insurance, fitness, or commercial Rent-a-Cab permit expiring in &lt; 7 days are auto-paused from public search.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.85rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Hyundai Creta (PB65-AX-7821) · Tricity Mobility</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      Commercial Permit: Valid to 2028 · Self-Drive Insurance: Valid to Oct 2027 · PUC: Valid
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#10b981', color: '#020617', padding: '3px 8px', borderRadius: '9999px', fontWeight: 800 }}>
                    ACTIVE & SEARCHABLE
                  </span>
                </div>

                <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '0.85rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Mahindra Thar (PB10-CM-9014) · Apex Fleet</div>
                    <div style={{ fontSize: '0.75rem', color: '#fde68a', marginTop: '2px' }}>
                      ⚠️ Commercial Fitness expires in 12 days (Nov 2, 2026). Renewal reminder dispatched.
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#f59e0b', color: '#020617', padding: '3px 8px', borderRadius: '9999px', fontWeight: 800 }}>
                    EXPIRING SOON
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ARBITRATION' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Operator Damage Claim Dispute: Compare pre-trip pickup photo against post-trip return photo with timestamp and GPS hash.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>
                    Pickup Photo (Pre-Trip)
                  </div>
                  <div style={{ height: '140px', background: '#111827', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                    Front Right Fender · 0 Scratches · Hash: e9a41...
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>GPS: 30.7046° N, 76.7179° E · Oct 20 14:35 IST</div>
                </div>

                <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>
                    Return Photo (Post-Trip)
                  </div>
                  <div style={{ height: '140px', background: '#111827', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                    Front Right Fender · 0 Scratches · Matched!
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>GPS: 30.7048° N, 76.7181° E · Oct 22 17:15 IST</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                  Reject Operator Claim
                </button>
                <button className="btn-primary" style={{ fontSize: '0.8rem' }}>
                  Release 100% Escrow Deposit to Renter (₹3,000)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'LEDGER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Live double-entry audit reconciliation across segregated escrow & supplier payables:
                </div>
                <button
                  onClick={fetchLedger}
                  disabled={loadingLedger}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    borderRadius: '6px',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={12} className={loadingLedger ? 'spin' : ''} />
                  Re-Audit
                </button>
              </div>

              {ledgerData ? (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    background: ledgerData.report.isBalanced ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${ledgerData.report.isBalanced ? '#10b981' : '#ef4444'}`,
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="#10b981" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>
                        {ledgerData.report.isBalanced ? 'DOUBLE-ENTRY BALANCED & RECONCILED' : 'DISCREPANCY DETECTED'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                      Discrepancy: ₹{ledgerData.report.discrepancy.toFixed(2)}
                    </span>
                  </div>

                  {/* Summary metric cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Escrow Trust Held</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                        ₹{ledgerData.report.summary.totalEscrowHeld.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Supplier Payables</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#60a5fa', marginTop: '2px' }}>
                        ₹{ledgerData.report.summary.totalSupplierPayables.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Platform Commission</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                        ₹{ledgerData.report.summary.totalPlatformRevenue.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Accounts table */}
                  <div style={{ background: 'rgba(2, 6, 23, 0.8)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                    <div style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '6px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr' }}>
                      <span>LEDGER ACCOUNT</span>
                      <span>TYPE</span>
                      <span style={{ textAlign: 'right' }}>BALANCE (₹)</span>
                    </div>
                    {ledgerData.report.accounts.map(acc => (
                      <div key={acc.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '3px 0' }}>
                        <span style={{ color: '#fff' }}>{acc.name}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>{acc.type}</span>
                        <span style={{ textAlign: 'right', color: acc.balance > 0 ? '#34d399' : '#94a3b8' }}>
                          ₹{acc.balance.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '6px', paddingTop: '4px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', fontWeight: 800 }}>
                      <span style={{ color: '#10b981' }}>TOTAL DEBITS / CREDITS</span>
                      <span style={{ color: '#10b981' }}>RECONCILED</span>
                      <span style={{ textAlign: 'right', color: '#10b981' }}>₹{ledgerData.report.totalDebits.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ background: 'rgba(2, 6, 23, 0.8)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  <div style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '6px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr' }}>
                    <span>ACCOUNT</span>
                    <span>DEBIT (₹)</span>
                    <span>CREDIT (₹)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '2px 0' }}>
                    <span style={{ color: '#fff' }}>Customer Funds Receivable</span>
                    <span style={{ color: '#34d399' }}>9,840.00</span>
                    <span>-</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '2px 0' }}>
                    <span style={{ color: '#fff' }}>Supplier Payable (Tricity Hub)</span>
                    <span>-</span>
                    <span style={{ color: '#cbd5e1' }}>5,100.00</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '2px 0' }}>
                    <span style={{ color: '#fff' }}>Platform Commission Revenue (15%)</span>
                    <span>-</span>
                    <span style={{ color: '#10b981' }}>900.00</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '2px 0' }}>
                    <span style={{ color: '#fff' }}>Deposit Escrow Liability (Renter)</span>
                    <span>-</span>
                    <span style={{ color: '#fbbf24' }}>3,000.00</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '6px', paddingTop: '4px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', fontWeight: 800 }}>
                    <span style={{ color: '#10b981' }}>TOTAL (BALANCED)</span>
                    <span style={{ color: '#10b981' }}>9,840.00</span>
                    <span style={{ color: '#10b981' }}>9,840.00</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
