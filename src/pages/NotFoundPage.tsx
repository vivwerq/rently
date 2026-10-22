import { HelpCircle, ArrowRight } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage = ({ onNavigate }: NotFoundPageProps) => {
  return (
    <main className="details-page-container" role="main" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', background: 'var(--surface-secondary)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <HelpCircle size={32} />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
        Page or Listing Not Found
      </h1>

      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
        The listing, category, or location route you requested might have been rented out, relocated, or does not exist in our Tri-City network.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="nav-action-btn primary" onClick={() => onNavigate('#/')}>
          Return to Marketplace <ArrowRight size={14} />
        </button>
        <button className="nav-action-btn" onClick={() => onNavigate('#/how-it-works')}>
          Read How Rently Works
        </button>
      </div>
    </main>
  );
};
