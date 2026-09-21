import React, { forwardRef } from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white border border-gray-200 rounded-xl p-4 ${
          interactive
            ? 'hover:shadow-md transition-shadow duration-150 cursor-pointer'
            : ''
        } ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
