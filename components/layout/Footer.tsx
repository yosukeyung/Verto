import Link from 'next/link'

interface FooterProps {
  className?: string
  supportHref?: string
}

export function Footer({
  className = '',
  supportHref = '/support?from=%2F',
}: FooterProps) {
  return (
    <footer
      className={`w-full border-t border-gray-100 bg-white dark:border-neutral-800 dark:bg-black py-6 transition-colors duration-150 ${className}`}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
        <p className="text-sm text-gray-600 dark:text-neutral-400">
          &copy; {new Date().getFullYear()} Verto.
        </p>

        <Link
          href={supportHref}
          className="inline-flex items-center min-h-11 px-1 text-sm text-gray-600 dark:text-neutral-400 transition-colors duration-150 hover:text-orange-600 dark:hover:text-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded"
        >
          Need help? Contact Support
        </Link>
      </div>
    </footer>
  )
}
