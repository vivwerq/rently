import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <PackageOpen size={36} />,
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div className={`ui-empty-state ${className}`} role="status">
      <div className="ui-empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="ui-empty-state-title">{title}</h3>
      <p className="ui-empty-state-desc">{description}</p>
      
      {(primaryActionLabel || secondaryActionLabel) && (
        <div className="ui-empty-state-actions">
          {primaryActionLabel && onPrimaryAction && (
            <Button variant="primary" onClick={onPrimaryAction}>
              {primaryActionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
