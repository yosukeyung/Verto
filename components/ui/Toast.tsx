import React from 'react'
import { Check, AlertCircle, AlertTriangle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning'

export interface ToastProps {
  type?: ToastType
  message: string
  onClose?: () => void
  className?: string
}

export function Toast({ type = 'success', message, onClose, className = '' }: ToastProps) {
  const styles = {
    success: {
      bg: 'bg-green-50 border-green-200 text-green-900',
      icon: <Check className="w-5 h-5 shrink-0 text-green-600" strokeWidth={1.75} />,
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 shrink-0 text-red-600" strokeWidth={1.75} />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" strokeWidth={1.75} />,
    },
  }

  const current = styles[type]

  return (
    <div
      role="status"
      className={`animate-toast flex items-start gap-3 p-4 rounded-xl border shadow-sm ${current.bg} ${className}`.trim()}
    >
      {current.icon}
      <p className="text-sm font-medium flex-1 pt-0.5">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="text-gray-400 hover:text-gray-700 p-0.5 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
}
