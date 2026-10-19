import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      isLoading = false,
      disabled,
      type = 'button',
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'h-11 px-5 rounded-lg text-sm font-medium transition-colors duration-150 inline-flex items-center justify-center gap-2 select-none focus-visible:outline-2 focus-visible:outline-offset-2'

    const variantStyles = {
      primary:
        'bg-orange-500 hover:bg-orange-600 text-white focus-visible:outline-orange-500 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500 disabled:cursor-not-allowed',
      secondary:
        'bg-transparent hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 dark:text-white dark:border-neutral-800 dark:hover:bg-neutral-900 dark:hover:border-neutral-700 focus-visible:outline-orange-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 dark:disabled:bg-neutral-900 dark:disabled:text-neutral-500 dark:disabled:border-neutral-800 disabled:cursor-not-allowed',
      danger:
        'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 dark:bg-red-950/40 dark:hover:bg-red-950/70 dark:text-red-400 dark:border-red-900 focus-visible:outline-red-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`.trim()}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin shrink-0" strokeWidth={1.75} />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
