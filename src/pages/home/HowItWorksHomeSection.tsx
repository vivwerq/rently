import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface HowItWorksHomeSectionProps {
  onNavigate: (path: string) => void;
}

export const HowItWorksHomeSection: React.FC<HowItWorksHomeSectionProps> = ({ onNavigate }) => {
  return (
    <section className="how-it-works-home-section" aria-labelledby="how-it-works-heading">
      <div className="section-headline-group">
        <div className="section-micro-badge">
          <CheckCircle size={13} />
          <span>Simple & Verified</span>
        </div>
        <h2 id="how-it-works-heading" className="section-main-heading">
          How Rently works
        </h2>
        <p className="section-sub-copy">
          A transparent 3-step handover designed to eliminate arbitrary deposit deductions and double-booking scams.
        </p>
      </div>

      <div className="how-steps-row">
        <div className="how-step-item">
          <span className="how-step-number-tag">1</span>
          <h3 className="how-step-heading">Choose what you need.</h3>
          <p className="how-step-text">
            Browse verified commercial cars, student room kits, or creator equipment near your campus or sector.
          </p>
        </div>

        <div className="how-step-item">
          <span className="how-step-number-tag">2</span>
          <h3 className="how-step-heading">Confirm dates and details.</h3>
          <p className="how-step-text">
            Review all-in transparent pricing with upfront escrow deposits, student ID benefits, and zero hidden checkout fees.
          </p>
        </div>

        <div className="how-step-item">
          <span className="how-step-number-tag">3</span>
          <h3 className="how-step-heading">Pick up and enjoy.</h3>
          <p className="how-step-text">
            Complete a synchronized 6-point photo inspection and secure OTP handshake at a campus safe spot or your doorstep.
          </p>
        </div>
      </div>

      <div className="how-steps-footer-note">
        <span>Buying pre-loved or ordering custom crafts? Direct peer transfer and artisan lead times apply with zero rental return obligations.</span>
        <a
          href="#/how-it-works"
          className="how-details-link"
          onClick={(e) => { e.preventDefault(); onNavigate('#/how-it-works'); }}
        >
          <span>Read complete 4-step handover & escrow guide</span>
          <ArrowRight size={13} />
        </a>
      </div>
    </section>
  );
};
