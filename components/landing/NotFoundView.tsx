import React from 'react'
import { HelpCircle } from 'lucide-react'

export function NotFoundView() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between px-4 py-12">
      <div className="w-full max-w-[400px] mx-auto flex-1 flex flex-col justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-500">
          <HelpCircle className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <h1 className="text-2xl font-bold leading-tight text-gray-900">
          Tag Not Found
        </h1>
        <div className="w-8 border-b border-orange-500 mx-auto mt-2 mb-3" />
        <p className="text-base text-gray-500 max-w-xs mx-auto">
          This tag has not been registered yet. Please contact support.
        </p>
      </div>

      <footer className="text-center pt-8">
        <p className="text-xs text-gray-400 tracking-wide">
          Powered by Verto
        </p>
      </footer>
    </div>
  )
}
