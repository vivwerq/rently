import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxHeight = '85vh'
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="ui-sheet-overlay"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={sheetRef}
        className="ui-sheet-container"
        style={{ maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ui-sheet-drag-handle" aria-hidden="true" />

        {title && (
          <div className="ui-sheet-header">
            <h3 className="ui-sheet-title">{title}</h3>
            <button
              type="button"
              className="ui-sheet-close-btn"
              onClick={onClose}
              aria-label="Close sheet"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="ui-sheet-body">
          {children}
        </div>

        {footer && (
          <div className="ui-sheet-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
