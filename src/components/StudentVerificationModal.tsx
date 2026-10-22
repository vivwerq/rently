import React, { useState } from 'react';
import { CheckCircle2, Sparkles, MapPin } from 'lucide-react';
import { LOCALITIES } from '../data/mockData';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface StudentVerificationModalProps {
  onClose: () => void;
  onVerified: (institutionName: string) => void;
}

export const StudentVerificationModal: React.FC<StudentVerificationModalProps> = ({ onClose, onVerified }) => {
  const [selectedCampus, setSelectedCampus] = useState('CU_GHARUAN');
  const [rollNumber, setRollNumber] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const campusList = LOCALITIES.filter(loc => loc.type === 'CAMPUS');
  const activeCampus = campusList.find(c => c.id === selectedCampus);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onVerified(activeCampus?.name || 'Verified University');
    }, 1200);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="College & Campus Verification"
      description="Unlock 50% deposit reductions and campus gate handovers."
      maxWidth="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {!isSuccess ? (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Campus Selector */}
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
                Select Your University / College
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {campusList.map(campus => {
                  const isSelected = selectedCampus === campus.id;
                  return (
                    <div
                      key={campus.id}
                      onClick={() => setSelectedCampus(campus.id)}
                      style={{
                        background: isSelected ? 'var(--accent-emerald-subtle)' : 'var(--surface-secondary)',
                        border: `1px solid ${isSelected ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '0.65rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 150ms ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {campus.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          {campus.catchment} · {campus.studentCount}
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={18} color="var(--accent-emerald)" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Student Roll ID input & Meetup spot */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Student Roll ID / Email"
                required
                placeholder="e.g. 21BCS1089 or .edu"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />

              <div>
                <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Designated Safe Handover
                </label>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', background: 'var(--accent-blue-subtle)', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 113, 227, 0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ flexShrink: 0 }} />
                  <span>{activeCampus?.safeHandoverSpot}</span>
                </div>
              </div>
            </div>

            {/* Student Perks Summary */}
            <div style={{ background: 'var(--accent-emerald-subtle)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <Sparkles size={14} /> Unlocked Campus Privileges:
              </div>
              <ul style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 1.6, margin: 0 }}>
                <li>50% deposit waiver on semester room furniture (study desk + chair)</li>
                <li>0% platform commission on student textbook & study gear resale</li>
                <li>20% extra km allowance on weekend Himachal/Kasauli self-drive rentals</li>
                <li>Designated safe handover verification at campus security gates</li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              type="submit"
            >
              Verify & Activate Student ID Badge
            </Button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-emerald-subtle)', display: 'grid', placeItems: 'center', color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 800, margin: 0 }}>
                Student Badge Verified!
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Your identity has been verified with <strong>{activeCampus?.name}</strong>. Enjoy zero-commission peer trades and reduced rental deposits.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
