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
      className={`w-full border-t border-gray-100 bg-white dark:border-neutral-800 dark:bg-black py-3 sm:py-4 transition-colors duration-150 ${className}`}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 text-xs">
        <p className="shrink-0 whitespace-nowrap text-gray-600 dark:text-neutral-400">
          &copy; {new Date().getFullYear()} Verto.
        </p>

        <Link
          href={supportHref}
          className="relative inline-flex items-center whitespace-nowrap py-1.5 text-right text-gray-600 dark:text-neutral-400 transition-colors duration-150 hover:text-orange-600 dark:hover:text-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded before:absolute before:-inset-y-2 before:-inset-x-1"
        >
          Need help? Contact Support
        </Link>
      </div>
    </footer>
  )
}
