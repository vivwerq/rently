import { useState } from 'react';
import { Camera, Check, ShieldCheck, CheckCircle2, X } from 'lucide-react';

interface InspectionModalProps {
  bookingData: any;
  onClose: () => void;
  onTripCompleted: () => void;
}

interface AngleCapture {
  id: string;
  name: string;
  captured: boolean;
  notes?: string;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({ bookingData, onClose, onTripCompleted }) => {
  const [activeStep, setActiveStep] = useState<'PICKUP_INSPECTION' | 'PICKUP_OTP' | 'ACTIVE_TRIP' | 'RETURN_INSPECTION' | 'RETURN_OTP' | 'DEPOSIT_RELEASED'>('PICKUP_INSPECTION');

  const [pickupAngles, setPickupAngles] = useState<AngleCapture[]>([
    { id: '1', name: 'Front & Windshield', captured: true },
    { id: '2', name: 'Right Side & Tires', captured: true },
    { id: '3', name: 'Rear Bumper & Trunk', captured: true },
    { id: '4', name: 'Left Side & Tires', captured: false },
    { id: '5', name: 'Cabin & Upholstery', captured: false },
    { id: '6', name: 'Odometer & Fuel Meter', captured: false }
  ]);

  const [pickupOtp] = useState('482910');
  const [returnOtp] = useState('739104');
  const [enteredOtp, setEnteredOtp] = useState('');

  const capturedCount = pickupAngles.filter(a => a.captured).length;

  const toggleCaptureAngle = (id: string) => {
    setPickupAngles(prev =>
      prev.map(a => (a.id === id ? { ...a, captured: !a.captured } : a))
    );
  };

  const captureAllAngles = () => {
    setPickupAngles(prev => prev.map(a => ({ ...a, captured: true })));
  };

  return (
    <div className="modal-backdrop-blur">
      <div className="modal-content-card" style={{ maxWidth: '640px' }}>
        <div className="modal-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Camera className="text-emerald" size={24} color="#10b981" />
            <div>
              <h3>
                {activeStep === 'PICKUP_INSPECTION' && 'Joint Pre-Trip Inspection (Pickup)'}
                {activeStep === 'PICKUP_OTP' && 'Pickup Handover OTP Exchange'}
                {activeStep === 'ACTIVE_TRIP' && 'Trip Active · Drive Safely'}
                {activeStep === 'RETURN_INSPECTION' && 'Return Inspection & Damage Check'}
                {activeStep === 'RETURN_OTP' && 'Return OTP Verification'}
                {activeStep === 'DEPOSIT_RELEASED' && 'Trip Completed · Deposit Refunded'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Vehicle: {bookingData.title} ({bookingData.regNumber})
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-content">
          {/* STEP 1: Pickup Inspection Angles */}
          {activeStep === 'PICKUP_INSPECTION' && (
            <>
              <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>6 Mandatory Vehicle Angles</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Tap angles to capture with live watermark</div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: capturedCount === 6 ? '#10b981' : '#f59e0b' }}>
                  {capturedCount} / 6 Complete
                </div>
              </div>

              {/* Angle Boxes */}
              <div className="inspection-grid-angles">
                {pickupAngles.map(angle => (
                  <div
                    key={angle.id}
                    className={`angle-camera-box ${angle.captured ? 'captured' : ''}`}
                    onClick={() => toggleCaptureAngle(angle.id)}
                  >
                    {angle.captured ? (
                      <>
                        <Check size={28} color="#10b981" />
                        <span style={{ fontWeight: 700 }}>{angle.name}</span>
                        <div className="watermark-overlay-label">
                          GPS 30.704°N, 76.717°E · 14:35 IST
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera size={24} />
                        <span>{angle.name}</span>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Tap to capture</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Odometer & Fuel Reading */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Odometer at Pickup</label>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>42,150 km</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Fuel Tank Level</label>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>100% Full</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={captureAllAngles}>
                  Fast-Capture All 6
                </button>
                <button
                  className="btn-primary"
                  style={{ flex: 2, justifyContent: 'center' }}
                  disabled={capturedCount < 6}
                  onClick={() => setActiveStep('PICKUP_OTP')}
                >
                  Verify Photos & Generate Pickup OTP
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Pickup OTP Handshake */}
          {activeStep === 'PICKUP_OTP' && (
            <div className="otp-display-card">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Renter's Secret Pickup OTP
              </div>
              <div className="otp-digit-group">
                {pickupOtp.split('').map((digit, idx) => (
                  <div key={idx} className="otp-box">{digit}</div>
                ))}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', maxWidth: '420px', lineHeight: 1.4 }}>
                ⚠️ <strong>Important Trust Rule:</strong> Provide this 6-digit OTP to {bookingData.operatorName} <em>only</em> after inspecting the vehicle in person and confirming the inspection photos.
              </p>

              <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', width: '100%', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Operator Verification Terminal Simulation:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP here"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    style={{
                      flex: 1,
                      background: '#020617',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.75rem',
                      color: '#fff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      letterSpacing: '0.1em'
                    }}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (enteredOtp === pickupOtp || enteredOtp === '') {
                        setActiveStep('ACTIVE_TRIP');
                      }
                    }}
                  >
                    Operator Submit OTP
                  </button>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.35rem' }}>
                  (Click submit or leave empty to auto-verify)
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Active Trip Screen */}
          {activeStep === 'ACTIVE_TRIP' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'grid', placeItems: 'center', margin: '0 auto', color: '#10b981' }}>
                <CheckCircle2 size={38} />
              </div>

              <div>
                <h4 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>Trip is Now Live!</h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Demo Step: Inspection photos verified and securely recorded in local session state.
                </p>
              </div>

              <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>Deposit in Escrow</span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }} className="font-mono">₹{bookingData.securityDeposit.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>24/7 Roadside Assistance</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>Tricity Towing Partner Connected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>Drop-off Hub</span>
                  <span style={{ color: '#fff' }}>{bookingData.handoverLocation}</span>
                </div>
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                onClick={() => setActiveStep('RETURN_INSPECTION')}
              >
                Simulate Trip End → Start Return Inspection
              </button>
            </div>
          )}

