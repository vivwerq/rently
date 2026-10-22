import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const classNames = [
      'ui-button',
      `ui-button-${variant}`,
      `ui-button-${size}`,
      fullWidth ? 'ui-button-full' : '',
      isLoading ? 'ui-button-loading' : '',
      className
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <span className="ui-button-spinner" aria-hidden="true" />
        )}
        {!isLoading && leftIcon && (
          <span className="ui-button-icon-left" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className="ui-button-text">{children}</span>
        {!isLoading && rightIcon && (
          <span className="ui-button-icon-right" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
