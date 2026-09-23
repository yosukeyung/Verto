import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, helperText, required, className = '', disabled, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full h-11 px-3 rounded-lg border text-base text-gray-900 placeholder:text-gray-400 bg-white transition-colors duration-150 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
              : 'border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500'
          } disabled:bg-gray-50 disabled:text-gray-400 ${className}`.trim()}
          {...props}
        />

        {error ? (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-red-500 mt-1.5">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-gray-500 mt-1.5">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
