'use client'

import React, { useState } from 'react'
import { MessageSquare, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

export interface PurchaseFormProps {
  phoneNumber?: string
  className?: string
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  phoneNumber = '628XXXXXXXXXX',
  className = '',
}) => {
  const [name, setName] = useState('')
  const [product, setProduct] = useState<'NFC Anti-Metal Sticker' | 'ABS Coin Keychain'>(
    'NFC Anti-Metal Sticker'
  )
  const [quantity, setQuantity] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName || quantity < 1) {
      return
    }

    setIsSubmitting(true)

    // Dynamic WhatsApp message template
    const rawMessage = `Halo Verto, saya ${trimmedName}. Saya ingin membeli ${quantity} ${product}. Apakah stoknya tersedia?`
    const encodedMessage = encodeURIComponent(rawMessage)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

    // Open WhatsApp in a new tab
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank')
    }

    setTimeout(() => {
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div
      className={`w-full max-w-md mx-auto bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-6 sm:p-8 ${className}`.trim()}
    >
      {/* Form Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/60 mb-3">
          <Zap className="w-3.5 h-3.5 text-[#FF5C00]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#FF5C00]">
            Direct Order
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
          Get Your Verto Tag
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          Instant checkout via WhatsApp. Zero friction, no account required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div>
          <label
            htmlFor="customer-name"
            className="block text-xs font-semibold tracking-wide text-neutral-900 uppercase mb-2"
          >
            Your Name <span className="text-[#FF5C00]">*</span>
          </label>
          <input
            id="customer-name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Budi Santoso"
            className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 transition-all duration-150"
          />
        </div>

        {/* Product Selection */}
        <div>
          <label
            htmlFor="product-choice"
            className="block text-xs font-semibold tracking-wide text-neutral-900 uppercase mb-2"
          >
            Product Choice <span className="text-[#FF5C00]">*</span>
          </label>
          <div className="relative">
            <select
              id="product-choice"
              name="product"
              required
              value={product}
              onChange={(e) =>
                setProduct(
                  e.target.value as 'NFC Anti-Metal Sticker' | 'ABS Coin Keychain'
                )
              }
              className="w-full h-11 px-3.5 pr-10 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm appearance-none focus:outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 transition-all duration-150 cursor-pointer"
            >
              <option value="NFC Anti-Metal Sticker">
                NFC Anti-Metal Sticker
              </option>
              <option value="ABS Coin Keychain">ABS Coin Keychain</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Quantity Field */}
        <div>
          <label
            htmlFor="order-quantity"
            className="block text-xs font-semibold tracking-wide text-neutral-900 uppercase mb-2"
          >
            Quantity <span className="text-[#FF5C00]">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              id="order-quantity"
              name="quantity"
              type="number"
              min="1"
              max="999"
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm focus:outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 transition-all duration-150"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="w-full h-12 mt-2 px-5 rounded-xl bg-[#FF5C00] hover:bg-[#E05200] active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-150 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          <span>Order via WhatsApp</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Reassurance Footer */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified direct support • Instant reply</span>
        </div>
      </form>
    </div>
  )
}

export default PurchaseForm
