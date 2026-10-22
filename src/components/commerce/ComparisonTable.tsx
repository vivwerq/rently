import React from 'react';
import { X, Check, ShieldCheck, MapPin } from 'lucide-react';
import type { ListingItem } from '../../data/mockData';
import { Button } from '../ui/Button';

interface ComparisonTableProps {
  items: ListingItem[];
  onRemoveItem: (id: string, e: React.MouseEvent) => void;
  onSelectItem: (item: ListingItem) => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  items,
  onRemoveItem,
  onSelectItem
}) => {
  if (items.length < 2) return null;

  return (
    <div className="comparison-table-wrapper" role="region" aria-label="Item comparison matrix">
      <div className="comparison-table-header">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Side-by-Side Specifications Comparison
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Comparing {items.length} saved options
        </span>
      </div>

      <div className="comparison-table-scroll">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="comparison-label-col">Specification</th>
              {items.map(item => (
                <th key={item.id} className="comparison-item-col">
                  <div className="comparison-item-card">
                    <button
                      type="button"
                      className="comparison-remove-btn"
                      onClick={(e) => onRemoveItem(item.id, e)}
                      aria-label={`Remove ${item.title} from comparison`}
                    >
                      <X size={14} />
                    </button>
                    <img src={item.primaryImage} alt={item.title} className="comparison-item-thumb" />
                    <h4 className="comparison-item-title">{item.title}</h4>
                    <div className="comparison-item-price">
                      <strong>₹{item.price.toLocaleString()}</strong>
                      <span> {item.priceUnit}</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => onSelectItem(item)}
                    >
                      View Details
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="comparison-label-cell">Category / Mode</td>
              {items.map(item => (
                <td key={item.id} className="comparison-val-cell">
                  <span className="brand-badge">{item.category}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label-cell">Distance from You</td>
              {items.map(item => (
                <td key={item.id} className="comparison-val-cell">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                    <MapPin size={13} /> {item.distanceKm} km
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label-cell">Refundable Escrow Deposit</td>
              {items.map(item => (
                <td key={item.id} className="comparison-val-cell">
                  <strong style={{ color: item.deposit > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                    {item.deposit > 0 ? `₹${item.deposit.toLocaleString()}` : 'Zero Deposit'}
                  </strong>
                </td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label-cell">Location Hub</td>
              {items.map(item => (
                <td key={item.id} className="comparison-val-cell">
                  {item.location}
                </td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label-cell">Technical Specifications</td>
              {items.map(item => (
                <td key={item.id} className="comparison-val-cell">
                  {item.carSpecs ? (
                    <div>
                      <div>{item.carSpecs.transmission} · {item.carSpecs.fuel}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {item.carSpecs.seats} Seats · {item.carSpecs.kmLimitDaily} km/day
                      </div>
                    </div>
                  ) : item.makerSpecs ? (
                    <div>
                      <div>{item.makerSpecs.materials}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {item.makerSpecs.leadDays} Days Handcrafted Lead Time
                      </div>
                    </div>
                  ) : item.resaleSpecs ? (
                    <div>
                      <div>Original MRP: ₹{item.resaleSpecs.originalPrice.toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '2px' }}>
                        Defects: {item.resaleSpecs.knownDefects}
                      </div>
                    </div>
                  ) : (
                    <div>{item.condition || 'Tested & Sanitized'}</div>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label-cell">Campus Privilege</td>
              {items.map(item => (
                <td key={item.id} className="comparison-val-cell highlight-cell">
                  {item.studentPerk ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: 'var(--accent-blue)', fontSize: '0.78rem' }}>
                      <Check size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item.studentPerk}</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-tertiary)' }}>Standard verification</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="comparison-label-cell">Verification Standard</td>
              {items.map(item => (
                <td key={item.id} className="comparison-val-cell">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>
                    <ShieldCheck size={14} /> 100% Handover Protected
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
