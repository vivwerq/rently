import React, { useId } from 'react';
import { X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
  onClear?: () => void;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      prefixElement,
      suffixElement,
      onClear,
      fullWidth = true,
      className = '',
      id,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasError = Boolean(errorMessage);

    return (
      <div className={`ui-input-wrapper ${fullWidth ? 'ui-input-full' : ''} ${hasError ? 'ui-input-has-error' : ''} ${disabled ? 'ui-input-disabled' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="ui-input-label">
            {label}
            {props.required && <span className="ui-input-required" aria-hidden="true"> *</span>}
          </label>
        )}

        <div className={`ui-input-container ${className}`}>
          {prefixElement && (
            <div className="ui-input-prefix" aria-hidden="true">
              {prefixElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            value={value}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            className="ui-input-field"
            {...props}
          />

          {onClear && value && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="ui-input-clear-btn"
              aria-label="Clear input"
            >
              <X size={14} />
            </button>
          )}

          {suffixElement && (
            <div className="ui-input-suffix" aria-hidden="true">
              {suffixElement}
            </div>
          )}
        </div>

        {hasError && (
          <p id={errorId} className="ui-input-error-msg" role="alert">
            {errorMessage}
          </p>
        )}

        {!hasError && helperText && (
          <p id={helperId} className="ui-input-helper-msg">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
