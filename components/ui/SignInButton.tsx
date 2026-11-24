'use client'

import React from 'react'
import { useDelayedNavigation } from '@/components/ui/NavigationLoading'

export interface SignInButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destination?: string
}

export function SignInButton({
  children = 'Sign In',
  className = 'text-sm font-medium text-gray-700 hover:text-gray-900 px-3.5 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500',
  destination = '/login',
  onClick,
  ...props
}: SignInButtonProps) {
  const { navigate, overlay } = useDelayedNavigation()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    if (!e.defaultPrevented) {
      navigate(destination)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={className}
        {...props}
      >
        <span>{children}</span>
      </button>
      {overlay}
    </>
  )
}
