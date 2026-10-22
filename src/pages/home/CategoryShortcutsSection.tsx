import React from 'react';

interface CategoryShortcutsSectionProps {
  onSelectCategory: (cat: 'ALL' | 'RENT' | 'ROOM_ESSENTIAL' | 'BUY_USED' | 'MAKER') => void;
  onSearchChange: (q: string) => void;
  scrollToResults: () => void;
}

export const CategoryShortcutsSection: React.FC<CategoryShortcutsSectionProps> = ({
  onSelectCategory,
  onSearchChange,
  scrollToResults
}) => {
  const CATEGORY_SHORTCUTS = [
    {
      id: 'cars',
      label: 'Cars',
      icon: '🚗',
      tag: 'Fleet',
      isPrimary: true,
      action: () => {
        onSelectCategory('RENT');
        const el = document.getElementById('section-cars');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    {
      id: 'cameras',
      label: 'Cameras',
      icon: '📷',
      tag: 'Creator',
      isPrimary: false,
      action: () => {
        const el = document.getElementById('section-cameras');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          onSearchChange('Camera');
          scrollToResults();
        }
      }
    },
    {
      id: 'gaming',
      label: 'Gaming',
      icon: '🎮',
      tag: 'Consoles',
      isPrimary: false,
      action: () => {
        const el = document.getElementById('section-gaming');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          onSearchChange('Gaming');
          scrollToResults();
        }
      }
    },
    {
      id: 'outdoors',
      label: 'Outdoors',
      icon: '⛺',
      tag: 'Treks',
      isPrimary: false,
      action: () => {
        const el = document.getElementById('section-outdoors');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          onSearchChange('Tent');
          scrollToResults();
        }
      }
    },
    {
      id: 'party',
      label: 'Party Gear',
      icon: '🎉',
      tag: 'Audio',
      isPrimary: false,
      action: () => {
        const el = document.getElementById('section-entertainment');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          onSelectCategory('ROOM_ESSENTIAL');
          scrollToResults();
        }
      }
    }
  ];

  return (
    <section className="browse-category-shortcuts-section" aria-label="Quick category shortcuts">
      <div className="category-shortcuts-scroll" role="tablist">
        {CATEGORY_SHORTCUTS.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`category-shortcut-chip ${cat.isPrimary ? 'priority-cars' : ''}`}
            onClick={cat.action}
            aria-label={`Browse ${cat.label}`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className="shortcut-chip-tag">{cat.tag}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
