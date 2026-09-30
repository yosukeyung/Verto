interface FooterProps {
  phoneNumber?: string
  supportMessage?: string
  className?: string
}

export function Footer({
  phoneNumber = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '6281234567890',
  supportMessage = 'Hello Verto Support, I need help with...',
  className = '',
}: FooterProps) {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
  const waSupportUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    supportMessage
  )}`

  return (
    <footer
      className={`w-full border-t border-gray-100 bg-white py-6 ${className}`}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Verto.
        </p>

        <a
          href={waSupportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 transition-colors duration-150 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
        >
          Need help? Contact Support
        </a>
      </div>
    </footer>
  )
}
