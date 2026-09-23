import Link from 'next/link'
import Image from 'next/image'

interface NavbarProps {
  rightAction?: React.ReactNode
}

export function Navbar({ rightAction }: NavbarProps) {
  return (
    <header className="h-14 border-b border-gray-200 bg-white sticky top-0 z-30">
      <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded"
        >
          <Image
            src="/logo.png"
            alt="Verto"
            width={120}
            height={38}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>
        {rightAction ? (
          <div>{rightAction}</div>
        ) : null}
      </div>
    </header>
  )
}
