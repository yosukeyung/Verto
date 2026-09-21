import Link from 'next/link'

interface NavbarProps {
  rightAction?: React.ReactNode
}

export function Navbar({ rightAction }: NavbarProps) {
  return (
    <header className="h-14 border-b border-gray-200 bg-white sticky top-0 z-30">
      <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-lg font-bold tracking-tight text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded"
        >
          Verto
        </Link>
        {rightAction ? (
          <div>{rightAction}</div>
        ) : null}
      </div>
    </header>
  )
}
