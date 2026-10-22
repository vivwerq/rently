import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'resale' | 'maker' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`ui-badge ui-badge-${variant} ui-badge-${size} ${className}`}
      {...props}
    >
      {icon && <span className="ui-badge-icon" aria-hidden="true">{icon}</span>}
      <span className="ui-badge-text">{children}</span>
    </span>
  );
};
