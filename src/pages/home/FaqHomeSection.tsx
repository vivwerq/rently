import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'What do I need to rent a car or item?',
    answer: 'For self-drive cars, you need an original Driving Licence (minimum 1 year old) and Aadhaar verification. College students can upload their valid student ID for 50% reduced security deposits and campus gate delivery. For cameras, electronics, and camping gear, a valid government ID and local phone verification are required.'
  },
  {
    question: 'Is a security deposit required?',
    answer: 'Yes, rentals require a refundable security deposit to protect owners against damage. Your deposit is held safely in a segregated third-party escrow account—never in the operator\'s personal account. If you are a verified student, you receive up to 50% off standard deposit amounts. Deposits are released back to your bank account or UPI within 2 hours of post-trip return inspection.'
  },
  {
    question: 'Can I collect the item or get it delivered?',
    answer: 'Both options are supported. You can choose free self-pickup at designated campus safe meetup spots (like CU Gate 2, PU Stu-C, or CGC Gate 1) or commercial operator hubs in Mohali, Chandigarh, and Kharar. Alternatively, you can select doorstep handover for an optional flat ₹250 delivery fee across Chandigarh, Mohali, Kharar, and Zirakpur.'
  },
  {
    question: 'What happens if I cancel?',
    answer: 'Cancellations made 6 hours or more before the scheduled trip start are 100% free with a full immediate refund. If cancelled within 6 hours of trip start, a nominal operator preparation fee (₹200–₹350 depending on category) is retained to cover fleet staging logistics, and the remainder is refunded.'
  },
  {
    question: 'What happens if an item is damaged?',
    answer: 'Before every handover, both the renter and operator complete a mandatory 6-point synchronized photo checklist with GPS coordinates and atomic timestamps. When returning, a 2-minute photo check is conducted. Operators cannot make arbitrary deductions: if new damage is reported, our operations team conducts independent photo arbitration comparing pickup vs return photos. Normal wear-and-tear is never charged to the renter.'
  }
];

export const FaqHomeSection: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => prev === index ? null : index);
  };

  return (
    <section className="faq-home-section" aria-labelledby="faq-section-heading">
      <div className="section-headline-group">
        <div className="section-micro-badge">
          <HelpCircle size={13} />
          <span>Clear Answers</span>
        </div>
        <h2 id="faq-section-heading" className="section-main-heading">
          Frequently asked questions
        </h2>
        <p className="section-sub-copy">
          Everything you need to know about deposits, verified handovers, and cancellation policies.
        </p>
      </div>

      <div className="faq-accordion-list" role="region" aria-label="Frequently Asked Questions Accordion">
        {FAQS.map((faq, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div key={idx} className={`faq-accordion-item ${isOpen ? 'open' : ''}`}>
              <button
                type="button"
                id={`faq-btn-${idx}`}
                className="faq-question-btn"
                onClick={() => toggleFaq(idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${idx}`}
              >
                <span>{faq.question}</span>
                <ChevronDown size={18} className="faq-chevron" />
              </button>
              {isOpen && (
                <div
                  id={`faq-panel-${idx}`}
                  className="faq-answer-panel"
                  role="region"
                  aria-labelledby={`faq-btn-${idx}`}
                >
                  <p style={{ margin: 0 }}>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
