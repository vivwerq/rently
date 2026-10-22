import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTab?: 'GOOGLE' | 'PHONE';
  actionPromptText?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'GOOGLE',
  actionPromptText
}) => {
  const { loginWithGoogle, sendPhoneOtp, verifyPhoneOtp, isLoading, isFirebaseActive } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'GOOGLE' | 'PHONE'>(initialTab);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState<'ENTER_PHONE' | 'ENTER_CODE'>('ENTER_PHONE');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveTab(initialTab);
      setOtpStep('ENTER_PHONE');
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMessage('');
      setSuccessMessage('');
      setResendTimer(30);
    }
  }

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpStep === 'ENTER_CODE' && resendTimer > 0) {
      const timer = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [otpStep, resendTimer]);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setErrorMessage('');
    try {
      await loginWithGoogle();
      setSuccessMessage('Successfully authenticated!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not sign in with Google. Please try again.');
    }
  };

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    try {
      const result = await sendPhoneOtp(cleaned, 'recaptcha-container');
      setConfirmationResult(result.confirmationResult);
      setOtpStep('ENTER_CODE');
      setResendTimer(30);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send SMS code. Please try again.');
    }
  };

  // Handle OTP Digit Input & Auto-Advance
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all 6 digits entered
    if (newDigits.every(d => d !== '') && index === 5) {
      handleVerifyCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Verify Code
  const handleVerifyCode = async (codeToVerify?: string) => {
    setErrorMessage('');
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification OTP.');
      return;
    }

    try {
      await verifyPhoneOtp(confirmationResult, code, phoneNumber);
      setSuccessMessage('Phone verified and logged in!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid or expired OTP code.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign In to Rently"
      description={actionPromptText || 'Verified rentals, campus student privileges, and escrow-protected handovers.'}
      maxWidth="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Invisible ReCAPTCHA Container */}
        <div id="recaptcha-container" />

        {/* Tab Selection */}
        <div className="segmented-tab-control" style={{ width: '100%', display: 'flex' }}>
          <button
            id="auth-tab-google"
            type="button"
            className={`segmented-tab-btn ${activeTab === 'GOOGLE' ? 'active' : ''}`}
            onClick={() => setActiveTab('GOOGLE')}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <span>Campus Google Account</span>
          </button>
          <button
            id="auth-tab-phone"
            type="button"
            className={`segmented-tab-btn ${activeTab === 'PHONE' ? 'active' : ''}`}
            onClick={() => setActiveTab('PHONE')}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Smartphone size={14} />
            <span>Mobile OTP (+91)</span>
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div style={{ 
            background: 'var(--accent-rose-subtle)', 
            border: '1px solid rgba(244, 63, 94, 0.3)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '0.75rem 1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.825rem', 
            color: '#fda4af' 
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={{ 
            background: 'var(--accent-emerald-subtle)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '0.75rem 1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.825rem', 
            color: 'var(--accent-emerald)' 
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: GOOGLE 1-TAP LOGIN */}
        {activeTab === 'GOOGLE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Campus Perk Callout */}
            <div style={{ 
              background: 'var(--accent-emerald-subtle)', 
              border: '1px solid rgba(16, 185, 129, 0.25)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '1rem', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.75rem' 
            }}>
              <Sparkles size={20} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  Student Privileges Unlocked Automatically
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.45 }}>
                  Sign in with an institutional email (<strong>@cuchd.in</strong>, <strong>@pu.ac.in</strong>, <strong>@pec.edu.in</strong>, etc.) to get <strong>50% off furniture deposits</strong> and campus gate pickup.
                </div>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              id="auth-google-signin-btn"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-standard)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.925rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Google 4-Color SVG Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Non-student accounts are also supported for commercial fleet rentals and Tricity marketplace orders.
            </div>
          </div>
        )}

        {/* TAB 2: PHONE OTP LOGIN */}
        {activeTab === 'PHONE' && (
          <div>
            {otpStep === 'ENTER_PHONE' ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
                    Enter Indian Mobile Number
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      padding: '0.65rem 0.85rem', 
                      background: 'var(--surface-secondary)', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: 'var(--radius-md)', 
                      fontSize: '0.9rem', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)' 
                    }}>
                      🇮🇳 +91
                    </div>
                    <input
                      id="auth-phone-input"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      maxLength={10}
                      autoFocus
                      required
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.85rem',
                        background: 'var(--surface-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', display: 'block' }}>
                    We send a 6-digit SMS verification code to verify handovers.
                  </span>
                </div>

                <Button
                  id="auth-send-otp-btn"
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
                  <span>Send Handover OTP</span>
                  <ArrowRight size={14} />
                </Button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Enter the 6-digit OTP sent to <strong>+91 {phoneNumber}</strong>
                  </div>
                  {!isFirebaseActive && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                      💡 Demo Mode: Use verification code <strong>482910</strong> or any 6-digit code.
                    </div>
                  )}
                </div>

                {/* 6 Digit Input Boxes */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`auth-otp-digit-${index}`}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      style={{
                        width: '44px',
                        height: '52px',
                        textAlign: 'center',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${digit ? 'var(--accent-emerald)' : 'var(--border-standard)'}`,
                        background: digit ? 'var(--accent-emerald-subtle)' : 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <button
                    type="button"
                    onClick={() => setOtpStep('ENTER_PHONE')}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', padding: 0 }}
                  >
                    Change phone number
                  </button>

                  {resendTimer > 0 ? (
                    <span style={{ color: 'var(--text-tertiary)' }}>Resend code in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--accent-emerald)', 
                        fontWeight: 700, 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        padding: 0 
                      }}
                    >
                      <RotateCcw size={12} />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>

                <Button
                  id="auth-verify-otp-btn"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  onClick={() => handleVerifyCode()}
                >
                  <span>Verify OTP & Sign In</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Security Footer Notice */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.4rem', 
          fontSize: '0.75rem', 
          color: 'var(--text-tertiary)',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <ShieldCheck size={13} color="var(--accent-emerald)" />
          <span>Encrypted Razorpay escrow trust & certified Tricity commercial partner network</span>
        </div>
      </div>
    </Modal>
  );
};