          {/* STEP 4: Return Inspection */}
          {activeStep === 'RETURN_INSPECTION' && (
            <>
              <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Vehicle Return Inspection</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Operator verifies return condition against pickup photos. Checking for new dents, scratches, fuel, and extra km.
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={28} color="#10b981" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>Zero New Scratches or Damage Detected</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Odometer at return: 42,480 km (330 km driven vs 500 km limit — 0 extra charges)</div>
                </div>
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                onClick={() => setActiveStep('RETURN_OTP')}
              >
                Confirm Return & Generate Return OTP
              </button>
            </>
          )}

          {/* STEP 5: Return OTP Exchange */}
          {activeStep === 'RETURN_OTP' && (
            <div className="otp-display-card">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Vehicle Return OTP
              </div>
              <div className="otp-digit-group">
                {returnOtp.split('').map((digit, idx) => (
                  <div key={idx} className="otp-box">{digit}</div>
                ))}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', maxWidth: '420px', lineHeight: 1.4 }}>
                Give this OTP to the operator upon handing over the keys. This triggers the automated release of your ₹{bookingData.securityDeposit.toLocaleString()} deposit!
              </p>
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
                onClick={() => setActiveStep('DEPOSIT_RELEASED')}
              >
                Operator Confirms Return OTP
              </button>
            </div>
          )}

          {/* STEP 6: Deposit Refund Release */}
          {activeStep === 'DEPOSIT_RELEASED' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'grid', placeItems: 'center', margin: '0 auto', color: '#10b981' }}>
                <CheckCircle2 size={38} />
              </div>

              <div>
                <h4 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 800 }}>Deposit Refund Initiated!</h4>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Demo Step: Full security deposit of <strong style={{ color: '#34d399' }}>₹{bookingData.securityDeposit.toLocaleString()}</strong> simulated return release confirmed.
                </p>
              </div>

              <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ color: '#94a3b8' }}>Demo Step Audit ID: <span className="font-mono" style={{ color: '#fff' }}>DEMO-RET-482910</span></div>
                <div style={{ color: '#94a3b8' }}>Deposit Status: <span style={{ color: '#10b981', fontWeight: 600 }}>REFUND SIMULATED (Local Session)</span></div>
                <div style={{ color: '#94a3b8' }}>Inspection Photos: <span style={{ color: '#38bdf8' }}>6 Verified Return Angles Recorded</span></div>
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                onClick={() => {
                  onTripCompleted();
                  onClose();
                }}
              >
                Done · Return to Marketplace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
