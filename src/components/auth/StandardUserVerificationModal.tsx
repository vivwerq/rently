import React, { useState } from 'react';
import { 
  ShieldCheck, X, GraduationCap, FileText, 
  Car, Building, CheckCircle2, AlertCircle, HardDrive
} from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../context/useAuth';
import type { ListingVerificationType } from '../../types/auth';

interface StandardUserVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: () => void;
  onSaveToLocalCacheOnly: () => void;
  listingTitle?: string;
  category?: string;
}

export const StandardUserVerificationModal: React.FC<StandardUserVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerificationSuccess,
  onSaveToLocalCacheOnly,
  listingTitle,
  category
}) => {
  const { profile, verifyAsStandardHost, isLoading } = useAuth();

  const [verificationType, setVerificationType] = useState<ListingVerificationType>(
    category === 'CAR' ? 'COMMERCIAL_PERMIT' : 
    profile?.isStudentVerified ? 'STUDENT_PASS' : 'STUDENT_PASS'
  );
  const [idNumber, setIdNumber] = useState(
    profile?.studentDetails?.rollNumber || ''
  );
  const documentName = verificationType === 'STUDENT_PASS'
    ? 'Campus Student SmartCard'
    : verificationType === 'COMMERCIAL_PERMIT'
    ? 'Punjab RTO Yellow Plate Cab Permit'
    : verificationType === 'GOV_ID'
    ? 'Government Photo Identity Document'
    : 'Shop Trade & Business License';

  const [issuer, setIssuer] = useState(
    profile?.studentDetails?.institutionName || 'Chandigarh University (CU)'
  );
  const [phoneConfirm, setPhoneConfirm] = useState(profile?.phoneNumber || '+91 98765 43210');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleInstantStudentUpgrade = async () => {
    setIsVerifying(true);
    setErrorMsg('');
    try {
      await verifyAsStandardHost({
        verificationType: 'STUDENT_PASS',
        idNumber: profile?.studentDetails?.rollNumber || '21BCS4829',
        documentName: 'Verified Campus Student SmartCard',
        issuer: profile?.studentDetails?.institutionName || 'Chandigarh University (CU)'
      });
      onVerificationSuccess();
    } catch {
      setErrorMsg('Failed to complete verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber.trim()) {
      setErrorMsg('Please enter your registration / ID number.');
      return;
    }
    if (!phoneConfirm.trim()) {
      setErrorMsg('Please provide a verified mobile contact number.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      await verifyAsStandardHost({
        verificationType,
        idNumber: idNumber.trim(),
        documentName: documentName.trim() || `${verificationType} Document`,
        issuer: issuer.trim() || 'Official Verification Authority'
      });
      onVerificationSuccess();
    } catch {
      setErrorMsg('Verification could not be processed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="modal-card" 
        style={{ 
          maxWidth: '560px', 
          width: '94%',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem 1.75rem',
          boxShadow: 'var(--shadow-modal)'
        }}
      >
        {/* Header with Close */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: 'var(--accent-emerald-subtle)', 
              color: 'var(--accent-emerald)', 
              display: 'grid', 
              placeItems: 'center',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              flexShrink: 0
            }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Standard Host Verification
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Required for publishing live to the public internet
              </div>
            </div>
          </div>
          <button 
            type="button"
            className="action-icon-btn" 
            onClick={onClose} 
            aria-label="Close Verification Modal"
            style={{ borderRadius: '50%', width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Informative banner */}
        <div style={{ 
          background: 'var(--surface-secondary)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-md)', 
          padding: '0.85rem 1rem', 
          marginBottom: '1.25rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          To safeguard students and residents across Chandigarh, Mohali, and Kharar, all listings going live on the internet require identity verification. 
          {listingTitle && (
            <div style={{ marginTop: '4px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Target Asset: "{listingTitle}"
            </div>
          )}
        </div>

        {errorMsg && (
          <div style={{ 
            background: 'var(--accent-rose-subtle)', 
            border: '1px solid rgba(244, 63, 94, 0.3)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '0.65rem 0.85rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.8rem', 
            color: '#fda4af',
            marginBottom: '1rem' 
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1-Click Fast Track for existing student pass */}
        {profile?.isStudentVerified && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.08)', 
            border: '1.5px solid rgba(16, 185, 129, 0.3)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '1.1rem', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Active Campus Student Pass Detected!
              </strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.85rem 0', lineHeight: 1.4 }}>
              Your account already holds verified student credentials (<strong>{profile.studentDetails?.rollNumber || 'CU Roll'}</strong> - {profile.studentDetails?.institutionName || 'Chandigarh University'}). 
              You can instantly upgrade to Standard Listing Host in 1 click.
            </p>
            <Button
              id="instant-verify-btn"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isVerifying || isLoading}
              onClick={handleInstantStudentUpgrade}
              leftIcon={<ShieldCheck size={16} />}
            >
              1-Click Verify & Publish to Internet Now
            </Button>
          </div>
        )}

        {/* Manual Verification Form */}
        <form onSubmit={handleManualVerificationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '0.4rem' }}>
              Choose Verification Credential Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className={`category-chip-btn ${verificationType === 'STUDENT_PASS' ? 'active' : ''}`}
                onClick={() => setVerificationType('STUDENT_PASS')}
                style={{ fontSize: '0.78rem', justifyContent: 'center', padding: '0.6rem 0.4rem' }}
              >
                <GraduationCap size={15} />
                <span>Student ID Pass</span>
              </button>
              <button
                type="button"
                className={`category-chip-btn ${verificationType === 'COMMERCIAL_PERMIT' ? 'active' : ''}`}
                onClick={() => setVerificationType('COMMERCIAL_PERMIT')}
                style={{ fontSize: '0.78rem', justifyContent: 'center', padding: '0.6rem 0.4rem' }}
              >
                <Car size={15} />
                <span>RTO Cab Permit</span>
              </button>
              <button
                type="button"
                className={`category-chip-btn ${verificationType === 'GOV_ID' ? 'active' : ''}`}
                onClick={() => setVerificationType('GOV_ID')}
                style={{ fontSize: '0.78rem', justifyContent: 'center', padding: '0.6rem 0.4rem' }}
              >
                <FileText size={15} />
                <span>Govt Photo ID</span>
              </button>
              <button
                type="button"
                className={`category-chip-btn ${verificationType === 'SHOP_TRADE' ? 'active' : ''}`}
                onClick={() => setVerificationType('SHOP_TRADE')}
                style={{ fontSize: '0.78rem', justifyContent: 'center', padding: '0.6rem 0.4rem' }}
              >
                <Building size={15} />
                <span>Shop / GSTIN</span>
              </button>
            </div>
          </div>

          {/* Dynamic ID Input */}
          <div className="form-field-group">
            <label className="form-label" htmlFor="verification-id-input">
              {verificationType === 'STUDENT_PASS' ? 'University Student Roll Number *' :
               verificationType === 'COMMERCIAL_PERMIT' ? 'Punjab Commercial Cab Registration / Permit *' :
               verificationType === 'GOV_ID' ? 'Aadhaar / Driving License Number *' :
               'Shop Trade License / GSTIN *'}
            </label>
            <input
              id="verification-id-input"
              type="text"
              className="form-input"
              placeholder={
                verificationType === 'STUDENT_PASS' ? 'e.g. 21BCS4829 or PU/2023/819' :
                verificationType === 'COMMERCIAL_PERMIT' ? 'e.g. PB65-AX-7821 (Yellow Plate)' :
                verificationType === 'GOV_ID' ? 'e.g. DL-042011002345 or XXXX-XXXX-9812' :
                'e.g. 03AAAAA0000A1Z5 or Kharar Market License #14'
              }
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-field-group">
              <label className="form-label" htmlFor="verification-issuer">
                Issuing Campus / Authority *
              </label>
              <input
                id="verification-issuer"
                type="text"
                className="form-input"
                placeholder="e.g. CU Gharuan / Punjab RTO"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                required
              />
            </div>

            <div className="form-field-group">
              <label className="form-label" htmlFor="verification-phone">
                Handover Phone (OTP) *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="verification-phone"
                  type="text"
                  className="form-input"
                  value={phoneConfirm}
                  onChange={(e) => setPhoneConfirm(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <Button
              id="submit-verify-online-btn"
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isVerifying || isLoading}
              leftIcon={<ShieldCheck size={16} />}
            >
              Verify Identity & Publish to Internet →
            </Button>

            <button
              id="save-local-cache-btn"
              type="button"
              className="nav-action-btn"
              onClick={onSaveToLocalCacheOnly}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.75rem',
                border: '1px dashed var(--border-strong)',
                background: 'var(--surface-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                color: 'var(--text-secondary)'
              }}
            >
              <HardDrive size={15} color="var(--accent-amber)" />
              <span>Save to Local Device Cache (Offline Draft) Instead</span>
            </button>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '4px' }}>
            🔒 Bank-grade encrypted verification. Your documents are never shared publicly.
          </div>
        </form>
      </div>
    </div>
  );
};
